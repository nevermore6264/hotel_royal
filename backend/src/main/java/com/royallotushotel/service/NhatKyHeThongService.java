package com.royallotushotel.service;

import com.royallotushotel.dto.NhatKyHeThongDto;
import com.royallotushotel.entity.NhatKyHeThong;
import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.NhatKyHeThongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NhatKyHeThongService {

    private final NhatKyHeThongRepository nhatKyHeThongRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Transactional
    public void ghi(String hanhDong, String chiTiet, Long idNguoiDung) {
        NhatKyHeThong nk = NhatKyHeThong.builder()
                .thoiDiem(LocalDateTime.now())
                .hanhDong(hanhDong)
                .chiTiet(chiTiet)
                .build();
        if (idNguoiDung != null) {
            NguoiDung nd = nguoiDungRepository.findById(idNguoiDung).orElse(null);
            nk.setNguoiDung(nd);
        }
        nhatKyHeThongRepository.save(nk);
    }

    @Transactional(readOnly = true)
    public Page<NhatKyHeThongDto> timTatCa(Pageable phanTrang) {
        return timLoc(phanTrang, null, null, null);
    }

    @Transactional(readOnly = true)
    public Page<NhatKyHeThongDto> timLoc(
            Pageable phanTrang,
            String q,
            LocalDateTime tu,
            LocalDateTime den) {
        String qq = (q != null && !q.isBlank()) ? q.trim() : null;
        return nhatKyHeThongRepository.timLoc(qq, tu, den, phanTrang)
                .map(nk -> NhatKyHeThongDto.builder()
                        .id(nk.getId())
                        .thoiDiem(nk.getThoiDiem())
                        .hanhDong(nk.getHanhDong())
                        .chiTiet(nk.getChiTiet())
                        .tenDangNhapNguoiThucHien(nk.getNguoiDung() != null ? nk.getNguoiDung().getTenDangNhap() : null)
                        .build());
    }
}
