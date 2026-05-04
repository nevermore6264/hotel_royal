package com.royallotushotel.repository;

import com.royallotushotel.entity.Phong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhongRepository extends JpaRepository<Phong, Long> {
    Optional<Phong> findBySoPhong(String soPhong);

    boolean existsBySoPhong(String soPhong);

    List<Phong> findByTrangThai(String trangThai);

    List<Phong> findByLoaiPhong_Id(Long idLoaiPhong);

    List<Phong> findByTrangThaiVeSinhIn(List<String> trangThaiVeSinh);

    @Query("SELECT r FROM Phong r WHERE r.trangThai = 'PHONG_TRONG' AND r.id NOT IN " +
           "(SELECT bd.phong.id FROM ChiTietDatPhong bd JOIN bd.datPhong b WHERE b.trangThai NOT IN ('DA_HUY') " +
           "AND ((b.ngayNhanPhong <= :checkOut AND b.ngayTraPhong >= :checkIn)))")
    List<Phong> timPhongTrong(@Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);

    @Query("SELECT p FROM Phong p JOIN p.loaiPhong lp WHERE " +
            "(:trangThai IS NULL OR p.trangThai = :trangThai) " +
            "AND (:idLoaiPhong IS NULL OR lp.id = :idLoaiPhong) " +
            "AND (:q IS NULL OR :q = '' OR LOWER(p.soPhong) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(lp.ten) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "ORDER BY p.soPhong ASC")
    Page<Phong> timCoPhanTrang(
            @Param("q") String q,
            @Param("trangThai") String trangThai,
            @Param("idLoaiPhong") Long idLoaiPhong,
            Pageable pageable);
}
