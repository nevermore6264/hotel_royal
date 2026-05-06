package com.royallotushotel.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class YeuCauTimPhong {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate ngayNhanPhong;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate ngayTraPhong;

    private Long idLoaiPhong;
}
