package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loai_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten", nullable = false, length = 100)
    private String ten;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal gia;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "suc_chua_toi_da")
    private Integer sucChuaToiDa;

    @OneToMany(mappedBy = "loaiPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Phong> phong = new ArrayList<>();

    @OneToMany(mappedBy = "loaiPhong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BangGiaPhong> bangGia = new ArrayList<>();
}
