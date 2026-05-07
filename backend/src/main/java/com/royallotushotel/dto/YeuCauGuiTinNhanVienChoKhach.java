package com.royallotushotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauGuiTinNhanVienChoKhach {
    @NotNull
    private Long idNguoiDungKhach;
    private String noiDung;
    private String kieuTin;
}
