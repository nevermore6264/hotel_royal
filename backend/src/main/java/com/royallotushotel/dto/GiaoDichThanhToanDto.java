package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GiaoDichThanhToanDto {
    private Long id;
    private String maGiaoDich;
    private String loaiGiaoDich;
    private BigDecimal soTien;
    private String trangThai;
    private String phuongThuc;
    private String congThanhToan;
    private String thamChieuCong;
    private LocalDateTime thoiDiemGiaoDich;
    private String ghiChu;
}
