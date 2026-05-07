package com.royallotushotel.repository;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.core.ResolvableType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Đảm bảo mỗi repository khai báo đúng kiểu thực thể và khóa cho {@link JpaRepository}.
 */
class JpaRepositoryEntityIdTypeTest {

    static Stream<Arguments> tatCaRepo() {
        return Stream.of(
                Arguments.of(BangGiaPhongRepository.class),
                Arguments.of(ChinhSachHuyPhongRepository.class),
                Arguments.of(CuocTroChuyenRepository.class),
                Arguments.of(DanhGiaRepository.class),
                Arguments.of(DatPhongRepository.class),
                Arguments.of(DichVuRepository.class),
                Arguments.of(HoanTienRepository.class),
                Arguments.of(KhachHangRepository.class),
                Arguments.of(LoaiPhongRepository.class),
                Arguments.of(MaLamMoiPhienRepository.class),
                Arguments.of(NguoiDungRepository.class),
                Arguments.of(NhatKyEmailRepository.class),
                Arguments.of(NhatKyHeThongRepository.class),
                Arguments.of(PhongRepository.class),
                Arguments.of(SuDungDichVuRepository.class),
                Arguments.of(ThanhToanRepository.class),
                Arguments.of(TinNhanChatRepository.class),
                Arguments.of(VaiTroRepository.class),
                Arguments.of(LichSuTrangThaiDatPhongRepository.class),
                Arguments.of(LichSuTrangThaiPhongRepository.class)
        );
    }

    @ParameterizedTest
    @MethodSource("tatCaRepo")
    void repoCoEntityVaKhoa(Class<?> repoClass) {
        assertThat(JpaRepository.class).isAssignableFrom(repoClass);
        ResolvableType rt = ResolvableType.forClass(repoClass).as(JpaRepository.class);
        Class<?> entity = rt.getGeneric(0).resolve();
        Class<?> id = rt.getGeneric(1).resolve();
        assertThat(entity).as("entity cho %s", repoClass.getSimpleName()).isNotNull();
        assertThat(id).as("id cho %s", repoClass.getSimpleName()).isNotNull();
    }
}
