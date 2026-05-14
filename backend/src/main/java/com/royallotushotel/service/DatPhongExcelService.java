package com.royallotushotel.service;

import com.royallotushotel.dto.DongKetQuaNhapExcelDatPhongDto;
import com.royallotushotel.dto.KetQuaNhapExcelDatPhongDto;
import com.royallotushotel.dto.YeuCauTaoDatPhong;
import com.royallotushotel.entity.Phong;
import com.royallotushotel.repository.PhongRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DatPhongExcelService {

    private static final int MAX_DONG = 100;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("d/M/uuuu");

    private final DatPhongService datPhongService;
    private final PhongRepository phongRepository;
    private final DataFormatter dataFormatter = new DataFormatter();

    public byte[] taoMauLeTan() throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("DatPhong");
            Row h = sh.createRow(0);
            String[] cols = {
                    "SoPhong",
                    "NgayNhanPhong",
                    "NgayTraPhong",
                    "IdKhachHang",
                    "HoTen",
                    "SoDienThoai",
                    "Email",
            };
            for (int i = 0; i < cols.length; i++) {
                h.createCell(i).setCellValue(cols[i]);
            }
            for (int i = 0; i < cols.length; i++) {
                sh.autoSizeColumn(i);
            }
            wb.write(bos);
            return bos.toByteArray();
        }
    }

    public byte[] taoMauKhach() throws IOException {
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("DatPhong");
            Row h = sh.createRow(0);
            String[] cols = {
                    "SoPhong",
                    "NgayNhanPhong",
                    "NgayTraPhong",
                    "HoTen",
                    "SoDienThoai",
                    "Email",
            };
            for (int i = 0; i < cols.length; i++) {
                h.createCell(i).setCellValue(cols[i]);
            }
            for (int i = 0; i < cols.length; i++) {
                sh.autoSizeColumn(i);
            }
            wb.write(bos);
            return bos.toByteArray();
        }
    }

    public KetQuaNhapExcelDatPhongDto nhapLeTan(MultipartFile tep) throws IOException {
        kiemTraTep(tep);
        try (InputStream in = tep.getInputStream(); Workbook wb = new XSSFWorkbook(in)) {
            return xuLySheet(wb.getSheetAt(0), true, null);
        }
    }

    public KetQuaNhapExcelDatPhongDto nhapKhach(MultipartFile tep, Long idKhachHang) throws IOException {
        kiemTraTep(tep);
        if (idKhachHang == null) {
            throw new RuntimeException("Tài khoản chưa gắn hồ sơ khách hàng.");
        }
        try (InputStream in = tep.getInputStream(); Workbook wb = new XSSFWorkbook(in)) {
            return xuLySheet(wb.getSheetAt(0), false, idKhachHang);
        }
    }

    private void kiemTraTep(MultipartFile tep) {
        if (tep == null || tep.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn file Excel (.xlsx).");
        }
        String name = tep.getOriginalFilename() != null ? tep.getOriginalFilename().toLowerCase() : "";
        if (!name.endsWith(".xlsx")) {
            throw new RuntimeException("Chỉ chấp nhận file .xlsx (Excel 2007 trở lên).");
        }
    }

    private KetQuaNhapExcelDatPhongDto xuLySheet(Sheet sheet, boolean laLeTan, Long idKhachHangCd) {
        List<DongKetQuaNhapExcelDatPhongDto> chiTiet = new ArrayList<>();
        int thanhCong = 0;
        int thatBai = 0;
        int tongHang = 0;

        int last = sheet.getLastRowNum();
        for (int r = 1; r <= last; r++) {
            Row row = sheet.getRow(r);
            if (row == null || dongTrong(row, laLeTan)) {
                continue;
            }
            tongHang++;
            if (tongHang > MAX_DONG) {
                thatBai++;
                chiTiet.add(DongKetQuaNhapExcelDatPhongDto.builder()
                        .soDongExcel(r + 1)
                        .thanhCong(false)
                        .loi("Vượt quá " + MAX_DONG + " dòng dữ liệu — dừng xử lý.")
                        .build());
                break;
            }

            int excelRow = r + 1;
            try {
                String soPhong = layChuoi(row, 0);
                LocalDate nhan = layNgay(row, 1);
                LocalDate tra = layNgay(row, 2);
                if (soPhong.isBlank()) {
                    throw new RuntimeException("Thiếu số phòng.");
                }
                if (nhan == null || tra == null) {
                    throw new RuntimeException("Thiếu hoặc sai định dạng ngày nhận/trả.");
                }
                if (!tra.isAfter(nhan)) {
                    throw new RuntimeException("Ngày trả phải sau ngày nhận.");
                }

                Long idKh;
                String hoTen;
                String sdt;
                String email;
                if (laLeTan) {
                    idKh = layLong(row, 3);
                    if (idKh == null) {
                        throw new RuntimeException("Thiếu IdKhachHang.");
                    }
                    hoTen = rongLaNull(layChuoi(row, 4));
                    sdt = rongLaNull(layChuoi(row, 5));
                    email = rongLaNull(layChuoi(row, 6));
                } else {
                    idKh = idKhachHangCd;
                    hoTen = rongLaNull(layChuoi(row, 3));
                    sdt = rongLaNull(layChuoi(row, 4));
                    email = rongLaNull(layChuoi(row, 5));
                }

                Optional<Phong> optP = phongRepository.findBySoPhong(soPhong.trim());
                if (optP.isEmpty()) {
                    throw new RuntimeException("Không tìm thấy phòng: " + soPhong.trim());
                }
                Long idPhong = optP.get().getId();

                YeuCauTaoDatPhong yc = new YeuCauTaoDatPhong();
                yc.setIdKhachHang(idKh);
                yc.setNgayNhanPhong(nhan);
                yc.setNgayTraPhong(tra);
                yc.setIdPhong(List.of(idPhong));
                yc.setTenKhach(hoTen);
                yc.setSdtKhach(sdt);
                yc.setEmailKhach(email);

                var dto = datPhongService.tao(yc);
                thanhCong++;
                chiTiet.add(DongKetQuaNhapExcelDatPhongDto.builder()
                        .soDongExcel(excelRow)
                        .thanhCong(true)
                        .loi(null)
                        .idDatPhong(dto.getId())
                        .build());
            } catch (RuntimeException ex) {
                thatBai++;
                chiTiet.add(DongKetQuaNhapExcelDatPhongDto.builder()
                        .soDongExcel(excelRow)
                        .thanhCong(false)
                        .loi(ex.getMessage() != null ? ex.getMessage() : "Lỗi")
                        .build());
            }
        }

        return KetQuaNhapExcelDatPhongDto.builder()
                .tongHang(tongHang)
                .soThanhCong(thanhCong)
                .soThatBai(thatBai)
                .chiTiet(chiTiet)
                .build();
    }

    private boolean dongTrong(Row row, boolean laLeTan) {
        int max = laLeTan ? 7 : 6;
        for (int i = 0; i < max; i++) {
            if (!layChuoi(row, i).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String rongLaNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    private String layChuoi(Row row, int col) {
        Cell c = row.getCell(col);
        if (c == null || c.getCellType() == CellType.BLANK) {
            return "";
        }
        return dataFormatter.formatCellValue(c).trim();
    }

    private LocalDate layNgay(Row row, int col) {
        Cell c = row.getCell(col);
        if (c == null || c.getCellType() == CellType.BLANK) {
            return null;
        }
        if (c.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(c)) {
            return c.getLocalDateTimeCellValue().toLocalDate();
        }
        String s = dataFormatter.formatCellValue(c).trim();
        if (s.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(s, ISO);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDate.parse(s, DMY);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private Long layLong(Row row, int col) {
        Cell c = row.getCell(col);
        if (c == null || c.getCellType() == CellType.BLANK) {
            return null;
        }
        if (c.getCellType() == CellType.NUMERIC) {
            return (long) c.getNumericCellValue();
        }
        String s = dataFormatter.formatCellValue(c).trim().replace(",", ".");
        if (s.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(s.replaceAll("\\.0$", ""));
        } catch (NumberFormatException e) {
            try {
                return (long) Double.parseDouble(s);
            } catch (NumberFormatException e2) {
                return null;
            }
        }
    }
}
