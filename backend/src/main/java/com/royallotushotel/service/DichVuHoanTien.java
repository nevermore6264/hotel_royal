package com.royallotushotel.service;

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
        BigDecimal soTienHoan = tinhSoTienHoan(chiTiet);
        if (soTienHoan.compareTo(BigDecimal.ZERO) > 0) {
            HoanTien ht = HoanTien.builder()
                    .datPhong(datPhong)
                    .soTienHoan(soTienHoan)
                    .lyDo(lyDo)
                    .build();
            hoanTienRepository.save(ht);
        }
        return soTienHoan;
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
        List<ChinhSachHuyPhong> ds = chinhSachHuyPhongRepository.findByConHieuLucTrueOrderBySoGioTruocNhanPhongDesc();
        if (ds.isEmpty()) return BigDecimal.ZERO;
        LocalDateTime nhanPhong = datPhong.getNgayNhanPhong().atStartOfDay();
        long gioConLai = ChronoUnit.HOURS.between(LocalDateTime.now(), nhanPhong);
        for (ChinhSachHuyPhong cs : ds) {
            if (gioConLai >= cs.getSoGioTruocNhanPhong()) {
                return cs.getTyLeHoanTien();
            }
        }
        return BigDecimal.ZERO;
    }
}
