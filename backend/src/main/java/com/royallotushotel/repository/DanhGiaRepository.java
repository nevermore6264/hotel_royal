package com.royallotushotel.repository;

import com.royallotushotel.entity.DanhGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {
    List<DanhGia> findByLoaiPhong_IdOrderByThoiDiemDesc(Long idLoaiPhong);

    boolean existsByLoaiPhong_IdAndNguoiDung_Id(Long idLoaiPhong, Long idNguoiDung);
}
