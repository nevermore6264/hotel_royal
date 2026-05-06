package com.royallotushotel.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class TinNhanChatRepositoryTest {

    @Autowired
    private TinNhanChatRepository tinNhanChatRepository;

    @Test
    void napDuocBean() {
        assertThat(tinNhanChatRepository).isNotNull();
    }
}
