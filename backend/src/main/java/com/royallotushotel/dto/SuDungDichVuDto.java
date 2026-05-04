package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SuDungDichVuDto {
    private Long id;
    private Long idDichVu;
    private String tenDichVu;
    private Integer soLuong;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
}
