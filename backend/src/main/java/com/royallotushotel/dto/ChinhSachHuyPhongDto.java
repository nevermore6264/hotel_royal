package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ChinhSachHuyPhongDto {
    private Long id;
    private Integer soGioTruocNhanPhong;
    private BigDecimal tyLeHoanTien;
    private String moTa;
    private Integer thuTuUuTien;
    private Boolean conHieuLuc;
}
