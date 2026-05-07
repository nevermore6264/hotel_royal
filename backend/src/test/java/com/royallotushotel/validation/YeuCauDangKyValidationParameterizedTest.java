package com.royallotushotel.validation;

import com.royallotushotel.dto.YeuCauDangKy;
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

class YeuCauDangKyValidationParameterizedTest {

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

    static Stream<Arguments> duLieuHopLe() {
        return Stream.of(
                Arguments.of("dayDu", "nguoidung1", "matkhau1", "guest@hotel.test", "Nguyen Van A", null, "KHACH_HANG"),
                Arguments.of("sdt20", "user_xyz", "12345678", "u@example.com", "Ten", "01234567890123456789", null),
                Arguments.of("ten3KyTu", "abc", "123456", "a@b.co", "Ten", null, null),
                Arguments.of("hoTen255", "user", "123456", "mail@test.vn", "H".repeat(255), null, null),
                Arguments.of("emailCongTy", "staff01", "secret12", "contact@royal-lotus.vn", "NV", null, null),
                Arguments.of("tenGachDuoi", "user_name", "123456", "e@e.co", "Ten", null, null),
                Arguments.of("tenSo", "user99", "123456", "e@e.co", "Ten", null, null),
                Arguments.of("sdtRong", "user", "123456", "e@e.co", "Ten", "", null),
                Arguments.of("sdtMotSo", "user", "123456", "e@e.co", "Ten", "0", null),
                Arguments.of("mkDai", "user", "p".repeat(80), "e@e.co", "Ten", null, null),
                Arguments.of("ten100", "a".repeat(100), "123456", "e@e.co", "Ten", null, null),
                Arguments.of("emailPlus", "user", "123456", "name+tag@domain.com", "Ten", null, null),
                Arguments.of("emailSubdomain", "user", "123456", "a@sub.domain.co.uk", "Ten", null, null),
                Arguments.of("hoTenUnicode", "user", "123456", "e@e.co", "Trần Thị Hà", null, null),
                Arguments.of("sdtKhoang", "user", "123456", "e@e.co", "Ten", "090 111 2222", null),
                Arguments.of("loaiTk", "user", "123456", "e@e.co", "Ten", null, "VANG_LAI"),
                Arguments.of("emailDauCham", "user", "123456", "first.last@company.com", "Ten", null, null),
                Arguments.of("tenCham", "user.name", "123456", "e@e.co", "Ten", null, null),
                Arguments.of("emailSoTenMien", "user", "123456", "admin@123.com", "Ten", null, null),
                Arguments.of("sdtDayDu", "user", "123456", "e@e.co", "Ten", "+84901234567", null)
        );
    }

    @ParameterizedTest(name = "hopLe: {0}")
    @MethodSource("duLieuHopLe")
    void dangKyHopLeQuaValidation(
            String tenCase,
            String tenDangNhap,
            String matKhau,
            String email,
            String hoTen,
            String sdt,
            String loaiTk) {
        YeuCauDangKy y = new YeuCauDangKy();
        y.setTenDangNhap(tenDangNhap);
        y.setMatKhau(matKhau);
        y.setEmail(email);
        y.setHoTen(hoTen);
        y.setSoDienThoai(sdt);
        y.setLoaiTaiKhoan(loaiTk);
        assertThat(validator.validate(y)).as(tenCase).isEmpty();
    }

    static Stream<Arguments> duLieuKhongHopLe() {
        return Stream.of(
                Arguments.of("tenTrang", "   ", "123456", "e@e.co", "Ten", null),
                Arguments.of("tenNull", null, "123456", "e@e.co", "Ten", null),
                Arguments.of("tenNgan", "ab", "123456", "e@e.co", "Ten", null),
                Arguments.of("tenQuaDai", "a".repeat(101), "123456", "e@e.co", "Ten", null),
                Arguments.of("mkTrang", "userok", "   ", "e@e.co", "Ten", null),
                Arguments.of("mkNull", "userok", null, "e@e.co", "Ten", null),
                Arguments.of("mkNgan", "userok", "12345", "e@e.co", "Ten", null),
                Arguments.of("emailTrang", "userok", "123456", "   ", "Ten", null),
                Arguments.of("emailNull", "userok", "123456", null, "Ten", null),
                Arguments.of("emailKhongHopLe", "userok", "123456", "khong-phai-email", "Ten", null),
                Arguments.of("emailThieuMien", "userok", "123456", "a@", "Ten", null),
                Arguments.of("emailThieuTen", "userok", "123456", "@domain.com", "Ten", null),
                Arguments.of("hoTenTrang", "userok", "123456", "e@e.co", "   ", null),
                Arguments.of("hoTenNull", "userok", "123456", "e@e.co", null, null),
                Arguments.of("sdtQuaDai", "userok", "123456", "e@e.co", "Ten", "0".repeat(21)),
                Arguments.of("emailChiKyTu", "u", "123456", "@", "Ten", null),
                Arguments.of("emailKhongCoKyTuAt", "u", "123456", "user.domain.com", "Ten", null),
                Arguments.of("hoTen256", "u", "123456", "e@e.co", "H".repeat(256), null),
                Arguments.of("nhieuLoi1", "ab", "123", "x", "", "000000000000000000000"),
                Arguments.of("mk5KyTu", "userok", "12345", "e@e.co", "Ten", null),
                Arguments.of("emailKhoangTrong", "userok", "123456", "  e@e.co  ", "Ten", null)
        );
    }

    @ParameterizedTest(name = "khongHopLe: {0}")
    @MethodSource("duLieuKhongHopLe")
    void dangKyBiTuChoi(
            String tenCase,
            String tenDangNhap,
            String matKhau,
            String email,
            String hoTen,
            String sdt) {
        YeuCauDangKy y = new YeuCauDangKy();
        y.setTenDangNhap(tenDangNhap);
        y.setMatKhau(matKhau);
        y.setEmail(email);
        y.setHoTen(hoTen);
        y.setSoDienThoai(sdt);
        assertThat(validator.validate(y)).as(tenCase).isNotEmpty();
    }
}
