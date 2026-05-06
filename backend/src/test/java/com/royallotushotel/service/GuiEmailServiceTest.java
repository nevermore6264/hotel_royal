package com.royallotushotel.service;

import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.KhachHang;
import com.royallotushotel.repository.NhatKyEmailRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class GuiEmailServiceTest {

    @Mock
    private JavaMailSender mailSender;
    @Mock
    private NhatKyEmailRepository nhatKyEmailRepository;
    @InjectMocks
    private GuiEmailService guiEmailService;

    @Test
    void guiXacNhanDatPhong_boQuaKhiKhongCoEmail() {
        ReflectionTestUtils.setField(guiEmailService, "emailGui", "noreply@test.com");
        DatPhong dp = DatPhong.builder()
                .khachHang(KhachHang.builder().hoTen("A").email("").build())
                .emailKhach("   ")
                .build();
        guiEmailService.guiXacNhanDatPhong(dp, BigDecimal.ONE);
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}
