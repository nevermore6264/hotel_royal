package com.royallotushotel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NguoiDungHoTroChatDto {
    private Long id;
    private String hoTen;
    private String tenDangNhap;
    private String loaiVaiTro;
}
