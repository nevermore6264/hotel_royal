package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "chinh_sach_huy_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChinhSachHuyPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "so_gio_truoc_nhan_phong", nullable = false)
    private Integer soGioTruocNhanPhong;

    @Column(name = "ty_le_hoan_tien", nullable = false, precision = 5, scale = 2)
    private BigDecimal tyLeHoanTien;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "thu_tu_uu_tien")
    private Integer thuTuUuTien;

    @Column(name = "con_hieu_luc", nullable = false)
    @Builder.Default
    private Boolean conHieuLuc = true;
}
