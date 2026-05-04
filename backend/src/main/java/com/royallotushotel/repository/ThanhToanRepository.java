package com.royallotushotel.repository;

import com.royallotushotel.entity.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThanhToanRepository extends JpaRepository<ThanhToan, Long> {
    Optional<ThanhToan> findByDatPhong_Id(Long idDatPhong);

    Optional<ThanhToan> findByPayosOrderCode(Integer payosOrderCode);

    boolean existsByPayosOrderCode(Integer payosOrderCode);
}
