package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaKieuTinChat;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class TinNhanChatTest {

    @Test
    void builder() {
        LocalDateTime t = LocalDateTime.of(2026, 5, 7, 9, 30);
        TinNhanChat e = TinNhanChat.builder()
                .cuocTroChuyen(new CuocTroChuyen())
                .nguoiGui(new NguoiDung())
                .noiDung("Hi")
                .kieuTin(MaKieuTinChat.VAN_BAN)
                .thoiDiem(t)
                .build();
        assertThat(e.getNoiDung()).isEqualTo("Hi");
        assertThat(e.getThoiDiem()).isEqualTo(t);
    }
}
