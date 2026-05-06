package com.royallotushotel.repository;

import com.royallotushotel.entity.DatPhong;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DatPhongRepository extends JpaRepository<DatPhong, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM DatPhong d WHERE d.id = :id")
    Optional<DatPhong> timVaKhoaTheoId(@Param("id") Long id);

    List<DatPhong> findByKhachHang_IdOrderByThoiGianTaoDesc(Long idKhachHang);

    Page<DatPhong> findAllByOrderByThoiGianTaoDesc(Pageable pageable);

    @Query("SELECT d FROM DatPhong d JOIN d.khachHang k WHERE (:trangThai IS NULL OR d.trangThai = :trangThai) " +
            "AND (:tu IS NULL OR d.ngayNhanPhong >= :tu) AND (:den IS NULL OR d.ngayNhanPhong <= :den) " +
            "AND (:q IS NULL OR :q = '' OR LOWER(k.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "k.soDienThoai LIKE CONCAT('%', :q, '%') OR LOWER(COALESCE(k.email,'')) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "ORDER BY d.thoiGianTao DESC")
    Page<DatPhong> timLoc(
            @Param("trangThai") String trangThai,
            @Param("tu") LocalDate tu,
            @Param("den") LocalDate den,
            @Param("q") String q,
            Pageable pageable);

    @Query("SELECT b FROM DatPhong b WHERE b.khachHang.id = :idKhachHang ORDER BY b.thoiGianTao DESC")
    List<DatPhong> timLichSuTheoKhach(@Param("idKhachHang") Long idKhachHang);

    @Query("SELECT d.id FROM DatPhong d WHERE d.trangThai = 'CHO_DUYET' AND d.thoiGianTao IS NOT NULL AND d.thoiGianTao < :truoc")
    List<Long> timIdChoDuyetTaoTruoc(@Param("truoc") LocalDateTime truoc);

    @Query("SELECT b FROM DatPhong b WHERE b.ngayNhanPhong <= :ngay AND b.ngayTraPhong >= :ngay AND b.trangThai = 'DA_NHAN_PHONG'")
    List<DatPhong> timLuuTruDangHoatDongVaoNgay(@Param("ngay") LocalDate ngay);

    @Query("SELECT COALESCE(SUM(tt.tongDaThu), 0) FROM DatPhong b " +
           "LEFT JOIN b.thanhToan tt " +
           "WHERE b.trangThai IN ('DA_XAC_NHAN','DA_NHAN_PHONG','DA_TRA_PHONG') " +
           "AND b.ngayNhanPhong >= :tu AND b.ngayNhanPhong <= :den")
    java.math.BigDecimal tongDoanhThuTheoKhoangNgay(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT COUNT(b) FROM DatPhong b WHERE b.trangThai IN ('DA_XAC_NHAN','DA_NHAN_PHONG','DA_TRA_PHONG') " +
           "AND b.ngayNhanPhong >= :tu AND b.ngayNhanPhong <= :den")
    Long demDatPhongTheoKhoangNgay(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT b.ngayNhanPhong, COALESCE(SUM(tt.tongDaThu), 0) FROM DatPhong b " +
           "LEFT JOIN b.thanhToan tt WHERE b.trangThai IN ('DA_XAC_NHAN','DA_NHAN_PHONG','DA_TRA_PHONG') " +
           "AND b.ngayNhanPhong >= :tu AND b.ngayNhanPhong <= :den " +
           "GROUP BY b.ngayNhanPhong ORDER BY b.ngayNhanPhong ASC")
    List<Object[]> tongDoanhThuGomTheoNgay(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT b.trangThai, COUNT(b) FROM DatPhong b GROUP BY b.trangThai ORDER BY b.trangThai")
    List<Object[]> demNhomTheoTrangThaiDatPhong();

    @Query("SELECT b.ngayNhanPhong, COUNT(b) FROM DatPhong b " +
           "WHERE b.trangThai IN ('DA_XAC_NHAN','DA_NHAN_PHONG','DA_TRA_PHONG') " +
           "AND b.ngayNhanPhong >= :tu AND b.ngayNhanPhong <= :den " +
           "GROUP BY b.ngayNhanPhong ORDER BY b.ngayNhanPhong ASC")
    List<Object[]> demDonGomTheoNgayNhan(@Param("tu") LocalDate tu, @Param("den") LocalDate den);

    @Query("SELECT lp.ten, COALESCE(SUM(ct.gia), 0) FROM DatPhong b " +
           "JOIN b.chiTiet ct JOIN ct.phong p JOIN p.loaiPhong lp " +
           "WHERE b.trangThai IN ('DA_XAC_NHAN','DA_NHAN_PHONG','DA_TRA_PHONG') " +
           "AND b.ngayNhanPhong >= :tu AND b.ngayNhanPhong <= :den " +
           "GROUP BY lp.id, lp.ten ORDER BY SUM(ct.gia) DESC")
    List<Object[]> tongThanhTienPhongGomTheoLoaiPhong(@Param("tu") LocalDate tu, @Param("den") LocalDate den);
}
