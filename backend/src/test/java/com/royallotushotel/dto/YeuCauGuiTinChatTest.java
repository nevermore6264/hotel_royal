package com.royallotushotel.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauGuiTinChatTest {

    @Test
    void gettersVaSetters() {
        YeuCauGuiTinChat dto = new YeuCauGuiTinChat();
        dto.setNoiDung("Xin chao");
        dto.setKieuTin("VAN_BAN");

        assertThat(dto.getNoiDung()).isEqualTo("Xin chao");
        assertThat(dto.getKieuTin()).isEqualTo("VAN_BAN");
    }
}
