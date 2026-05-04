package com.royallotushotel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class YeuCauDangKy {
    @NotBlank
    @Size(min = 3, max = 100)
    private String tenDangNhap;

    @NotBlank
    @Size(min = 6)
    private String matKhau;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(max = 255)
    private String hoTen;

    @Size(max = 20)
    private String soDienThoai;

    private String loaiTaiKhoan;
}
