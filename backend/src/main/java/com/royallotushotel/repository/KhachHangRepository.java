package com.royallotushotel.repository;

import com.royallotushotel.entity.KhachHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {
    Optional<KhachHang> findByEmail(String email);

    Optional<KhachHang> findFirstByEmailIgnoreCase(String email);

    List<KhachHang> findBySoDienThoai(String soDienThoai);

    Optional<KhachHang> findByNguoiDung_Id(Long idNguoiDung);

    @Query("SELECT c FROM KhachHang c WHERE LOWER(c.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR c.soDienThoai LIKE CONCAT('%', :q, '%') OR LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<KhachHang> timKiem(@Param("q") String tuKhoa);

    @Query("SELECT c FROM KhachHang c WHERE :q IS NULL OR :q = '' OR " +
            "LOWER(c.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "c.soDienThoai LIKE CONCAT('%', :q, '%') OR LOWER(COALESCE(c.email,'')) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "ORDER BY c.hoTen ASC")
    Page<KhachHang> timCoPhanTrang(@Param("q") String q, Pageable pageable);
}
