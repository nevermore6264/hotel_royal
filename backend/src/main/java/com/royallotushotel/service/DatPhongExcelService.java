package com.royallotushotel.service;

import com.royallotushotel.dto.DongKetQuaNhapExcelDatPhongDto;
import com.royallotushotel.dto.DatPhongDto;
import com.royallotushotel.dto.KetQuaNhapExcelDatPhongDto;
import com.royallotushotel.dto.YeuCauTaoDatPhong;
import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.entity.Phong;
import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.LoaiPhongRepository;
import com.royallotushotel.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatPhongExcelService {

    private static final int MAX_DONG = 100;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("d/M/uuuu");
    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final DatPhongService datPhongService;
    private final PhongRepository phongRepository;
    private final KhachHangRepository khachHangRepository;
    private final LoaiPhongRepository loaiPhongRepository;
    private final DataFormatter dataFormatter = new DataFormatter();

    public byte[] taoMauLeTan() throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("Đặt phòng");
            Row h = sh.createRow(0);
            String[] cols = {
                    "Số phòng (để trống = chọn ngẫu nhiên)",
                    "Ngày nhận phòng",
                    "Ngày trả phòng",
                    "Mã khách (tùy chọn)",
                    "Họ và tên",
                    "Số điện thoại",
                    "Email",
                    "Loại phòng — mã hoặc tên (khi không ghi số phòng)",
            };
            for (int i = 0; i < cols.length; i++) {
                h.createCell(i).setCellValue(cols[i]);
            }
            for (int i = 0; i < cols.length; i++) {
                sh.autoSizeColumn(i);
            }
            wb.write(bos);
            return bos.toByteArray();
        }
    }

    public byte[] taoMauKhach() throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("Đặt phòng");
            Row h = sh.createRow(0);
            String[] cols = {
                    "Số phòng (để trống = chọn ngẫu nhiên)",
                    "Ngày nhận phòng",
                    "Ngày trả phòng",
                    "Họ và tên",
                    "Số điện thoại",
                    "Email",
                    "Loại phòng — mã hoặc tên (khi không ghi số phòng)",
            };
            for (int i = 0; i < cols.length; i++) {
                h.createCell(i).setCellValue(cols[i]);
            }
            for (int i = 0; i < cols.length; i++) {
                sh.autoSizeColumn(i);
            }
            wb.write(bos);
            return bos.toByteArray();
        }
    }

    @Transactional
    public KetQuaNhapExcelDatPhongDto nhapLeTan(MultipartFile tep) throws IOException {
        kiemTraTep(tep);
        try (InputStream in = tep.getInputStream(); Workbook wb = new XSSFWorkbook(in)) {
            return xuLySheet(wb.getSheetAt(0), true, null);
        }
    }

    @Transactional
    public KetQuaNhapExcelDatPhongDto nhapKhach(MultipartFile tep, Long idKhachHang) throws IOException {
        kiemTraTep(tep);
        if (idKhachHang == null) {
            throw new RuntimeException("Tài khoản chưa gắn hồ sơ khách hàng.");
        }
        try (InputStream in = tep.getInputStream(); Workbook wb = new XSSFWorkbook(in)) {
            return xuLySheet(wb.getSheetAt(0), false, idKhachHang);
        }
    }

    private void kiemTraTep(MultipartFile tep) {
        if (tep == null || tep.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn file Excel (.xlsx).");
        }
        String name = tep.getOriginalFilename() != null ? tep.getOriginalFilename().toLowerCase() : "";
        if (!name.endsWith(".xlsx")) {
            throw new RuntimeException("Chỉ chấp nhận file .xlsx (Excel 2007 trở lên).");
        }
    }

    private Long giaiQuyetIdKhachLeTan(Long idTuExcel, String hoTen, String sdt, String email) {
        if (idTuExcel != null) {
            if (khachHangRepository.findById(idTuExcel).isEmpty()) {
                throw new RuntimeException("Không tìm thấy khách với mã đã nhập.");
            }
            return idTuExcel;
        }
        Optional<KhachHang> theoSdt = timMotKhachTheoSoDienThoai(sdt);
        Optional<KhachHang> theoEmail = email != null && !email.isBlank()
                ? khachHangRepository.findFirstByEmailIgnoreCase(email.trim())
                : Optional.empty();
        if (theoSdt.isPresent() && theoEmail.isPresent()
                && !theoSdt.get().getId().equals(theoEmail.get().getId())) {
            throw new RuntimeException(
                    "Số điện thoại và email trỏ tới hai khách khác nhau — hãy điền cột \"Mã khách (tùy chọn)\".");
        }
        if (theoSdt.isPresent()) {
            return theoSdt.get().getId();
        }
        if (theoEmail.isPresent()) {
            return theoEmail.get().getId();
        }
        if (hoTen == null || hoTen.isBlank()) {
            throw new RuntimeException(
                    "Chưa có mã khách: cần họ tên (và số điện thoại hoặc email) để hệ thống tìm hoặc tạo hồ sơ khách.");
        }
        if ((sdt == null || sdt.isBlank()) && (email == null || email.isBlank())) {
            throw new RuntimeException(
                    "Chưa có mã khách: nhập thêm số điện thoại hoặc email để tạo hồ sơ khách mới.");
        }
        KhachHang moi = KhachHang.builder()
                .hoTen(hoTen.trim())
                .soDienThoai(sdt != null ? sdt.trim() : null)
                .email(email != null ? email.trim() : null)
                .build();
        return khachHangRepository.save(moi).getId();
    }

    private Optional<KhachHang> timMotKhachTheoSoDienThoai(String sdt) {
        if (sdt == null || sdt.isBlank()) {
            return Optional.empty();
        }
        Set<Long> idTimDuoc = new LinkedHashSet<>();
        for (String c : taoUngVienSoDienThoai(sdt.trim())) {
            for (KhachHang k : khachHangRepository.findBySoDienThoai(c)) {
                idTimDuoc.add(k.getId());
            }
        }
        if (idTimDuoc.size() > 1) {
            throw new RuntimeException(
                    "Nhiều khách trùng số điện thoại — hãy điền cột \"Mã khách (tùy chọn)\" để chọn đúng người.");
        }
        if (idTimDuoc.size() == 1) {
            return khachHangRepository.findById(idTimDuoc.iterator().next());
        }
        return Optional.empty();
    }

    private Set<String> taoUngVienSoDienThoai(String raw) {
        Set<String> s = new LinkedHashSet<>();
        s.add(raw);
        String digits = raw.replaceAll("\\D", "");
        if (!digits.isEmpty()) {
            s.add(digits);
            if (digits.startsWith("84") && digits.length() >= 10) {
                s.add("0" + digits.substring(2));
            }
            if (digits.length() == 10 && digits.startsWith("0")) {
                s.add(digits.substring(1));
            }
            if (digits.length() == 9 && digits.startsWith("9")) {
                s.add("0" + digits);
            }
        }
        return s;
    }

    private static final String LOI_KHONG_DU_PHONG_LOAI =
            "Không đủ phòng trống theo loại đã chọn trong khoảng ngày này.";

    private Long giaiQuyetIdPhong(
            String soPhongGoc,
            String loaiPhongGoc,
            LocalDate nhan,
            LocalDate tra,
            Set<Long> idPhongDaGanTrongLuot) {
        String sp = rongLaNull(soPhongGoc);
        if (sp != null && !sp.isBlank()) {
            Optional<Phong> optP = phongRepository.findBySoPhong(sp.trim());
            if (optP.isEmpty()) {
                throw new RuntimeException("Không tìm thấy phòng: " + sp.trim());
            }
            Long id = optP.get().getId();
            if (idPhongDaGanTrongLuot.contains(id)) {
                throw new RuntimeException(
                        "Phòng " + sp.trim() + " đã được chọn cho dòng khác trong cùng file — hãy đổi phòng hoặc loại.");
            }
            List<Phong> trong = phongRepository.timPhongTrong(nhan, tra);
            boolean conTrong = trong.stream().anyMatch(p -> id.equals(p.getId()));
            if (!conTrong) {
                throw new RuntimeException(
                        "Phòng " + sp.trim() + " không còn trống trong khoảng ngày đã chọn.");
            }
            idPhongDaGanTrongLuot.add(id);
            return id;
        }
        String lpRaw = rongLaNull(loaiPhongGoc);
        if (lpRaw == null) {
            throw new RuntimeException(
                    "Cần số phòng cụ thể, hoặc để trống số phòng và điền cột loại phòng (mã số hoặc đúng tên loại) để hệ thống chọn ngẫu nhiên một phòng trống.");
        }
        Long idLoai = layLongTuChuoiSo(lpRaw);
        if (idLoai != null) {
            if (loaiPhongRepository.findById(idLoai).isEmpty()) {
                throw new RuntimeException("Không tìm thấy loại phòng với mã: " + idLoai);
            }
        } else {
            List<LoaiPhong> ds = loaiPhongRepository.findByTenIgnoreCase(lpRaw.trim());
            if (ds.isEmpty()) {
                throw new RuntimeException("Không tìm thấy loại phòng: " + lpRaw.trim());
            }
            if (ds.size() > 1) {
                throw new RuntimeException(
                        "Có nhiều loại phòng trùng tên — hãy điền mã loại phòng (số) thay vì tên.");
            }
            idLoai = ds.get(0).getId();
        }
        List<Phong> trong = phongRepository.timPhongTrong(nhan, tra);
        Long finalIdLoai = idLoai;
        List<Phong> hopLe = trong.stream()
                .filter(p -> p.getLoaiPhong() != null && finalIdLoai.equals(p.getLoaiPhong().getId()))
                .filter(p -> !idPhongDaGanTrongLuot.contains(p.getId()))
                .collect(Collectors.toList());
        if (hopLe.isEmpty()) {
            throw new RuntimeException(LOI_KHONG_DU_PHONG_LOAI);
        }
        Collections.shuffle(hopLe, ThreadLocalRandom.current());
        Long id = hopLe.get(0).getId();
        idPhongDaGanTrongLuot.add(id);
        return id;
    }

    private String goiYLoaiPhongConTrong(LocalDate nhan, LocalDate tra) {
        List<Phong> trong = phongRepository.timPhongTrong(nhan, tra);
        if (trong.isEmpty()) {
            return "Trong khoảng "
                    + nhan.format(DD_MM_YYYY)
                    + " → "
                    + tra.format(DD_MM_YYYY)
                    + " hiện chưa còn phòng trống.";
        }
        Map<String, Long> demLoai = new HashMap<>();
        for (Phong p : trong) {
            if (p.getLoaiPhong() == null) {
                continue;
            }
            String ten = p.getLoaiPhong().getTen();
            demLoai.merge(ten, 1L, Long::sum);
        }
        if (demLoai.isEmpty()) {
            return "Còn phòng trống nhưng chưa phân loại — liên hệ lễ tân.";
        }
        return demLoai.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(String.CASE_INSENSITIVE_ORDER))
                .map(e -> e.getKey() + " (" + e.getValue() + " phòng)")
                .collect(Collectors.joining(", "));
    }

    private boolean laLoiThieuPhong(String msg) {
        return msg != null
                && (msg.contains(LOI_KHONG_DU_PHONG_LOAI)
                        || msg.contains("Không còn phòng trống")
                        || msg.contains("không còn trống"));
    }

    private record HangChuanBi(
            int soDongExcel,
            Row row,
            LocalDate nhan,
            LocalDate tra,
            Long idKhachHang,
            String hoTen,
            String sdt,
            String email,
            Long idPhong,
            String hoTenDong,
            String lienHeDong,
            String yeuCauPhongNgayDong) {}

    private Long layLongTuChuoiSo(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        String t = s.trim().replace(",", ".");
        try {
            return Long.parseLong(t.replaceAll("\\.0$", ""));
        } catch (NumberFormatException e) {
            try {
                return (long) Double.parseDouble(t);
            } catch (NumberFormatException e2) {
                return null;
            }
        }
    }

    private String ghepLienHeTuFile(String rawSdt, String rawEmail) {
        String s = rongLaNull(rawSdt);
        String e = rongLaNull(rawEmail);
        if (s == null && e == null) {
            return "—";
        }
        if (s != null && e != null) {
            return s + " · " + e;
        }
        return s != null ? s : e;
    }

    private String ghepYeuCauPhongNgayTuFile(String rawSoPhong, String rawLoai, LocalDate nhan, LocalDate tra) {
        String sp = rawSoPhong != null ? rawSoPhong.trim() : "";
        String lr = rawLoai != null ? rawLoai.trim() : "";
        String ph;
        if (!sp.isBlank()) {
            ph = "Số phòng: " + sp;
        } else if (!lr.isBlank()) {
            ph = "Theo loại: " + lr;
        } else {
            ph = "(chưa ghi số phòng / loại)";
        }
        if (nhan != null && tra != null) {
            return ph + " · " + nhan.format(DD_MM_YYYY) + " → " + tra.format(DD_MM_YYYY);
        }
        return ph + " · (ngày nhận/trả chưa hợp lệ)";
    }

    private String laySoPhongDaGanTuDto(DatPhongDto dto) {
        if (dto.getChiTiet() == null || dto.getChiTiet().isEmpty()) {
            return null;
        }
        return dto.getChiTiet().get(0).getSoPhong();
    }

    private void dienTomTatTuHang(
            DongKetQuaNhapExcelDatPhongDto.DongKetQuaNhapExcelDatPhongDtoBuilder b, Row row, boolean laLeTan) {
        int colLoaiPhong = laLeTan ? 7 : 6;
        String rawHoTen = layChuoi(row, laLeTan ? 4 : 3);
        String rawSdt = layChuoi(row, laLeTan ? 5 : 4);
        String rawEmail = layChuoi(row, laLeTan ? 6 : 5);
        String rawSoPhong = layChuoi(row, 0);
        String rawLoai = layChuoi(row, colLoaiPhong);
        LocalDate nhan = layNgay(row, 1);
        LocalDate tra = layNgay(row, 2);
        b.hoTenDong(rawHoTen.isBlank() ? "—" : rawHoTen.trim())
                .lienHeDong(ghepLienHeTuFile(rawSdt, rawEmail))
                .yeuCauPhongNgayDong(ghepYeuCauPhongNgayTuFile(rawSoPhong, rawLoai, nhan, tra));
    }

    private KetQuaNhapExcelDatPhongDto xuLySheet(Sheet sheet, boolean laLeTan, Long idKhachHangCd) {
        List<DongKetQuaNhapExcelDatPhongDto> chiTiet = new ArrayList<>();
        List<HangChuanBi> hangHopLe = new ArrayList<>();
        Set<Long> idPhongDaGanTrongLuot = new HashSet<>();
        int tongHang = 0;

        int last = sheet.getLastRowNum();
        for (int r = 1; r <= last; r++) {
            Row row = sheet.getRow(r);
            if (row == null || dongTrong(row, laLeTan)) {
                continue;
            }
            tongHang++;
            int excelRow = r + 1;
            if (tongHang > MAX_DONG) {
                var quaHan = DongKetQuaNhapExcelDatPhongDto.builder()
                        .soDongExcel(excelRow)
                        .thanhCong(false)
                        .loi("Vượt quá " + MAX_DONG + " dòng dữ liệu trong một lần tải lên.");
                dienTomTatTuHang(quaHan, row, laLeTan);
                chiTiet.add(quaHan.build());
                return ketQuaThatBaiNhom(tongHang, chiTiet, laLeTan);
            }

            String hoTenDong = "—";
            String lienHeDong = "—";
            String yeuCauPhongNgayDong = "—";
            try {
                int colLoaiPhong = laLeTan ? 7 : 6;
                String rawSoPhong = layChuoi(row, 0);
                String rawHoTen = layChuoi(row, laLeTan ? 4 : 3);
                String rawSdt = layChuoi(row, laLeTan ? 5 : 4);
                String rawEmail = layChuoi(row, laLeTan ? 6 : 5);
                String rawLoai = layChuoi(row, colLoaiPhong);
                LocalDate nhan = layNgay(row, 1);
                LocalDate tra = layNgay(row, 2);
                hoTenDong = rawHoTen.isBlank() ? "—" : rawHoTen.trim();
                lienHeDong = ghepLienHeTuFile(rawSdt, rawEmail);
                yeuCauPhongNgayDong = ghepYeuCauPhongNgayTuFile(rawSoPhong, rawLoai, nhan, tra);

                if (nhan == null || tra == null) {
                    throw new RuntimeException("Thiếu hoặc sai định dạng ngày nhận/trả.");
                }
                if (tra.isBefore(nhan)) {
                    throw new RuntimeException("Ngày trả không được trước ngày nhận.");
                }

                Long idKh;
                String hoTen;
                String sdt;
                String email;
                if (laLeTan) {
                    Long idTuExcel = layLong(row, 3);
                    hoTen = rongLaNull(layChuoi(row, 4));
                    sdt = rongLaNull(layChuoi(row, 5));
                    email = rongLaNull(layChuoi(row, 6));
                    idKh = giaiQuyetIdKhachLeTan(idTuExcel, hoTen, sdt, email);
                } else {
                    idKh = idKhachHangCd;
                    hoTen = rongLaNull(layChuoi(row, 3));
                    sdt = rongLaNull(layChuoi(row, 4));
                    email = rongLaNull(layChuoi(row, 5));
                }

                Long idPhong = giaiQuyetIdPhong(
                        rawSoPhong, layChuoi(row, colLoaiPhong), nhan, tra, idPhongDaGanTrongLuot);
                hangHopLe.add(new HangChuanBi(
                        excelRow, row, nhan, tra, idKh, hoTen, sdt, email, idPhong,
                        hoTenDong, lienHeDong, yeuCauPhongNgayDong));
            } catch (RuntimeException ex) {
                String msg = ex.getMessage() != null ? ex.getMessage() : "Lỗi";
                String goiY = null;
                LocalDate nhan = layNgay(row, 1);
                LocalDate tra = layNgay(row, 2);
                if (nhan != null && tra != null && laLoiThieuPhong(msg)) {
                    goiY = goiYLoaiPhongConTrong(nhan, tra);
                }
                chiTiet.add(DongKetQuaNhapExcelDatPhongDto.builder()
                        .soDongExcel(excelRow)
                        .thanhCong(false)
                        .loi(msg)
                        .goiYLoaiPhong(goiY)
                        .hoTenDong(hoTenDong)
                        .lienHeDong(lienHeDong)
                        .yeuCauPhongNgayDong(yeuCauPhongNgayDong)
                        .build());
            }
        }

        if (tongHang == 0) {
            return KetQuaNhapExcelDatPhongDto.builder()
                    .tongHang(0)
                    .soThanhCong(0)
                    .soThatBai(0)
                    .thongDiepTong("File không có dòng dữ liệu (chỉ có tiêu đề).")
                    .chiTiet(chiTiet)
                    .build();
        }

        if (chiTiet.size() > 0) {
            return ketQuaThatBaiNhom(tongHang, chiTiet, laLeTan);
        }

        if (!laLeTan) {
            LocalDate nhanChung = hangHopLe.get(0).nhan();
            LocalDate traChung = hangHopLe.get(0).tra();
            for (HangChuanBi h : hangHopLe) {
                if (!h.nhan().equals(nhanChung) || !h.tra().equals(traChung)) {
                    return KetQuaNhapExcelDatPhongDto.builder()
                            .tongHang(tongHang)
                            .soThanhCong(0)
                            .soThatBai(tongHang)
                            .thongDiepTong(
                                    "Đặt nhóm qua Excel cần cùng ngày nhận và ngày trả trên mọi dòng. "
                                            + "Hãy chỉnh file hoặc đặt từng đợt riêng trên trang Đặt phòng.")
                            .chiTiet(hangHopLe.stream()
                                    .map(hangChuanBi -> DongKetQuaNhapExcelDatPhongDto.builder()
                                            .soDongExcel(hangChuanBi.soDongExcel())
                                            .thanhCong(false)
                                            .loi("Ngày nhận/trả khác các dòng khác trong file.")
                                            .hoTenDong(hangChuanBi.hoTenDong())
                                            .lienHeDong(hangChuanBi.lienHeDong())
                                            .yeuCauPhongNgayDong(hangChuanBi.yeuCauPhongNgayDong())
                                            .build())
                                    .toList())
                            .build();
                }
            }
        }

        try {
            if (laLeTan) {
                for (HangChuanBi h : hangHopLe) {
                    YeuCauTaoDatPhong yc = new YeuCauTaoDatPhong();
                    yc.setIdKhachHang(h.idKhachHang());
                    yc.setNgayNhanPhong(h.nhan());
                    yc.setNgayTraPhong(h.tra());
                    yc.setIdPhong(List.of(h.idPhong()));
                    yc.setTenKhach(h.hoTen());
                    yc.setSdtKhach(h.sdt());
                    yc.setEmailKhach(h.email());
                    DatPhongDto dto = datPhongService.tao(yc);
                    chiTiet.add(DongKetQuaNhapExcelDatPhongDto.builder()
                            .soDongExcel(h.soDongExcel())
                            .thanhCong(true)
                            .idDatPhong(dto.getId())
                            .hoTenDong(h.hoTenDong())
                            .lienHeDong(h.lienHeDong())
                            .yeuCauPhongNgayDong(h.yeuCauPhongNgayDong())
                            .soPhongDaGan(laySoPhongDaGanTuDto(dto))
                            .build());
                }
                return KetQuaNhapExcelDatPhongDto.builder()
                        .tongHang(tongHang)
                        .soThanhCong(tongHang)
                        .soThatBai(0)
                        .chiTiet(chiTiet)
                        .build();
            }

            HangChuanBi dau = hangHopLe.get(0);
            List<Long> idPhongs = hangHopLe.stream().map(HangChuanBi::idPhong).toList();
            YeuCauTaoDatPhong yc = new YeuCauTaoDatPhong();
            yc.setIdKhachHang(dau.idKhachHang());
            yc.setNgayNhanPhong(dau.nhan());
            yc.setNgayTraPhong(dau.tra());
            yc.setIdPhong(idPhongs);
            yc.setTenKhach(dau.hoTen());
            yc.setSdtKhach(dau.sdt());
            yc.setEmailKhach(dau.email());
            DatPhongDto donNhom = datPhongService.tao(yc);

            for (HangChuanBi h : hangHopLe) {
                chiTiet.add(DongKetQuaNhapExcelDatPhongDto.builder()
                        .soDongExcel(h.soDongExcel())
                        .thanhCong(true)
                        .idDatPhong(donNhom.getId())
                        .hoTenDong(h.hoTenDong())
                        .lienHeDong(h.lienHeDong())
                        .yeuCauPhongNgayDong(h.yeuCauPhongNgayDong())
                        .soPhongDaGan(laySoPhongTheoId(donNhom, h.idPhong()))
                        .build());
            }
            return KetQuaNhapExcelDatPhongDto.builder()
                    .tongHang(tongHang)
                    .soThanhCong(tongHang)
                    .soThatBai(0)
                    .datTheoNhom(true)
                    .idDatPhongNhom(donNhom.getId())
                    .chiTiet(chiTiet)
                    .build();
        } catch (RuntimeException ex) {
            throw ex;
        }
    }

    private String laySoPhongTheoId(DatPhongDto dto, Long idPhong) {
        if (dto.getChiTiet() == null) {
            return null;
        }
        return dto.getChiTiet().stream()
                .filter(ct -> idPhong.equals(ct.getIdPhong()))
                .map(ct -> ct.getSoPhong())
                .findFirst()
                .orElse(null);
    }

    private KetQuaNhapExcelDatPhongDto ketQuaThatBaiNhom(
            int tongHang, List<DongKetQuaNhapExcelDatPhongDto> chiTiet, boolean laLeTan) {
        String goiYChung = chiTiet.stream()
                .map(DongKetQuaNhapExcelDatPhongDto::getGoiYLoaiPhong)
                .filter(g -> g != null && !g.isBlank())
                .distinct()
                .collect(Collectors.joining(" · "));
        String thongDiep = laLeTan
                ? "Chưa thể tạo đơn cho toàn bộ file — không có đơn nào được lưu. "
                        + "Vui lòng chỉnh các dòng lỗi (hoặc chọn loại phòng còn trống) rồi tải lại."
                : "Chúng tôi chưa thể giữ phòng cho cả nhóm trong một lần — không có đơn nào được tạo. "
                        + "Bạn có thể chỉnh lại file theo gợi ý loại phòng còn trống bên dưới, hoặc đặt ít phòng hơn trên trang Đặt phòng.";
        return KetQuaNhapExcelDatPhongDto.builder()
                .tongHang(tongHang)
                .soThanhCong(0)
                .soThatBai(tongHang)
                .thongDiepTong(thongDiep)
                .goiYChung(goiYChung.isBlank() ? null : goiYChung)
                .chiTiet(chiTiet)
                .build();
    }

    private boolean dongTrong(Row row, boolean laLeTan) {
        int max = laLeTan ? 8 : 7;
        for (int i = 0; i < max; i++) {
            if (!layChuoi(row, i).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String rongLaNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String layChuoi(Row row, int col) {
        Cell c = row.getCell(col);
        if (c == null || c.getCellType() == CellType.BLANK) {
            return "";
        }
        return dataFormatter.formatCellValue(c).trim();
    }

    private LocalDate layNgay(Row row, int col) {
        Cell c = row.getCell(col);
        if (c == null || c.getCellType() == CellType.BLANK) {
            return null;
        }
        if (c.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(c)) {
            return c.getLocalDateTimeCellValue().toLocalDate();
        }
        String s = dataFormatter.formatCellValue(c).trim();
        if (s.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(s, ISO);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDate.parse(s, DMY);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private Long layLong(Row row, int col) {
        Cell c = row.getCell(col);
        if (c == null || c.getCellType() == CellType.BLANK) {
            return null;
        }
        if (c.getCellType() == CellType.NUMERIC) {
            return (long) c.getNumericCellValue();
        }
        String s = dataFormatter.formatCellValue(c).trim().replace(",", ".");
        if (s.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(s.replaceAll("\\.0$", ""));
        } catch (NumberFormatException e) {
            try {
                return (long) Double.parseDouble(s);
            } catch (NumberFormatException e2) {
                return null;
            }
        }
    }
}
