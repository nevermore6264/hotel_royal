package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaTrangThaiYeuCauHuy;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "yeu_cau_huy_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YeuCauHuyPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dat_phong", nullable = false)
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chi_tiet_dat_phong")
    private ChiTietDatPhong chiTietDatPhong;

    @Column(name = "id_khach_yeu_cau")
    private Long idKhachYeuCau;

    @Column(name = "ly_do_khach", columnDefinition = "TEXT")
    private String lyDoKhach;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    @Column(name = "so_gio_con_lai_luc_yeu_cau")
    private Integer soGioConLaiLucYeuCau;

    @Column(name = "ty_le_hoan_du_kien", precision = 5, scale = 2)
    private BigDecimal tyLeHoanDuKien;

    @Column(name = "so_tien_hoan_du_kien", precision = 15, scale = 2)
    private BigDecimal soTienHoanDuKien;

    @Column(name = "mo_ta_chinh_sach", columnDefinition = "TEXT")
    private String moTaChinhSach;

    @Column(name = "ghi_chu_quan_tri", columnDefinition = "TEXT")
    private String ghiChuQuanTri;

    @Column(name = "ghi_chu_le_tan", columnDefinition = "TEXT")
    private String ghiChuLeTan;

    @Column(name = "id_nguoi_duyet")
    private Long idNguoiDuyet;

    @Column(name = "id_nguoi_hoan")
    private Long idNguoiHoan;

    @Column(name = "so_tien_hoan_thuc_te", precision = 15, scale = 2)
    private BigDecimal soTienHoanThucTe;

    @Column(name = "thoi_diem_yeu_cau")
    private LocalDateTime thoiDiemYeuCau;

    @Column(name = "thoi_diem_duyet")
    private LocalDateTime thoiDiemDuyet;

    @Column(name = "thoi_diem_hoan")
    private LocalDateTime thoiDiemHoan;

    @PrePersist
    protected void onCreate() {
        if (thoiDiemYeuCau == null) {
            thoiDiemYeuCau = LocalDateTime.now();
        }
        if (trangThai == null) {
            trangThai = MaTrangThaiYeuCauHuy.CHO_DUYET;
        }
    }
}
