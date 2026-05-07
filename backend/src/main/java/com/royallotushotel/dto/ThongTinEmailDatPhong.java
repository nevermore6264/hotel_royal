package com.royallotushotel.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ThongTinEmailDatPhong(
        String tenKhach,
        String emailNhan,
        long idDatPhong,
        LocalDate ngayNhanPhong,
        LocalDate ngayTraPhong,
        BigDecimal tongTien,
        List<String> dongPhong,
        boolean laXacNhanTuLeTan
) {}
