package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "danh_gia", uniqueConstraints = @UniqueConstraint(columnNames = {"id_loai_phong", "id_nguoi_dung"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_loai_phong", nullable = false)
    private LoaiPhong loaiPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(nullable = false)
    private Integer diem;

    @Column(columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "thoi_diem", nullable = false)
    private LocalDateTime thoiDiem;
}
