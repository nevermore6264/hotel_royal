package com.royallotushotel.repository;

import com.royallotushotel.entity.SuDungDichVu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuDungDichVuRepository extends JpaRepository<SuDungDichVu, Long> {

    boolean existsByDichVu_Id(Long idDichVu);

    Optional<SuDungDichVu> findByDatPhong_IdAndDichVu_Id(Long idDatPhong, Long idDichVu);
}
