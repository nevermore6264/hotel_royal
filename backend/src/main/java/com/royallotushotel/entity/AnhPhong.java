package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "anh_phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnhPhong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_phong", nullable = false)
    private Phong phong;

    @Column(name = "duong_dan_anh", nullable = false, length = 500)
    private String duongDanAnh;
}
