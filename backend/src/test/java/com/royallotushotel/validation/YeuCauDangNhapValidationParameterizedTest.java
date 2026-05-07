package com.royallotushotel.validation;

import com.royallotushotel.dto.YeuCauDangNhap;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class YeuCauDangNhapValidationParameterizedTest {

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
        return Stream.of(
                Arguments.of("dayDu", "admin", "secret1"),
                Arguments.of("tenDai", "a".repeat(200), "b".repeat(200)),
                Arguments.of("mkMotKyTu", "u", "x"),
                Arguments.of("kyTuDacBiet", "user@1", "p@ss#!"),
                Arguments.of("unicode", "tên", "mậtKhẩu"),
                Arguments.of("so", "0909", "0000"),
                Arguments.of("khoangTrongGiua", "user name", "pass word"),
                Arguments.of("gachDuoi", "user_name", "pass_word"),
                Arguments.of("cham", "user.name", "pass.word"),
                Arguments.of("tabTrongChuoi", "u\tv", "p\tw"),
                Arguments.of("dauNhay", "user'1", "pass\"2"),
                Arguments.of("zeroWidth", "\u200buser", "pass\u200b"),
                Arguments.of("emailStyleTen", "a@b.c", "m"),
                Arguments.of("toanSo", "123456789", "987654321"),
                Arguments.of("haiKyTuTen", "ab", "cd")
        );
    }

    @ParameterizedTest(name = "hopLe {0}")
    @MethodSource("hopLe")
    void chapNhan(String ten, String tenDangNhap, String matKhau) {
        YeuCauDangNhap y = new YeuCauDangNhap();
        y.setTenDangNhap(tenDangNhap);
        y.setMatKhau(matKhau);
        assertThat(validator.validate(y)).as(ten).isEmpty();
    }

    static Stream<Arguments> khongHopLe() {
        return Stream.of(
                Arguments.of("tenTrang", "   ", "mk"),
                Arguments.of("tenNull", null, "mk"),
                Arguments.of("mkTrang", "user", "   "),
                Arguments.of("mkNull", "user", null),
                Arguments.of("caHaiTrang", "  ", "  "),
                Arguments.of("caHaiNull", null, null),
                Arguments.of("tenRong", "", "mk"),
                Arguments.of("mkRong", "user", "")
        );
    }

    @ParameterizedTest(name = "tuChoi {0}")
    @MethodSource("khongHopLe")
    void tuChoi(String ten, String tenDangNhap, String matKhau) {
        YeuCauDangNhap y = new YeuCauDangNhap();
        y.setTenDangNhap(tenDangNhap);
        y.setMatKhau(matKhau);
        assertThat(validator.validate(y)).as(ten).isNotEmpty();
    }
}
