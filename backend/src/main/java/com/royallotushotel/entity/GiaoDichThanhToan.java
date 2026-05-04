package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "giao_dich_thanh_toan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_thanh_toan", nullable = false)
    private ThanhToan thanhToan;

    @Column(name = "ma_giao_dich", length = 100)
    private String maGiaoDich;

    @Column(name = "loai_giao_dich", nullable = false, length = 30)
    private String loaiGiaoDich;

    @Column(name = "so_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "phuong_thuc", length = 50)
    private String phuongThuc;

    @Column(name = "cong_thanh_toan", length = 50)
    private String congThanhToan;

    @Column(name = "tham_chieu_cong", length = 100)
    private String thamChieuCong;

    @Column(name = "thoi_diem_giao_dich")
    private LocalDateTime thoiDiemGiaoDich;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "du_lieu_phan_hoi", columnDefinition = "TEXT")
    private String duLieuPhanHoi;

    @PrePersist
    protected void onCreate() {
        if (thoiDiemGiaoDich == null) {
            thoiDiemGiaoDich = LocalDateTime.now();
        }
    }
}
