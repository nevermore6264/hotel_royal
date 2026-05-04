package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "chi_tiet_dat_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietDatPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dat_phong", nullable = false)
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phong", nullable = false)
    private Phong phong;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    @Column(name = "gia_goc_moi_dem", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaGocMoiDem;

    @Column(name = "so_dem", nullable = false)
    private Integer soDem;

    @Column(name = "thanh_tien_phong", nullable = false, precision = 15, scale = 2)
    private BigDecimal gia;

    @Column(name = "so_tien_hoan", precision = 15, scale = 2)
    private BigDecimal soTienHoan;

    @Column(name = "thoi_diem_huy")
    private LocalDateTime thoiDiemHuy;

    @Column(name = "ly_do_huy", columnDefinition = "TEXT")
    private String lyDoHuy;

    @Column(name = "so_gio_huy_ap_dung")
    private Integer soGioHuyApDung;

    @Column(name = "ty_le_hoan_tien_ap_dung", precision = 5, scale = 2)
    private BigDecimal tyLeHoanTienApDung;
}
