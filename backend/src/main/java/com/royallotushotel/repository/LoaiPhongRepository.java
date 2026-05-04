package com.royallotushotel.repository;

import com.royallotushotel.entity.LoaiPhong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoaiPhongRepository extends JpaRepository<LoaiPhong, Long> {

    @Query("SELECT l FROM LoaiPhong l WHERE :q IS NULL OR :q = '' OR " +
            "LOWER(l.ten) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(l.moTa,'')) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "ORDER BY l.ten ASC")
    Page<LoaiPhong> timCoPhanTrang(@Param("q") String q, Pageable pageable);
}
