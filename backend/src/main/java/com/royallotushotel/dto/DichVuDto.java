package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DichVuDto {
    private Long id;
    private String ten;
    private BigDecimal gia;
    private String moTa;
}
