package com.royallotushotel.repository;

import com.royallotushotel.entity.NhatKyHeThong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NhatKyHeThongRepository extends JpaRepository<NhatKyHeThong, Long> {
    Page<NhatKyHeThong> findAllByOrderByThoiDiemDesc(Pageable pageable);

    @Query("SELECT n FROM NhatKyHeThong n LEFT JOIN n.nguoiDung u WHERE " +
            "(:tu IS NULL OR n.thoiDiem >= :tu) AND (:den IS NULL OR n.thoiDiem <= :den) " +
            "AND (:q IS NULL OR :q = '' OR LOWER(n.hanhDong) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(COALESCE(n.chiTiet,'')) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "(u IS NOT NULL AND LOWER(u.tenDangNhap) LIKE LOWER(CONCAT('%', :q, '%')))) " +
            "ORDER BY n.thoiDiem DESC")
    Page<NhatKyHeThong> timLoc(
            @Param("q") String q,
            @Param("tu") LocalDateTime tu,
            @Param("den") LocalDateTime den,
            Pageable pageable);
}
