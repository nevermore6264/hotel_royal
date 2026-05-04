package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_trang_thai_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuTrangThaiPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phong", nullable = false)
    private Phong phong;

    @Column(name = "trang_thai_cu", length = 30)
    private String trangThaiCu;

    @Column(name = "trang_thai_moi", length = 30)
    private String trangThaiMoi;

    @Column(name = "thoi_diem_thay_doi")
    private LocalDateTime thoiDiemThayDoi;

    @PrePersist
    protected void onCreate() {
        thoiDiemThayDoi = LocalDateTime.now();
    }
}
