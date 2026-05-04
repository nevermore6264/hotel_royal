package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaTrangThaiDatPhong;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dat_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_khach_hang", nullable = false)
    private KhachHang khachHang;

    @Column(name = "ngay_nhan_phong", nullable = false)
    private LocalDate ngayNhanPhong;

    @Column(name = "ngay_tra_phong", nullable = false)
    private LocalDate ngayTraPhong;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @Column(name = "ten_khach", length = 255)
    private String tenKhach;

    @Column(name = "sdt_khach", length = 20)
    private String sdtKhach;

    @Column(name = "email_khach", length = 255)
    private String emailKhach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chinh_sach_huy_ap_dung")
    private ChinhSachHuyPhong chinhSachHuyApDung;

    @Column(name = "so_gio_huy_ap_dung")
    private Integer soGioHuyApDung;

    @Column(name = "ty_le_hoan_tien_ap_dung", precision = 5, scale = 2)
    private BigDecimal tyLeHoanTienApDung;

    @OneToMany(mappedBy = "datPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietDatPhong> chiTiet = new ArrayList<>();

    @OneToMany(mappedBy = "datPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LichSuTrangThaiDatPhong> lichSuTrangThai = new ArrayList<>();

    @OneToMany(mappedBy = "datPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SuDungDichVu> suDungDichVu = new ArrayList<>();

    @OneToOne(mappedBy = "datPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    private ThanhToan thanhToan;

    @OneToMany(mappedBy = "datPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HoanTien> hoanTien = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        thoiGianTao = LocalDateTime.now();
        if (trangThai == null) trangThai = MaTrangThaiDatPhong.CHO_DUYET;
    }
}
