package com.royallotushotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class YeuCauGuiTinKhach {
    /** Văn bản hoặc đường dẫn ảnh /api/uploads/chat/... */
    private String noiDung;

    /** MaKieuTinChat: VAN_BAN (mặc định), ANH */
    private String kieuTin;

    @NotNull
    private Long idNguoiHoTro;
}
