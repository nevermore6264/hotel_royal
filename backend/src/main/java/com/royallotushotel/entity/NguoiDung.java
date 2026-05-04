package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "nguoi_dung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_dang_nhap", unique = true, nullable = false, length = 100)
    private String tenDangNhap;

    @Column(name = "mat_khau", nullable = false, length = 255)
    private String matKhau;

    @Column(unique = true, nullable = false, length = 255)
    private String email;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;

    @Column(name = "ho_ten", length = 255)
    private String hoTen;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "thoi_gian_tao")
    private LocalDateTime thoiGianTao;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "nguoi_dung_vai_tro",
            joinColumns = @JoinColumn(name = "id_nguoi_dung"),
            inverseJoinColumns = @JoinColumn(name = "id_vai_tro"))
    @Builder.Default
    private Set<VaiTro> vaiTro = new HashSet<>();

    @OneToOne(mappedBy = "nguoiDung", cascade = CascadeType.ALL, orphanRemoval = true)
    private KhachHang hoSoKhachHang;

    @PrePersist
    protected void onCreate() {
        thoiGianTao = LocalDateTime.now();
        if (trangThai == null) trangThai = MaTrangThaiNguoiDung.HOAT_DONG;
    }
}
