package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LoaiPhongDto {
    private Long id;
    private String ten;
    private BigDecimal gia;
    private String moTa;
    private Integer sucChuaToiDa;
}
