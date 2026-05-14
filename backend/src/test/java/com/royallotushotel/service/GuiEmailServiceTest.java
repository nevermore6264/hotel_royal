package com.royallotushotel.service;

import com.royallotushotel.dto.ThongTinEmailDatPhong;
import com.royallotushotel.entity.NhatKyEmail;
import com.royallotushotel.hangso.MaTrangThaiEmail;
import com.royallotushotel.repository.NhatKyEmailRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GuiEmailServiceTest {

    @Mock
    private JavaMailSender mailSender;
    @Mock
    private NhatKyEmailRepository nhatKyEmailRepository;
    @InjectMocks
    private GuiEmailService guiEmailService;

    @Test
    void guiThongBaoDatPhong_boQuaKhiKhongCoEmail() {
        ReflectionTestUtils.setField(guiEmailService, "emailGui", "noreply@test.com");
        ReflectionTestUtils.setField(guiEmailService, "frontendBaseUrl", "http://localhost:5173");
        guiEmailService.guiThongBaoDatPhong(
                new ThongTinEmailDatPhong(
                        "A",
                        "   ",
                        1L,
                        LocalDate.now(),
                        LocalDate.now().plusDays(1),
                        BigDecimal.ONE,
                        List.of(),
                        false));
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void guiThongBaoDatPhong_ghiLogThatBaiKhiChuaCauHinhMailGui() {
        ReflectionTestUtils.setField(guiEmailService, "emailGui", "  ");
        ReflectionTestUtils.setField(guiEmailService, "frontendBaseUrl", "http://localhost:5173");
        when(nhatKyEmailRepository.save(any(NhatKyEmail.class))).thenAnswer(inv -> inv.getArgument(0));
        guiEmailService.guiThongBaoDatPhong(
                new ThongTinEmailDatPhong(
                        "A",
                        "a@b.c",
                        1L,
                        LocalDate.now(),
                        LocalDate.now().plusDays(1),
                        BigDecimal.ONE,
                        List.of(),
                        false));
        verify(mailSender, never()).send(any(MimeMessage.class));
        verify(nhatKyEmailRepository).save(argThat(n -> MaTrangThaiEmail.THAT_BAI.equals(n.getTrangThai())));
    }
}
