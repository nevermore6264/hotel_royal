package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "thanh_toan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dat_phong", nullable = false, unique = true)
    private DatPhong datPhong;

    @Column(name = "tong_phai_thu", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongPhaiThu;

    @Column(name = "tong_da_thu", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongDaThu;

    @Column(name = "tong_hoan", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongHoan;

    @Column(name = "con_phai_thu", nullable = false, precision = 15, scale = 2)
    private BigDecimal conPhaiThu;

    @Column(name = "phuong_thuc", length = 50)
    private String phuongThuc;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thoi_diem_thanh_toan")
    private LocalDateTime thoiDiemThanhToan;

    @Column(name = "lan_cap_nhat_cuoi")
    private LocalDateTime lanCapNhatCuoi;

    @Column(name = "payos_order_code", unique = true)
    private Integer payosOrderCode;

    @OneToMany(mappedBy = "thanhToan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GiaoDichThanhToan> giaoDich = new ArrayList<>();

    @PrePersist
    @PreUpdate
    protected void dongBoThoiDiemCapNhat() {
        lanCapNhatCuoi = LocalDateTime.now();
    }
}
