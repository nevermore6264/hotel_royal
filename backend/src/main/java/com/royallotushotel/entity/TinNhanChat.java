package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaKieuTinChat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tin_nhan_chat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TinNhanChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cuoc_tro_chuyen", nullable = false)
    private CuocTroChuyen cuocTroChuyen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nguoi_gui", nullable = false)
    private NguoiDung nguoiGui;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    /** MaKieuTinChat — null trên dữ liệu cũ được coi là VAN_BAN */
    @Column(name = "kieu_tin", length = 20)
    private String kieuTin;

    @Column(name = "thoi_diem", nullable = false)
    private LocalDateTime thoiDiem;
}
