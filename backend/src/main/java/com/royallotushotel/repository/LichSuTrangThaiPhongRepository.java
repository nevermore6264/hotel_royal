package com.royallotushotel.repository;

import com.royallotushotel.entity.LichSuTrangThaiPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LichSuTrangThaiPhongRepository extends JpaRepository<LichSuTrangThaiPhong, Long> {
}
