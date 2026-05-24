package com.royallotushotel.service;

import com.royallotushotel.dto.DanhGiaHuyDto;
import com.royallotushotel.entity.ChinhSachHuyPhong;
import com.royallotushotel.entity.ChiTietDatPhong;
import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.HoanTien;
import com.royallotushotel.repository.ChinhSachHuyPhongRepository;
import com.royallotushotel.repository.HoanTienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DichVuHoanTien {

    private final ChinhSachHuyPhongRepository chinhSachHuyPhongRepository;
    private final HoanTienRepository hoanTienRepository;

    @Transactional
    public void apDungHoan(DatPhong datPhong) {
        datPhong.getChiTiet().forEach(chiTiet -> apDungHoanChiTiet(datPhong, chiTiet, "Huy phong theo chinh sach hoan tien"));
    }

    @Transactional
    public BigDecimal apDungHoanChiTiet(DatPhong datPhong, ChiTietDatPhong chiTiet, String lyDo) {
        return apDungHoanChiTiet(datPhong, chiTiet, lyDo, true);
    }

    @Transactional
    public BigDecimal apDungHoanChiTiet(DatPhong datPhong, ChiTietDatPhong chiTiet, String lyDo, boolean ghiHoanTien) {
        BigDecimal soTienHoan = tinhSoTienHoan(chiTiet);
        if (ghiHoanTien && soTienHoan.compareTo(BigDecimal.ZERO) > 0) {
            HoanTien ht = HoanTien.builder()
                    .datPhong(datPhong)
                    .soTienHoan(soTienHoan)
                    .lyDo(lyDo)
                    .build();
            hoanTienRepository.save(ht);
        }
        return soTienHoan;
    }

    public DanhGiaHuyDto.DanhGiaHuyPhongDto danhGiaMotPhong(DatPhong datPhong, ChiTietDatPhong chiTiet) {
        ChinhSachHuyPhong cs = timChinhSachApDung(datPhong.getNgayNhanPhong());
        BigDecimal tyLe = cs != null ? cs.getTyLeHoanTien() : BigDecimal.ZERO;
        chiTiet.setTyLeHoanTienApDung(tyLe);
        BigDecimal soTien = tinhSoTienHoan(chiTiet);
        String soPhong = chiTiet.getPhong() != null ? chiTiet.getPhong().getSoPhong() : "—";
        return DanhGiaHuyDto.DanhGiaHuyPhongDto.builder()
                .idChiTiet(chiTiet.getId())
                .soPhong(soPhong)
                .giaPhong(chiTiet.getGia())
                .tyLeHoan(tyLe)
                .soTienHoan(soTien)
                .moTaChinhSach(moTaChinhSach(cs, datPhong.getNgayNhanPhong()))
                .build();
    }

    public ChinhSachHuyPhong timChinhSachApDung(LocalDate ngayNhanPhong) {
        long gioConLai = ChronoUnit.HOURS.between(LocalDateTime.now(), ngayNhanPhong.atStartOfDay());
        return chinhSachHuyPhongRepository.findByConHieuLucTrueOrderBySoGioTruocNhanPhongDesc().stream()
                .filter(cs -> gioConLai >= cs.getSoGioTruocNhanPhong())
                .findFirst()
                .orElse(null);
    }

    public int tinhSoGioConLai(LocalDate ngayNhanPhong) {
        long gio = ChronoUnit.HOURS.between(LocalDateTime.now(), ngayNhanPhong.atStartOfDay());
        return (int) Math.max(0, gio);
    }

    public String moTaChinhSach(ChinhSachHuyPhong cs, LocalDate ngayNhanPhong) {
        int gio = tinhSoGioConLai(ngayNhanPhong);
        if (cs == null) {
            return "Hủy trong vòng " + gio + " giờ trước nhận phòng: không được hoàn tiền theo chính sách hiện tại.";
        }
        String moTa = cs.getMoTa() != null && !cs.getMoTa().isBlank()
                ? cs.getMoTa()
                : "Hủy trước ≥ " + cs.getSoGioTruocNhanPhong() + " giờ";
        return moTa + " — hoàn " + cs.getTyLeHoanTien().stripTrailingZeros().toPlainString() + "%.";
    }

    @Transactional
    public void luuHoanTienDon(DatPhong datPhong, BigDecimal soTienHoan, String lyDo) {
        if (soTienHoan == null || soTienHoan.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        hoanTienRepository.save(HoanTien.builder()
                .datPhong(datPhong)
                .soTienHoan(soTienHoan)
                .lyDo(lyDo)
                .build());
    }

    public BigDecimal tinhSoTienHoan(ChiTietDatPhong chiTiet) {
        if (chiTiet.getGia() == null || chiTiet.getGia().compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal tyLeHoanTien = chiTiet.getTyLeHoanTienApDung();
        if (tyLeHoanTien == null) {
            tyLeHoanTien = timTyLeHoanTienMacDinh(chiTiet.getDatPhong());
        }
        if (tyLeHoanTien == null || tyLeHoanTien.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return chiTiet.getGia()
                .multiply(tyLeHoanTien)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal timTyLeHoanTienMacDinh(DatPhong datPhong) {
        ChinhSachHuyPhong cs = timChinhSachApDung(datPhong.getNgayNhanPhong());
        return cs != null ? cs.getTyLeHoanTien() : BigDecimal.ZERO;
    }
}
