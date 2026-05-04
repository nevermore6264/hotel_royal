package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "nhat_ky_email")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email_nguoi_nhan", nullable = false, length = 255)
    private String emailNguoiNhan;

    @Column(name = "tieu_de", length = 255)
    private String tieuDe;

    @Column(name = "trang_thai", length = 30)
    private String trangThai;

    @Column(name = "thoi_diem_gui")
    private LocalDateTime thoiDiemGui;

    @PrePersist
    protected void onCreate() {
        thoiDiemGui = LocalDateTime.now();
    }
}
