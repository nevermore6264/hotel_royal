package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaKieuTinChatTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaKieuTinChat.VAN_BAN).isEqualTo("VAN_BAN");
        assertThat(MaKieuTinChat.ANH).isEqualTo("ANH");
    }
}
