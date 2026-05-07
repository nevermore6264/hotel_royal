package com.royallotushotel.validation;

import com.royallotushotel.dto.YeuCauTaoDatPhong;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauTaoDatPhongValidationParameterizedTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void khoiTao() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void dong() {
        if (factory != null) {
            factory.close();
        }
    }

    static Stream<Arguments> hopLe() {
        LocalDate n1 = LocalDate.of(2026, 6, 1);
        LocalDate n2 = LocalDate.of(2026, 6, 5);
        return Stream.of(
                Arguments.of("motPhong", 1L, n1, n2, List.of(10L)),
                Arguments.of("nhieuPhong", 2L, n1, n2, List.of(1L, 2L, 3L)),
                Arguments.of("danhSachRongHopLe", 3L, n1, n2, Collections.emptyList()),
                Arguments.of("coTenKhach", 4L, n1, n2, List.of(9L)),
                Arguments.of("cungNgay", 5L, n1, n1, List.of(1L)),
                Arguments.of("namNhuan", 6L, LocalDate.of(2028, 2, 28), LocalDate.of(2028, 2, 29), List.of(1L)),
                Arguments.of("thongTinKhachTuChon", 7L, n1, n2, List.of(5L))
        );
    }

    @ParameterizedTest(name = "hopLe {0}")
    @MethodSource("hopLe")
    void chapNhan(
            String ten,
            Long idKhach,
            LocalDate nhan,
            LocalDate tra,
            List<Long> idPhong) {
        YeuCauTaoDatPhong y = new YeuCauTaoDatPhong();
        y.setIdKhachHang(idKhach);
        y.setNgayNhanPhong(nhan);
        y.setNgayTraPhong(tra);
        y.setIdPhong(idPhong);
        y.setTenKhach("Khách");
        y.setSdtKhach("090");
        y.setEmailKhach("k@test.vn");
        assertThat(validator.validate(y)).as(ten).isEmpty();
    }

    static Stream<Arguments> khongHopLe() {
        LocalDate n1 = LocalDate.of(2026, 6, 1);
        LocalDate n2 = LocalDate.of(2026, 6, 5);
        return Stream.of(
                Arguments.of("idKhachNull", null, n1, n2, List.of(1L)),
                Arguments.of("ngayNhanNull", 1L, null, n2, List.of(1L)),
                Arguments.of("ngayTraNull", 1L, n1, null, List.of(1L)),
                Arguments.of("idPhongNull", 1L, n1, n2, null),
                Arguments.of("nhieuNull", null, null, null, null)
        );
    }

    @ParameterizedTest(name = "tuChoi {0}")
    @MethodSource("khongHopLe")
    void tuChoi(
            String ten,
            Long idKhach,
            LocalDate nhan,
            LocalDate tra,
            List<Long> idPhong) {
        YeuCauTaoDatPhong y = new YeuCauTaoDatPhong();
        y.setIdKhachHang(idKhach);
        y.setNgayNhanPhong(nhan);
        y.setNgayTraPhong(tra);
        y.setIdPhong(idPhong);
        assertThat(validator.validate(y)).as(ten).isNotEmpty();
    }
}
