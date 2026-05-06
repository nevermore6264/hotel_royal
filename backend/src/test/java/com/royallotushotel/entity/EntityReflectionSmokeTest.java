package com.royallotushotel.entity;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EntityReflectionSmokeTest {

    private static final List<Class<?>> ENTITIES = List.of(
            AnhPhong.class, BangGiaPhong.class, ChiTietDatPhong.class, ChinhSachHuyPhong.class, CuocTroChuyen.class,
            DanhGia.class, DatPhong.class, DichVu.class, GiaoDichThanhToan.class, HoanTien.class, KhachHang.class,
            LichSuTrangThaiDatPhong.class, LichSuTrangThaiPhong.class, LoaiPhong.class, MaLamMoiPhien.class,
            NguoiDung.class, NhatKyEmail.class, NhatKyHeThong.class, NhatKyKiemToan.class, Phong.class, Quyen.class,
            SuDungDichVu.class, ThanhToan.class, ThongBao.class, TinNhanChat.class, VaiTro.class
    );

    @Test
    void shouldInstantiateAndSetBasicFields() throws Exception {
        for (Class<?> entityClass : ENTITIES) {
            Constructor<?> constructor = entityClass.getDeclaredConstructor();
            constructor.setAccessible(true);
            Object instance = constructor.newInstance();

            for (Field field : entityClass.getDeclaredFields()) {
                field.setAccessible(true);
                Object value = sampleValue(field.getType());
                if (value != null) {
                    field.set(instance, value);
                }
            }
            assertThat(instance).isNotNull();
        }
    }

    private Object sampleValue(Class<?> type) {
        if (type == String.class) return "x";
        if (type == Long.class || type == long.class) return 1L;
        if (type == Integer.class || type == int.class) return 1;
        if (type == Boolean.class || type == boolean.class) return true;
        if (type == BigDecimal.class) return BigDecimal.ONE;
        if (type == LocalDate.class) return LocalDate.now();
        if (type == LocalDateTime.class) return LocalDateTime.now();
        return null;
    }
}
