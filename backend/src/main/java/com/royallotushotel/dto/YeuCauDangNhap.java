package com.royallotushotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class YeuCauDangNhap {
    @NotBlank
    private String tenDangNhap;
    @NotBlank
    private String matKhau;
}
