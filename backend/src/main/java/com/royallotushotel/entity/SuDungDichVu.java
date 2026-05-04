package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "su_dung_dich_vu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuDungDichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dat_phong", nullable = false)
    private DatPhong datPhong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dich_vu", nullable = false)
    private DichVu dichVu;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;
}
