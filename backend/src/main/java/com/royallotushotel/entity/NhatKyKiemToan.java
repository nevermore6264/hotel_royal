package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nhat_ky_kiem_toan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyKiemToan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung")
    private NguoiDung nguoiDung;

    @Column(name = "hanh_dong", length = 100)
    private String hanhDong;

    @Column(name = "ten_thuc_the", length = 100)
    private String tenThucThe;

    @Column(name = "id_thuc_the")
    private Long idThucThe;

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @PrePersist
    protected void onCreate() {
        thoiGianTao = LocalDateTime.now();
    }
}
