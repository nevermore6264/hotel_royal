package com.royallotushotel.repository;

import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.entity.LoaiPhong;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.entity.VaiTro;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryH2SmokeTest {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;
    @Autowired
    private VaiTroRepository vaiTroRepository;
    @Autowired
    private KhachHangRepository khachHangRepository;
    @Autowired
    private LoaiPhongRepository loaiPhongRepository;

    @Test
    void shouldPersistAndQueryCoreRepositories() {
        VaiTro role = VaiTro.builder().ten("ROLE_QUAN_TRI").build();
        role = vaiTroRepository.save(role);

        NguoiDung nd = NguoiDung.builder()
                .tenDangNhap("admin")
                .matKhau("pw")
                .email("admin@test.com")
                .trangThai("HOAT_DONG")
                .vaiTro(Set.of(role))
                .build();
        nd = nguoiDungRepository.save(nd);

        KhachHang kh = KhachHang.builder()
                .hoTen("Nguyen Van A")
                .soDienThoai("0123456789")
                .email("kh@test.com")
                .soCanCuoc("123456789")
                .nguoiDung(nd)
                .build();
        khachHangRepository.save(kh);

        LoaiPhong lp = LoaiPhong.builder().ten("Deluxe").gia(BigDecimal.valueOf(1000000)).sucChuaToiDa(2).build();
        loaiPhongRepository.save(lp);

        assertThat(nguoiDungRepository.findByTenDangNhap("admin")).isPresent();
        assertThat(nguoiDungRepository.existsByEmail("admin@test.com")).isTrue();
        assertThat(khachHangRepository.timKiem("Nguyen")).hasSize(1);
        assertThat(loaiPhongRepository.timCoPhanTrang("Del", PageRequest.of(0, 10)).getTotalElements()).isEqualTo(1);
    }
}
