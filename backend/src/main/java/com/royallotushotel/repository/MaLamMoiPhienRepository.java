package com.royallotushotel.repository;

import com.royallotushotel.entity.MaLamMoiPhien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaLamMoiPhienRepository extends JpaRepository<MaLamMoiPhien, Long> {
    Optional<MaLamMoiPhien> findByMaToken(String maToken);

    void deleteByNguoiDung_Id(Long idNguoiDung);
}
