package com.royallotushotel.dto;

import lombok.Data;

import java.util.List;

@Data
public class NguoiDungDto {
    private Long id;
    private String tenDangNhap;
    private String matKhau;
    private String email;
    private String hoTen;
    private String soDienThoai;
    private String trangThai;
    private List<String> vaiTro;
}
