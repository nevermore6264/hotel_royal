package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TinNhanChatDtoTest {

    @Test
    void builderVaGetters() {
        LocalDateTime ts = LocalDateTime.of(2026, 5, 6, 16, 0);
        TinNhanChatDto dto = TinNhanChatDto.builder()
                .id(1L)
                .idNguoiGui(2L)
                .tenHienThiNguoiGui("A")
                .noiDung("Hello")
                .kieuTin("VAN_BAN")
                .thoiDiem(ts)
                .build();

        assertThat(dto.getNoiDung()).isEqualTo("Hello");
        assertThat(dto.getKieuTin()).isEqualTo("VAN_BAN");
        assertThat(dto.getThoiDiem()).isEqualTo(ts);
    }
}
