package com.royallotushotel.repository;

import com.royallotushotel.entity.YeuCauHuyPhong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface YeuCauHuyPhongRepository extends JpaRepository<YeuCauHuyPhong, Long> {

    @Query("""
            SELECT y FROM YeuCauHuyPhong y
            JOIN FETCH y.datPhong dp
            LEFT JOIN FETCH y.chiTietDatPhong ct
            LEFT JOIN FETCH ct.phong
            WHERE y.trangThai = :tt
            ORDER BY y.thoiDiemYeuCau ASC
            """)
    List<YeuCauHuyPhong> timTheoTrangThai(@Param("tt") String trangThai);

    @Query("""
            SELECT y FROM YeuCauHuyPhong y
            JOIN FETCH y.datPhong dp
            LEFT JOIN FETCH y.chiTietDatPhong ct
            LEFT JOIN FETCH ct.phong
            WHERE dp.id = :idDatPhong
            ORDER BY y.thoiDiemYeuCau DESC
            """)
    List<YeuCauHuyPhong> timTheoDatPhong(@Param("idDatPhong") Long idDatPhong);

    boolean existsByDatPhong_IdAndChiTietDatPhong_IdAndTrangThaiIn(
            Long idDatPhong, Long idChiTiet, List<String> trangThai);

    boolean existsByDatPhong_IdAndChiTietDatPhongIsNullAndTrangThaiIn(
            Long idDatPhong, List<String> trangThai);

    @Query("""
            SELECT y FROM YeuCauHuyPhong y
            JOIN FETCH y.datPhong dp
            LEFT JOIN FETCH y.chiTietDatPhong ct
            LEFT JOIN FETCH ct.phong
            WHERE y.id = :id
            """)
    Optional<YeuCauHuyPhong> timChiTietTheoId(@Param("id") Long id);
}
