package com.royallotushotel.service;

import com.royallotushotel.entity.DatPhong;
import com.royallotushotel.entity.NhatKyEmail;
import com.royallotushotel.hangso.MaTrangThaiEmail;
import com.royallotushotel.repository.NhatKyEmailRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class GuiEmailService {

    private final JavaMailSender mailSender;
    private final NhatKyEmailRepository nhatKyEmailRepository;

    @Value("${spring.mail.username:}")
    private String emailGui;

    @Async
    public void guiXacNhanDatPhong(DatPhong datPhong, BigDecimal tongTien) {
        String den = datPhong.getEmailKhach() != null ? datPhong.getEmailKhach() : datPhong.getKhachHang().getEmail();
        if (den == null || den.isBlank()) return;
        String tieuDe = "Xac nhan dat phong - Royal Lotus Hotel";
        String noiDung = String.format(
                "Kinh gui %s,\n\nDat phong #%d da duoc xac nhan.\n" +
                "Ngay nhan phong: %s\nNgay tra phong: %s\nTong tien: %s VND\n\nTran trong,\nRoyal Lotus Hotel",
                datPhong.getTenKhach(), datPhong.getId(),
                datPhong.getNgayNhanPhong(), datPhong.getNgayTraPhong(),
                tongTien != null ? tongTien.toString() : "0"
        );
        guiVaGhiLog(den, tieuDe, noiDung);
    }

    private void guiVaGhiLog(String den, String tieuDe, String noiDung) {
        NhatKyEmail banGhi = NhatKyEmail.builder().emailNguoiNhan(den).tieuDe(tieuDe).trangThai(MaTrangThaiEmail.DA_GUI).build();
        try {
            if (emailGui != null && !emailGui.isBlank()) {
                SimpleMailMessage msg = new SimpleMailMessage();
                msg.setFrom(emailGui);
                msg.setTo(den);
                msg.setSubject(tieuDe);
                msg.setText(noiDung);
                mailSender.send(msg);
            }
        } catch (Exception e) {
            log.warn("Gui email that bai: " + e.getMessage());
            banGhi.setTrangThai(MaTrangThaiEmail.THAT_BAI);
        }
        nhatKyEmailRepository.save(banGhi);
    }
}
