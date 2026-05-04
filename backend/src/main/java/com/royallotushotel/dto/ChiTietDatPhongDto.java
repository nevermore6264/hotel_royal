package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ChiTietDatPhongDto {
    private Long id;
    private Long idPhong;
    private String soPhong;
    private String trangThai;
    private BigDecimal giaGocMoiDem;
    private Integer soDem;
    private BigDecimal gia;
    private BigDecimal soTienHoan;
    private LocalDateTime thoiDiemHuy;
    private String lyDoHuy;
    private Integer soGioHuyApDung;
    private BigDecimal tyLeHoanTienApDung;
}
