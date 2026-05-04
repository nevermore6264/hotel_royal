package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "hoan_tien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoanTien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dat_phong", nullable = false)
    private DatPhong datPhong;

    @Column(name = "so_tien_hoan", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTienHoan;

    @Column(name = "thoi_diem_hoan")
    private LocalDateTime thoiDiemHoan;

    @Column(name = "ly_do", columnDefinition = "TEXT")
    private String lyDo;

    @PrePersist
    protected void onCreate() {
        if (thoiDiemHoan == null) thoiDiemHoan = LocalDateTime.now();
    }
}
