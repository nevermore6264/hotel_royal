package com.royallotushotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauGuiTinKhach {
    private String noiDung;

    private String kieuTin;

    @NotNull
    private Long idNguoiHoTro;
}
