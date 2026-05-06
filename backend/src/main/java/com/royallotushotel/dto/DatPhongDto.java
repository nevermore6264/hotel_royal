package com.royallotushotel.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class DatPhongDto {
    private Long id;
    private Long idKhachHang;
    private String tenKhachHang;
    private String tenKhach;
    private String sdtKhach;
    private String emailKhach;
    private LocalDate ngayNhanPhong;
    private LocalDate ngayTraPhong;
    private String trangThai;
    private BigDecimal tienPhong;
    private BigDecimal tienDichVu;
    private BigDecimal tienHoan;
    private BigDecimal tongTien;
    private LocalDateTime thoiGianTao;
    private LocalDateTime thoiDiemHetHanThanhToan;
    private Integer soGioHuyApDung;
    private BigDecimal tyLeHoanTienApDung;
    private List<ChiTietDatPhongDto> chiTiet = new ArrayList<>();
    private List<SuDungDichVuDto> suDungDichVu = new ArrayList<>();
    private ThanhToanDto thanhToan;
}
