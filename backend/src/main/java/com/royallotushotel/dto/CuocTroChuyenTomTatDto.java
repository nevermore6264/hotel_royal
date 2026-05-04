package com.royallotushotel.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CuocTroChuyenTomTatDto {
    private Long id;
    private Long idNguoiDungKhach;
    private String tenDangNhapKhach;
    private String hoTenKhach;
    private Long idNguoiHoTro;
    private String tenNguoiHoTro;
    private LocalDateTime thoiDiemCapNhat;
}
