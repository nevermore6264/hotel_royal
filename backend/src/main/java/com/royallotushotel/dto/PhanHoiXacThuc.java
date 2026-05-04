package com.royallotushotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhanHoiXacThuc {
    private String tokenTruyCap;
    private String tokenLamMoi;
    private String loaiToken = "Bearer";
    private Long idNguoiDung;
    private String tenDangNhap;
    private String email;
    private List<String> vaiTro;
}
