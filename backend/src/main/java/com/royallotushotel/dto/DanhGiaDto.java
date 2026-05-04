package com.royallotushotel.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DanhGiaDto {
    private Long id;
    private Long idLoaiPhong;
    private int diem;
    private String noiDung;
    private LocalDateTime thoiDiem;
    private String tenHienThi;
}
