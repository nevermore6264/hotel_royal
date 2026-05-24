package com.royallotushotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DongKetQuaNhapExcelDatPhongDto {
    private int soDongExcel;
    private boolean thanhCong;
    private String loi;
    private Long idDatPhong;
    private String hoTenDong;
    private String lienHeDong;
    private String yeuCauPhongNgayDong;
    private String soPhongDaGan;
    private String goiYLoaiPhong;
}
