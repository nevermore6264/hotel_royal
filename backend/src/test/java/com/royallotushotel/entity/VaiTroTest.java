package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VaiTroTest {

    @Test
    void builderVaMacDinh() {
        VaiTro e = VaiTro.builder().ten("ROLE_QUAN_TRI").build();
        assertThat(e.getQuyen()).isEmpty();
        assertThat(e.getTen()).isEqualTo("ROLE_QUAN_TRI");
    }
}
