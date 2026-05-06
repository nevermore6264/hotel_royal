package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class QuyenTest {

    @Test
    void builder() {
        Quyen e = Quyen.builder().ten("DOC_PHONG").build();
        assertThat(e.getTen()).isEqualTo("DOC_PHONG");
    }
}
