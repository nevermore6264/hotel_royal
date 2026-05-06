package com.royallotushotel.job;

import com.royallotushotel.repository.DatPhongRepository;
import com.royallotushotel.service.DatPhongService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TuDongHuyDatChoHetHanThanhToanScheduler {

    private final DatPhongRepository datPhongRepository;
    private final DatPhongService datPhongService;

    @Value("${app.dat-phong.phut-giu-cho-thanh-toan:30}")
    private int phutGiuChoThanhToan;

    @Scheduled(
            fixedDelayString = "${app.dat-phong.tan-so-quet-giay:60}000",
            initialDelayString = "${app.dat-phong.tan-so-quet-giay:60}000")
    public void quetVaHuy() {
        if (phutGiuChoThanhToan <= 0) {
            return;
        }
        LocalDateTime moc = LocalDateTime.now().minusMinutes(phutGiuChoThanhToan);
        List<Long> ids = datPhongRepository.timIdChoDuyetTaoTruoc(moc);
        for (Long id : ids) {
            try {
                datPhongService.huyTuDongNeuCanTheoId(id);
            } catch (Exception e) {
                log.warn("Tự động hủy đặt phòng {} thất bại: {}", id, e.getMessage());
            }
        }
    }
}
