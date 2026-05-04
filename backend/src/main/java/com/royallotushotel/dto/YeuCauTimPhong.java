package com.royallotushotel.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class YeuCauTimPhong {
    private LocalDate ngayNhanPhong;
    private LocalDate ngayTraPhong;
    private Long idLoaiPhong;
}
