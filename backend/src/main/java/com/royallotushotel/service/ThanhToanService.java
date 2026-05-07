package com.royallotushotel.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.GiaoDichThanhToan;
import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.entity.ThanhToan;
import com.royallotushotel.hangso.LoaiGiaoDichThanhToan;
import com.royallotushotel.hangso.MaPhuongThucThanhToan;
import com.royallotushotel.hangso.MaTrangThaiThanhToan;
import com.royallotushotel.hangso.MaVaiTro;
import com.royallotushotel.payment.PayOsKySo;
import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.ThanhToanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

    private final DatPhongRepository datPhongRepository;
    private final KhachHangRepository khachHangRepository;
    private final ThanhToanRepository thanhToanRepository;
    private final DatPhongService datPhongService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${payment.payos.client-id:}")
    private String payOsClientId;
    @Value("${payment.payos.api-key:}")
    private String payOsApiKey;
    @Value("${payment.payos.checksum-key:}")
    private String payOsChecksumKey;
    @Value("${payment.payos.api-url:https://api-merchant.payos.vn}")
    private String payOsApiUrl;
    @Value("${payment.payos.che-do-thu:false}")
    private boolean payOsCheDoThu;
    @Value("${payment.payos.ty-le-coc-phan-tram:30}")
    private int tyLeCocPhanTram;

    @Transactional
    public String taoUrlThanhToanPayOs(
            Long idDatPhong,
            String urlTroVe,
            String urlHuy,
            String cheDoThanhToan) {
        String cheDo = "DAT_COC".equalsIgnoreCase(
                cheDoThanhToan != null ? cheDoThanhToan.trim() : "")
                ? "DAT_COC"
                : "TOAN_BO";
        datPhongRepository.findById(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
        BigDecimal tongTien = datPhongService.tinhTongTien(idDatPhong);
        if (tongTien == null || tongTien.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền không hợp lệ");
        }
        datPhongService.capNhatTongThanhToan(idDatPhong);

        if (payOsCheDoThu) {
            xacNhanThanhToan(idDatPhong, MaPhuongThucThanhToan.CONG_PAYOS, "CHE_DO_THU");
            return noiQuery(urlTroVe, "idDatPhong=" + idDatPhong + "&payosCheDoThu=1");
        }

        if (payOsClientId == null || payOsClientId.isBlank()
                || payOsApiKey == null || payOsApiKey.isBlank()
                || payOsChecksumKey == null || payOsChecksumKey.isBlank()) {
            throw new RuntimeException(
                    "Chưa cấu hình payOS: đặt PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY hoặc bật payment.payos.che-do-thu=true để chạy local.");
        }

        ThanhToan tt = thanhToanRepository.findByDatPhong_Id(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không có bản ghi thanh toán cho đặt phòng"));
        BigDecimal conPhai = tt.getConPhaiThu() != null ? tt.getConPhaiThu() : tongTien;
        if (conPhai.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Đơn không còn số tiền cần thu");
        }

        BigDecimal soTienThu;
        if ("DAT_COC".equals(cheDo)) {
            soTienThu = tinhSoTienCocTheoTong(tongTien);
            if (soTienThu.compareTo(conPhai) > 0) {
                soTienThu = conPhai;
            }
        } else {
            soTienThu = conPhai;
        }

        long amountVnd = soTienThu.setScale(0, RoundingMode.HALF_UP).longValue();
        if (amountVnd < 1_000L) {
            throw new RuntimeException("Số tiền thanh toán quá nhỏ (tối thiểu 1.000 VND)");
        }

        int orderCode = taoMaDonPayOs();
        String moTa = moTaNgan(idDatPhong);
        String chuKy = PayOsKySo.taoChuKyTaoLinkThanhToan(
                amountVnd,
                urlHuy,
                moTa,
                orderCode,
                urlTroVe,
                payOsChecksumKey.trim()
        );

        tt.setPayosOrderCode(orderCode);
        tt.setPhuongThuc(MaPhuongThucThanhToan.CONG_PAYOS);
        thanhToanRepository.save(tt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-client-id", payOsClientId.trim());
        headers.set("x-api-key", payOsApiKey.trim());

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("orderCode", orderCode);
        body.put("amount", amountVnd);
        body.put("description", moTa);
        body.put("cancelUrl", urlHuy);
        body.put("returnUrl", urlTroVe);
        body.put("signature", chuKy);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        String urlApi = payOsApiUrl.replaceAll("/+$", "") + "/v2/payment-requests";

        try {
            String json = restTemplate.postForObject(urlApi, entity, String.class);
            JsonNode root = objectMapper.readTree(json != null ? json : "{}");
            if (!"00".equals(root.path("code").asText())) {
                throw new RuntimeException("payOS: " + root.path("desc").asText("Lỗi tạo link thanh toán"));
            }
            String checkout = root.path("data").path("checkoutUrl").asText(null);
            if (checkout == null || checkout.isBlank()) {
                throw new RuntimeException("payOS không trả về checkoutUrl");
            }
            return checkout;
        } catch (org.springframework.web.client.RestClientException e) {
            throw new RuntimeException("Gọi API payOS thất bại: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Xử lý phản hồi payOS thất bại: " + e.getMessage(), e);
        }
    }

    private BigDecimal tinhSoTienCocTheoTong(BigDecimal tongTienKy) {
        int tl = tyLeCocPhanTram;
        if (tl <= 0 || tl >= 100) {
            return tongTienKy;
        }
        BigDecimal tyLe = BigDecimal.valueOf(tl).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal coc = tongTienKy.multiply(tyLe).setScale(0, RoundingMode.CEILING);
        if (coc.compareTo(BigDecimal.valueOf(1_000L)) < 0) {
            coc = BigDecimal.valueOf(1_000L);
        }
        return coc;
    }

    private static String noiQuery(String base, String them) {
        if (base.contains("?")) return base + "&" + them;
        return base + "?" + them;
    }

    private int taoMaDonPayOs() {
        int code;
        int thu = 0;
        do {
            code = ThreadLocalRandom.current().nextInt(100_000_000, Integer.MAX_VALUE);
            thu++;
            if (thu > 40) {
                code = (int) (System.currentTimeMillis() % Integer.MAX_VALUE);
                if (code < 0) code = -code;
                break;
            }
        } while (thanhToanRepository.existsByPayosOrderCode(code));
        return code;
    }

    private static String moTaNgan(Long idDatPhong) {
        String s = "DP" + idDatPhong;
        return s.length() <= 9 ? s : s.substring(0, 9);
    }

    @Transactional
    public void ghiNhanThanhToan(
            Long idDatPhong,
            String cong,
            String maGiaoDich,
            BigDecimal soTienLanNay) {
        if (soTienLanNay == null || soTienLanNay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền thanh toán không hợp lệ");
        }
        DatPhong dp = datPhongRepository.timVaKhoaTheoId(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
        ThanhToan tt0 = thanhToanRepository.findByDatPhong_Id(idDatPhong).orElse(null);
        if (tt0 != null && MaTrangThaiThanhToan.DA_THANH_TOAN.equals(tt0.getTrangThai())) {
            return;
        }
        if (tt0 != null && maGiaoDich != null && !maGiaoDich.isBlank()) {
            for (GiaoDichThanhToan gd : tt0.getGiaoDich()) {
                if (maGiaoDich.equals(gd.getMaGiaoDich())) {
                    return;
                }
            }
        }

        BigDecimal tongTien = datPhongService.tinhTongTien(idDatPhong);
        ThanhToan tt = tt0;
        if (tt == null) {
            tt = ThanhToan.builder()
                    .datPhong(dp)
                    .tongPhaiThu(tongTien)
                    .tongDaThu(BigDecimal.ZERO)
                    .tongHoan(BigDecimal.ZERO)
                    .conPhaiThu(tongTien)
                    .trangThai(MaTrangThaiThanhToan.CHUA_THANH_TOAN)
                    .thoiDiemThanhToan(LocalDateTime.now())
                    .build();
            tt = thanhToanRepository.save(tt);
        }

        datPhongService.capNhatTongThanhToan(idDatPhong);
        tt = thanhToanRepository.findByDatPhong_Id(idDatPhong).orElseThrow();
        BigDecimal conPhai = tt.getConPhaiThu() != null ? tt.getConPhaiThu() : tongTien;
        if (conPhai.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal thu = soTienLanNay.min(conPhai);
        BigDecimal daThuCu = tt.getTongDaThu() != null ? tt.getTongDaThu() : BigDecimal.ZERO;
        BigDecimal daThuMoi = daThuCu.add(thu);
        tt.setTongDaThu(daThuMoi);

        BigDecimal tongSau = datPhongService.tinhTongTien(idDatPhong);
        boolean du = daThuMoi.compareTo(tongSau) >= 0;
        String loaiGd = du ? LoaiGiaoDichThanhToan.THANH_TOAN : LoaiGiaoDichThanhToan.DAT_COC;
        GiaoDichThanhToan gd = GiaoDichThanhToan.builder()
                .thanhToan(tt)
                .maGiaoDich(maGiaoDich != null ? maGiaoDich : "")
                .loaiGiaoDich(loaiGd)
                .soTien(thu)
                .trangThai(MaTrangThaiThanhToan.DA_THANH_TOAN)
                .phuongThuc(cong)
                .congThanhToan(cong)
                .thamChieuCong(maGiaoDich != null ? maGiaoDich : "")
                .ghiChu(du ? "Thanh toán đặt phòng qua payOS" : "Đặt cọc đặt phòng qua payOS")
                .build();
        tt.getGiaoDich().add(gd);
        tt.setPayosOrderCode(null);
        thanhToanRepository.save(tt);
        datPhongService.capNhatTongThanhToan(idDatPhong);
        datPhongService.xacNhanDatPhong(idDatPhong);
    }

    @Transactional
    public void xacNhanThanhToan(Long idDatPhong, String cong, String maGiaoDich) {
        ThanhToan tt0 = thanhToanRepository.findByDatPhong_Id(idDatPhong).orElse(null);
        if (tt0 != null && MaTrangThaiThanhToan.DA_THANH_TOAN.equals(tt0.getTrangThai())) {
            return;
        }
        datPhongService.capNhatTongThanhToan(idDatPhong);
        ThanhToan tt = thanhToanRepository.findByDatPhong_Id(idDatPhong).orElse(null);
        BigDecimal conPhai = tt != null && tt.getConPhaiThu() != null
                ? tt.getConPhaiThu()
                : datPhongService.tinhTongTien(idDatPhong);
        if (conPhai.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        ghiNhanThanhToan(idDatPhong, cong, maGiaoDich, conPhai);
    }

    @Transactional
    public void xuLyWebhookPayOs(JsonNode root) {
        if (payOsChecksumKey == null || payOsChecksumKey.isBlank()) {
            throw new RuntimeException("Chưa cấu hình payment.payos.checksum-key");
        }
        JsonNode data = root.get("data");
        if (data == null || data.isNull()) {
            return;
        }
        String sig = root.path("signature").asText("");
        if (!PayOsKySo.xacThucDuLieuWebhook(data, sig, payOsChecksumKey.trim())) {
            throw new RuntimeException("Chữ ký webhook payOS không hợp lệ");
        }
        if (!root.path("success").asBoolean(false) || !"00".equals(root.path("code").asText())) {
            return;
        }
        int orderCode = data.path("orderCode").asInt(0);
        if (orderCode == 0) return;

        long amountVnd = data.path("amount").asLong(0L);
        if (amountVnd <= 0L) {
            throw new RuntimeException("Webhook payOS thiếu hoặc sai số tiền (amount)");
        }

        ThanhToan tt = thanhToanRepository.findByPayosOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thanh toán payOS: " + orderCode));
        Long idDatPhong = tt.getDatPhong().getId();
        String idem = "PAYOS-" + orderCode;
        ghiNhanThanhToan(
                idDatPhong,
                MaPhuongThucThanhToan.CONG_PAYOS,
                idem,
                BigDecimal.valueOf(amountVnd));
    }

    @Transactional
    public Map<String, Object> dongBoSauRedirectPayOs(
            Long idDatPhong,
            int orderCode,
            String paymentLinkId,
            ChuTheNguoiDung chuThe) {
        if (payOsCheDoThu) {
            return Map.of(
                    "trangThai", "CHE_DO_THU",
                    "thongDiep", "Chế độ thử: đơn đã được xác nhận khi tạo link.");
        }
        if (paymentLinkId == null || paymentLinkId.isBlank()) {
            throw new RuntimeException("Thiếu mã link thanh toán PayOS (id)");
        }
        if (payOsClientId == null || payOsClientId.isBlank()
                || payOsApiKey == null || payOsApiKey.isBlank()
                || payOsChecksumKey == null || payOsChecksumKey.isBlank()) {
            throw new RuntimeException("Chưa cấu hình payOS");
        }

        DatPhong dp = datPhongRepository.findById(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đặt phòng"));
        if (!laNhanVienDongBoPayOs(chuThe)) {
            KhachHang kh = khachHangRepository.findByNguoiDung_Id(chuThe.getId())
                    .orElseThrow(() -> new RuntimeException("Chỉ tài khoản khách mới đồng bộ được thanh toán."));
            if (!dp.getKhachHang().getId().equals(kh.getId())) {
                throw new RuntimeException("Đơn đặt phòng không thuộc tài khoản hiện tại.");
            }
        }

        JsonNode root = goiLayThongTinLinkPayOs(paymentLinkId.trim());
        JsonNode data = root.get("data");
        int ocApi = data.path("orderCode").asInt(0);
        if (ocApi != orderCode) {
            throw new RuntimeException("Dữ liệu payOS không khớp mã đơn.");
        }

        ThanhToan tt = thanhToanRepository.findByDatPhong_Id(idDatPhong)
                .orElseThrow(() -> new RuntimeException("Không có bản ghi thanh toán"));
        if (tt.getPayosOrderCode() != null && !tt.getPayosOrderCode().equals(orderCode)) {
            throw new RuntimeException("Mã payOS không khớp với đơn đang chờ thanh toán.");
        }

        String st = data.path("status").asText("");
        long amountPaid = data.path("amountPaid").asLong(0L);

        if (("CANCELLED".equalsIgnoreCase(st) || "CANCELED".equalsIgnoreCase(st)) && amountPaid <= 0L) {
            return Map.of(
                    "trangThai", "DA_HUY_TREN_CONG",
                    "thongDiep", "Giao dịch đã hủy trên cổng PayOS.");
        }

        if (amountPaid <= 0L) {
            return Map.of(
                    "trangThai", "CHO_THANH_TOAN",
                    "thongDiep", "Chưa ghi nhận khoản thanh toán. Hệ thống sẽ cập nhật khi PayOS xử lý xong.");
        }

        String idem = "PAYOS-" + orderCode;
        ghiNhanThanhToan(
                idDatPhong,
                MaPhuongThucThanhToan.CONG_PAYOS,
                idem,
                BigDecimal.valueOf(amountPaid));
        return Map.of(
                "trangThai", "DA_GHI_NHAN",
                "thongDiep", "Đã ghi nhận thanh toán.");
    }

    private boolean laNhanVienDongBoPayOs(ChuTheNguoiDung chuThe) {
        return chuThe.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> MaVaiTro.LE_TAN.equals(r) || MaVaiTro.QUAN_TRI.equals(r));
    }

    private JsonNode goiLayThongTinLinkPayOs(String paymentLinkId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", payOsClientId.trim());
        headers.set("x-api-key", payOsApiKey.trim());
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        String base = payOsApiUrl.replaceAll("/+$", "");
        String url = base + "/v2/payment-requests/" + paymentLinkId;
        try {
            ResponseEntity<String> res = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String raw = res.getBody();
            JsonNode root = objectMapper.readTree(raw != null ? raw : "{}");
            if (!"00".equals(root.path("code").asText())) {
                throw new RuntimeException("payOS: " + root.path("desc").asText("Không lấy được trạng thái link"));
            }
            JsonNode data = root.get("data");
            if (data == null || data.isNull()) {
                throw new RuntimeException("payOS không trả về data");
            }
            String sig = root.path("signature").asText("");
            if (!PayOsKySo.xacThucDuLieuWebhook(data, sig, payOsChecksumKey.trim())) {
                throw new RuntimeException("Chữ ký phản hồi payOS không hợp lệ");
            }
            return root;
        } catch (org.springframework.web.client.RestClientException e) {
            throw new RuntimeException("Gọi payOS thất bại: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Xử lý phản hồi payOS thất bại: " + e.getMessage(), e);
        }
    }
}
