package com.royallotushotel.repository;

import com.royallotushotel.entity.BangGiaPhong;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BangGiaPhongRepository extends JpaRepository<BangGiaPhong, Long> {
    List<BangGiaPhong> findByLoaiPhong_IdOrderByNgayBatDauAsc(Long idLoaiPhong);

    @Query("SELECT b FROM BangGiaPhong b " +
            "WHERE b.loaiPhong.id = :idLoaiPhong " +
            "AND b.kichHoat = true " +
            "AND b.ngayBatDau <= :ngay " +
            "AND b.ngayKetThuc >= :ngay " +
            "ORDER BY b.giaApDung DESC")
    List<BangGiaPhong> timGiaApDungTheoNgay(@Param("idLoaiPhong") Long idLoaiPhong, @Param("ngay") LocalDate ngay);

    @Query("SELECT b FROM BangGiaPhong b JOIN b.loaiPhong lp WHERE " +
            "(:idLoaiPhong IS NULL OR lp.id = :idLoaiPhong) " +
            "AND (:q IS NULL OR :q = '' OR LOWER(b.tenChinhSach) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(lp.ten) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "ORDER BY lp.ten ASC, b.ngayBatDau DESC")
    Page<BangGiaPhong> timCoPhanTrang(
            @Param("q") String q,
            @Param("idLoaiPhong") Long idLoaiPhong,
            Pageable pageable);
}
