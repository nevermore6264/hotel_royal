package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class ThanhToanDto {
    private Long id;
    private BigDecimal tongPhaiThu;
    private BigDecimal tongDaThu;
    private BigDecimal tongHoan;
    private BigDecimal conPhaiThu;
    private String phuongThuc;
    private String trangThai;
    private LocalDateTime thoiDiemThanhToan;
    private LocalDateTime lanCapNhatCuoi;
    private List<GiaoDichThanhToanDto> giaoDich = new ArrayList<>();
}
