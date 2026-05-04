package com.royallotushotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class YeuCauTaoDatPhong {
    @NotNull
    private Long idKhachHang;
    @NotNull
    private LocalDate ngayNhanPhong;
    @NotNull
    private LocalDate ngayTraPhong;
    @NotNull
    private List<Long> idPhong;
    private String tenKhach;
    private String sdtKhach;
    private String emailKhach;
}
