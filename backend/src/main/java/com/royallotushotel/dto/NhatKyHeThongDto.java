package com.royallotushotel.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NhatKyHeThongDto {
    private Long id;
    private LocalDateTime thoiDiem;
    private String hanhDong;
    private String chiTiet;
    private String tenDangNhapNguoiThucHien;
}
