package com.royallotushotel.service;

import com.royallotushotel.dto.ThongTinEmailDatPhong;
import com.royallotushotel.entity.NhatKyEmail;
import com.royallotushotel.hangso.MaTrangThaiEmail;
import com.royallotushotel.mail.MauHtmlEmailDatPhong;
import com.royallotushotel.repository.NhatKyEmailRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuiEmailService {

    private final JavaMailSender mailSender;
    private final NhatKyEmailRepository nhatKyEmailRepository;

    @Value("${spring.mail.username:}")
    private String emailGui;

    @Value("${app.mail.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Async
    public void guiThongBaoDatPhong(ThongTinEmailDatPhong t) {
        if (t == null || t.emailNhan() == null || t.emailNhan().isBlank()) {
            return;
        }
        String tieuDe = t.laXacNhanTuLeTan()
                ? "Đơn đặt phòng đã được xác nhận · Royal Lotus Hotel"
                : "Đã nhận yêu cầu đặt phòng · Royal Lotus Hotel";
        String html = MauHtmlEmailDatPhong.html(t, frontendBaseUrl);
        String plain = MauHtmlEmailDatPhong.noiDungThuong(t, frontendBaseUrl);
        guiMimeVaGhiLog(t.emailNhan().trim(), tieuDe, plain, html);
    }

    private void guiMimeVaGhiLog(String den, String tieuDe, String plain, String html) {
        NhatKyEmail banGhi = NhatKyEmail.builder()
                .emailNguoiNhan(den)
                .tieuDe(tieuDe)
                .trangThai(MaTrangThaiEmail.THAT_BAI)
                .build();
        try {
            if (emailGui == null || emailGui.isBlank()) {
                log.warn("spring.mail.username chưa cấu hình — bỏ qua gửi email");
                nhatKyEmailRepository.save(banGhi);
                return;
            }
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setFrom(emailGui);
            helper.setTo(den);
            helper.setSubject(tieuDe);
            helper.setText(plain, html);
            mailSender.send(mime);
            banGhi.setTrangThai(MaTrangThaiEmail.DA_GUI);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("PKIX") || msg.contains("CertPathBuilderException")) {
                log.warn(
                        "Gửi email thất bại (TLS/PKIX): {} — Nếu mạng công ty chặn SSL: nhập CA proxy vào cacerts JVM, "
                                + "hoặc chỉ dev: MAIL_SMTP_TRUST_INSECURE=true (xem app.mail.smtp-trust-insecure).",
                        e.getMessage());
            } else {
                log.warn("Gửi email thất bại: {}", e.getMessage());
            }
        }
        nhatKyEmailRepository.save(banGhi);
    }
}
