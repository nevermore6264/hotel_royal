package com.royallotushotel.repository;

import com.royallotushotel.entity.SuDungDichVu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SuDungDichVuRepository extends JpaRepository<SuDungDichVu, Long> {

    boolean existsByDichVu_Id(Long idDichVu);
}
