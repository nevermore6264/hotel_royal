package com.royallotushotel.repository;

import com.royallotushotel.entity.LichSuTrangThaiDatPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuTrangThaiDatPhongRepository extends JpaRepository<LichSuTrangThaiDatPhong, Long> {
}
