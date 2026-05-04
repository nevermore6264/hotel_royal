package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ma_lam_moi_phien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaLamMoiPhien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_dung", nullable = false)
    private NguoiDung nguoiDung;

    @Column(name = "ma_token", nullable = false, unique = true, length = 500)
    private String maToken;

    @Column(name = "thoi_diem_het_han", nullable = false)
    private LocalDateTime thoiDiemHetHan;
}
