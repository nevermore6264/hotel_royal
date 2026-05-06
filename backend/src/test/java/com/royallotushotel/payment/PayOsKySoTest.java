package com.royallotushotel.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PayOsKySoTest {

    @Test
    void taoChuKyTaoLink_onDinhVoiThamSoCoDinh() {
        String sig = PayOsKySo.taoChuKyTaoLinkThanhToan(
                1_000_000L,
                "http://cancel",
                "Mo ta",
                12345L,
                "http://return",
                "checksum-secret"
        );
        assertThat(sig).hasSize(64);
        assertThat(PayOsKySo.taoChuKyTaoLinkThanhToan(
                1_000_000L,
                "http://cancel",
                "Mo ta",
                12345L,
                "http://return",
                "checksum-secret"
        )).isEqualTo(sig);
    }

    @Test
    void xacThucWebhook_traVeFalseKhiThieuDuLieu() throws Exception {
        JsonNode data = new ObjectMapper().readTree("{\"a\":1}");
        assertThat(PayOsKySo.xacThucDuLieuWebhook(data, "", "key")).isFalse();
        assertThat(PayOsKySo.xacThucDuLieuWebhook(data, "abc", "")).isFalse();
    }
}
