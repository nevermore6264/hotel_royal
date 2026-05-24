package com.royallotushotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaoYeuCauHuyDto {

    @NotNull
    private Long idDatPhong;

    private Long idChiTiet;

    private String lyDoKhach;
}
