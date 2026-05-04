package com.royallotushotel.repository;

import com.royallotushotel.entity.DichVu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DichVuRepository extends JpaRepository<DichVu, Long> {

    @Query("SELECT d FROM DichVu d WHERE :q IS NULL OR :q = '' OR " +
            "LOWER(d.ten) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(d.moTa,'')) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "ORDER BY d.ten ASC")
    Page<DichVu> timCoPhanTrang(@Param("q") String q, Pageable pageable);
}
