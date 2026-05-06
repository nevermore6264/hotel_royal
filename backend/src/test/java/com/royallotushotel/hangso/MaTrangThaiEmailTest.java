package com.royallotushotel.hangso;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MaTrangThaiEmailTest {

    @Test
    void hangSoCoGiaTriOnDinh() {
        assertThat(MaTrangThaiEmail.DA_GUI).isEqualTo("DA_GUI");
        assertThat(MaTrangThaiEmail.THAT_BAI).isEqualTo("THAT_BAI");
    }
}
