package com.royallotushotel.repository;

import com.royallotushotel.entity.NguoiDung;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    Optional<NguoiDung> findByEmail(String email);

    boolean existsByTenDangNhap(String tenDangNhap);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    @Query("SELECT DISTINCT n FROM NguoiDung n JOIN n.vaiTro v WHERE v.ten IN ('ROLE_LE_TAN','ROLE_QUAN_TRI') AND n.trangThai = :tt ORDER BY n.hoTen ASC, n.tenDangNhap ASC")
    List<NguoiDung> timNhanVienHoTroChat(@Param("tt") String trangThai);

    @Query("SELECT DISTINCT n FROM NguoiDung n WHERE " +
            "(:q IS NULL OR :q = '' OR LOWER(n.tenDangNhap) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(n.email) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(COALESCE(n.hoTen,'')) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "AND (:trangThai IS NULL OR n.trangThai = :trangThai) " +
            "AND (:vaiTro IS NULL OR EXISTS (SELECT 1 FROM n.vaiTro vr WHERE vr.ten = :vaiTro)) " +
            "ORDER BY n.id DESC")
    Page<NguoiDung> timCoPhanTrang(
            @Param("q") String q,
            @Param("trangThai") String trangThai,
            @Param("vaiTro") String vaiTro,
            Pageable pageable);
}
