package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BangGiaPhongDto {
    private Long id;
    private Long idLoaiPhong;
    private String tenLoaiPhong;
    private String tenChinhSach;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private BigDecimal giaApDung;
    private Integer uuTien;
    private Boolean kichHoat;
    private String moTa;
}
