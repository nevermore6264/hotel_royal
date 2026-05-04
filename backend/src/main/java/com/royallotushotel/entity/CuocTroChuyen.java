package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cuoc_tro_chuyen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CuocTroChuyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung_khach", nullable = false)
    private NguoiDung nguoiDungKhach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_ho_tro")
    private NguoiDung nguoiHoTro;

    @Column(name = "thoi_diem_cap_nhat", nullable = false)
    private LocalDateTime thoiDiemCapNhat;
}
