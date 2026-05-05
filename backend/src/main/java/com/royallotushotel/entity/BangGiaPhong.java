package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bang_gia_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BangGiaPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loai_phong", nullable = false)
    private LoaiPhong loaiPhong;

    @Column(name = "ten_chinh_sach", nullable = false, length = 150)
    private String tenChinhSach;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "gia_ap_dung", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaApDung;

    @Column(name = "kich_hoat", nullable = false)
    @Builder.Default
    private Boolean kichHoat = true;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;
}
