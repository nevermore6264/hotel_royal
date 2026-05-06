package com.royallotushotel.entity;

import com.royallotushotel.hangso.MaTrangThaiEmail;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NhatKyEmailTest {

    @Test
    void builder() {
        NhatKyEmail e = NhatKyEmail.builder()
                .emailNguoiNhan("x@y.com")
                .tieuDe("Hello")
                .trangThai(MaTrangThaiEmail.DA_GUI)
                .build();
        assertThat(e.getEmailNguoiNhan()).isEqualTo("x@y.com");
        assertThat(e.getTrangThai()).isEqualTo(MaTrangThaiEmail.DA_GUI);
    }
}
