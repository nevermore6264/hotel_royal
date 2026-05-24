package com.royallotushotel.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaHuyDto {

    private Long idDatPhong;
    private Long idChiTiet;
    private boolean coTheYeuCau;
    private String lyDoKhongThe;
    private Integer soGioConLai;
    private BigDecimal tyLeHoan;
    private BigDecimal soTienHoanDuKien;
    private String moTaChinhSach;
    @Builder.Default
    private List<DanhGiaHuyPhongDto> tungPhong = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DanhGiaHuyPhongDto {
        private Long idChiTiet;
        private String soPhong;
        private BigDecimal giaPhong;
        private BigDecimal tyLeHoan;
        private BigDecimal soTienHoan;
        private String moTaChinhSach;
    }
}
