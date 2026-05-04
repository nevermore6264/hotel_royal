package com.royallotushotel.repository;

import com.royallotushotel.entity.ChinhSachHuyPhong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChinhSachHuyPhongRepository extends JpaRepository<ChinhSachHuyPhong, Long> {
    List<ChinhSachHuyPhong> findByConHieuLucTrueOrderBySoGioTruocNhanPhongDesc();

    @Query("SELECT c FROM ChinhSachHuyPhong c WHERE " +
            "(:conHieuLuc IS NULL OR c.conHieuLuc = :conHieuLuc) " +
            "AND (:q IS NULL OR :q = '' OR LOWER(COALESCE(c.moTa,'')) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "ORDER BY c.thuTuUuTien ASC, c.soGioTruocNhanPhong DESC")
    Page<ChinhSachHuyPhong> timCoPhanTrang(
            @Param("q") String q,
            @Param("conHieuLuc") Boolean conHieuLuc,
            Pageable pageable);
}
