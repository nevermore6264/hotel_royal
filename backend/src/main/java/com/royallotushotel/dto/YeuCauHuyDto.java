package com.royallotushotel.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YeuCauHuyDto {

    private Long id;
    private Long idDatPhong;
    private Long idChiTiet;
    private String soPhong;
    private String trangThai;
    private String lyDoKhach;
    private Integer soGioConLaiLucYeuCau;
    private BigDecimal tyLeHoanDuKien;
    private BigDecimal soTienHoanDuKien;
    private String moTaChinhSach;
    private String ghiChuQuanTri;
    private String ghiChuLeTan;
    private BigDecimal soTienHoanThucTe;
    private LocalDateTime thoiDiemYeuCau;
    private LocalDateTime thoiDiemDuyet;
    private LocalDateTime thoiDiemHoan;
    private String tenKhach;
    private String ngayNhanPhong;
    private String ngayTraPhong;
}
