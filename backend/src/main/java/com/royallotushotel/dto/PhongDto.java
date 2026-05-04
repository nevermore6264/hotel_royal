package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class PhongDto {
    private Long id;
    private String soPhong;
    private String trangThai;
    private String trangThaiVeSinh;
    private Long idDatPhong;
    private Long idLoaiPhong;
    private String tenLoaiPhong;
    private BigDecimal giaLoaiPhong;
    private BigDecimal giaChoKyLuuTru;
    private List<String> duongDanAnh = new ArrayList<>();
    private String ghiChuVeSinh;
}
