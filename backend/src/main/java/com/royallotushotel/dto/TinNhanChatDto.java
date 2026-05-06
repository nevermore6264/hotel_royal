package com.royallotushotel.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TinNhanChatDto {
    private Long id;
    private Long idNguoiGui;
    private String tenHienThiNguoiGui;
    private String noiDung;
    private String kieuTin;
    private LocalDateTime thoiDiem;
}
