package com.royallotushotel.repository;

import com.royallotushotel.entity.CuocTroChuyen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CuocTroChuyenRepository extends JpaRepository<CuocTroChuyen, Long> {

    Optional<CuocTroChuyen> findByNguoiDungKhach_IdAndNguoiHoTro_Id(Long idNguoiDungKhach, Long idNguoiHoTro);

    List<CuocTroChuyen> findByNguoiHoTro_IdOrderByThoiDiemCapNhatDesc(Long idNguoiHoTro);

    List<CuocTroChuyen> findAllByOrderByThoiDiemCapNhatDesc();
}
