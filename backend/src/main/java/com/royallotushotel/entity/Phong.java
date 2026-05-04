package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "so_phong", nullable = false, unique = true, length = 20)
    private String soPhong;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    @Column(name = "trang_thai_ve_sinh", length = 30)
    private String trangThaiVeSinh;

    @Column(name = "ghi_chu_ve_sinh", columnDefinition = "TEXT")
    private String ghiChuVeSinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loai_phong", nullable = false)
    private LoaiPhong loaiPhong;

    @OneToMany(mappedBy = "phong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AnhPhong> anh = new ArrayList<>();

    @OneToMany(mappedBy = "phong", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LichSuTrangThaiPhong> lichSuTrangThai = new ArrayList<>();

    @OneToMany(mappedBy = "phong")
    @Builder.Default
    private List<ChiTietDatPhong> chiTietDatPhong = new ArrayList<>();
}
