package com.royallotushotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KetQuaNhapExcelDatPhongDto {
    private int tongHang;
    private int soThanhCong;
    private int soThatBai;
    @Builder.Default
    private List<DongKetQuaNhapExcelDatPhongDto> chiTiet = new ArrayList<>();
}
