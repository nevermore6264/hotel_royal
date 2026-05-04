package com.royallotushotel.repository;

import com.royallotushotel.entity.NhatKyEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NhatKyEmailRepository extends JpaRepository<NhatKyEmail, Long> {
}
