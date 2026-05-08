package com.royallotushotel.hangso;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Arrays;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class HangSoStringConstantsParameterizedTest {

    private static final Class<?>[] LOP_HANG_SO = {
            MaKieuTinChat.class,
            MaPhuongThucThanhToan.class,
            MaTrangThaiDatPhong.class,
            MaTrangThaiEmail.class,
            MaTrangThaiNguoiDung.class,
            LoaiGiaoDichThanhToan.class,
            MaTrangThaiPhong.class,
            MaTrangThaiVeSinh.class,
            MaLoaiTaiKhoan.class,
            MaVaiTro.class,
            MaTrangThaiChiTietDatPhong.class,
            MaTrangThaiThanhToan.class,
    };

    static Stream<Arguments> tatCaTruongChuoi() {
        return Arrays.stream(LOP_HANG_SO).flatMap(HangSoStringConstantsParameterizedTest::truongChuoi);
    }

    private static Stream<Arguments> truongChuoi(Class<?> clazz) {
        return Arrays.stream(clazz.getDeclaredFields())
                .filter(f -> Modifier.isPublic(f.getModifiers()))
                .filter(f -> Modifier.isStatic(f.getModifiers()))
                .filter(f -> Modifier.isFinal(f.getModifiers()))
                .filter(f -> f.getType() == String.class)
                .map(f -> {
                    try {
                        String giaTri = (String) f.get(null);
                        return Arguments.of(clazz.getSimpleName(), f.getName(), giaTri);
                    } catch (IllegalAccessException e) {
                        throw new IllegalStateException(f.toString(), e);
                    }
                });
    }

    @ParameterizedTest(name = "{0}.{1}")
    @MethodSource("tatCaTruongChuoi")
    void hangSoLaChuoiKhongRongVaOnDinh(String lop, String tenTruong, String giaTri) {
        assertThat(giaTri).as("%s.%s", lop, tenTruong).isNotBlank();
        assertThat(giaTri).isEqualTo(giaTri.trim());
        assertThat(tenTruong).matches("[A-Z][A-Z0-9_]*");
    }
}
