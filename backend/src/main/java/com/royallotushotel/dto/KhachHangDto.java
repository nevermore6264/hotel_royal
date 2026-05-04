package com.royallotushotel.dto;

import lombok.Data;

@Data
public class KhachHangDto {
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private String soCanCuoc;
    private Long idNguoiDung;
}
