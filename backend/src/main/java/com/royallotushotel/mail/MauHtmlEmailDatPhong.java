package com.royallotushotel.mail;

import com.royallotushotel.dto.ThongTinEmailDatPhong;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

public final class MauHtmlEmailDatPhong {

    private static final Locale VI = Locale.forLanguageTag("vi-VN");

    private MauHtmlEmailDatPhong() {}

    public static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    public static String formatTien(BigDecimal n) {
        if (n == null) return "0";
        NumberFormat nf = NumberFormat.getIntegerInstance(VI);
        return nf.format(n) + " VND";
    }

    public static String formatNgay(java.time.LocalDate d) {
        if (d == null) return "—";
        return String.format("%02d/%02d/%04d", d.getDayOfMonth(), d.getMonthValue(), d.getYear());
    }

    public static String noiDungThuong(ThongTinEmailDatPhong t, String frontendBaseUrl) {
        String ten = t.tenKhach() != null ? t.tenKhach() : "Quý khách";
        String id = Long.toString(t.idDatPhong());
        String nhan = formatNgay(t.ngayNhanPhong());
        String tra = formatNgay(t.ngayTraPhong());
        String tien = formatTien(t.tongTien());
        String phong = t.dongPhong() == null ? "" : String.join("\n", t.dongPhong());
        String link = (frontendBaseUrl != null ? frontendBaseUrl.replaceAll("/$", "") : "") + "/don-cua-toi";

        if (t.laXacNhanTuLeTan()) {
            return String.format(
                    "Kính gửi %s,\n\nĐơn đặt phòng #%s đã được lễ tân xác nhận.\n"
                            + "Nhận phòng: %s\nTrả phòng: %s\nTổng tiền: %s\n\nPhòng:\n%s\n\nXem đơn: %s\n\nTrân trọng,\nRoyal Lotus Hotel",
                    ten, id, nhan, tra, tien, phong, link);
        }
        return String.format(
                "Kính gửi %s,\n\nCảm ơn quý khách đã đặt phòng tại Royal Lotus Hotel.\n"
                        + "Mã đơn: #%s (chờ thanh toán / xác nhận).\n"
                        + "Nhận phòng: %s\nTrả phòng: %s\nTổng tiền dự kiến: %s\n\nPhòng:\n%s\n\n"
                        + "Vui lòng hoàn tất thanh toán theo hướng dẫn trên ứng dụng. Xem đơn: %s\n\nTrân trọng,\nRoyal Lotus Hotel",
                ten, id, nhan, tra, tien, phong, link);
    }

    public static String html(ThongTinEmailDatPhong t, String frontendBaseUrl) {
        String ten = escapeHtml(t.tenKhach() != null ? t.tenKhach() : "Quý khách");
        String id = escapeHtml(Long.toString(t.idDatPhong()));
        String nhanIn = escapeHtml(formatNgay(t.ngayNhanPhong()));
        String traIn = escapeHtml(formatNgay(t.ngayTraPhong()));
        String tien = escapeHtml(formatTien(t.tongTien()));
        String base = frontendBaseUrl != null ? frontendBaseUrl.replaceAll("/$", "") : "";
        String linkHref = (base + "/don-cua-toi").replace("\"", "");

        String badge = t.laXacNhanTuLeTan()
                ? "<span style=\"display:inline-block;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;"
                + "background:#14532d;color:#bbf7d0;\">Đã xác nhận</span>"
                : "<span style=\"display:inline-block;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:700;"
                + "background:#713f12;color:#fde68a;\">Chờ thanh toán</span>";

        String title = t.laXacNhanTuLeTan()
                ? "Đơn đặt phòng đã được xác nhận"
                : "Đã nhận yêu cầu đặt phòng";

        String lead = t.laXacNhanTuLeTan()
                ? "Lễ tân đã xác nhận đơn của quý khách. Chi tiết bên dưới."
                : "Cảm ơn quý khách đã chọn Royal Lotus Hotel. Vui lòng hoàn tất thanh toán theo ứng dụng để giữ chỗ.";

        String rowsPhong = dongPhongRows(t.dongPhong());

        return "<!DOCTYPE html><html lang=\"vi\"><head><meta charset=\"UTF-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/>"
                + "<title>" + escapeHtml(title) + "</title></head><body style=\"margin:0;padding:0;background:#eef0f4;font-family:Georgia,'Times New Roman',serif;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#eef0f4;padding:24px 12px;\">"
                + "<tr><td align=\"center\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:560px;background:#ffffff;border-radius:12px;"
                + "overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);\">"
                + "<tr><td style=\"background:linear-gradient(135deg,#1c1917 0%,#292524 50%,#422006 100%);padding:20px 24px;\">"
                + "<p style=\"margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#d6b656;\">Royal Lotus</p>"
                + "<h1 style=\"margin:0;font-size:22px;font-weight:700;color:#fafaf9;line-height:1.25;\">" + escapeHtml(title) + "</h1>"
                + "<p style=\"margin:10px 0 0 0;font-size:14px;color:#d6d3d1;line-height:1.5;\">Đà Nẵng · Hạng sang &amp; view biển</p>"
                + "</td></tr>"
                + "<tr><td style=\"height:4px;background:linear-gradient(90deg,#c9a227,#fde68a,#c9a227);\"></td></tr>"
                + "<tr><td style=\"padding:24px 24px 8px 24px;\">"
                + "<p style=\"margin:0 0 12px 0;font-size:16px;color:#1c1917;\">Kính gửi <strong>" + ten + "</strong>,</p>"
                + "<p style=\"margin:0 0 16px 0;font-size:15px;color:#44403c;line-height:1.6;\">" + escapeHtml(lead) + "</p>"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-bottom:16px;\">"
                + "<tr><td>" + badge + "</td></tr></table>"
                + "</td></tr>"
                + "<tr><td style=\"padding:0 24px 20px 24px;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"border:1px solid #e7e5e4;border-radius:10px;border-collapse:separate;\">"
                + rowKv("Mã đơn", "#" + id)
                + rowKv("Nhận phòng", nhanIn)
                + rowKv("Trả phòng", traIn)
                + rowKv("Tổng tiền", tien)
                + "</table>"
                + "<p style=\"margin:18px 0 8px 0;font-size:13px;font-weight:700;color:#57534e;text-transform:uppercase;letter-spacing:0.06em;\">Phòng đã chọn</p>"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"border:1px solid #e7e5e4;border-radius:10px;border-collapse:separate;\">"
                + rowsPhong
                + "</table>"
                + "<table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin:22px auto 0 auto;\">"
                + "<tr><td style=\"border-radius:8px;background:#c9a227;\">"
                + "<a href=\"" + linkHref + "\" style=\"display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#1c1917;text-decoration:none;\">"
                + "Xem đơn của tôi</a></td></tr></table>"
                + "</td></tr>"
                + "<tr><td style=\"padding:16px 24px 24px 24px;border-top:1px solid #f5f5f4;\">"
                + "<p style=\"margin:0;font-size:12px;color:#78716c;line-height:1.5;\">"
                + "Đây là email tự động, quý khách vui lòng không trả lời trực tiếp. "
                + "Hỗ trợ: lễ tân khách sạn Royal Lotus.</p>"
                + "</td></tr></table>"
                + "<p style=\"margin:16px 0 0 0;font-size:11px;color:#a8a29e;text-align:center;\">© Royal Lotus Hotel</p>"
                + "</td></tr></table></body></html>";
    }

    private static String rowKv(String label, String valueHtmlEscaped) {
        return "<tr>"
                + "<td style=\"padding:12px 16px;border-bottom:1px solid #f5f5f4;font-size:13px;color:#78716c;width:38%;\">"
                + escapeHtml(label) + "</td>"
                + "<td style=\"padding:12px 16px;border-bottom:1px solid #f5f5f4;font-size:14px;color:#1c1917;font-weight:600;\">"
                + valueHtmlEscaped + "</td></tr>";
    }

    private static String dongPhongRows(List<String> dongPhong) {
        if (dongPhong == null || dongPhong.isEmpty()) {
            return "<tr><td style=\"padding:14px 16px;font-size:14px;color:#57534e;\">—</td></tr>";
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < dongPhong.size(); i++) {
            String d = escapeHtml(dongPhong.get(i));
            String border = i < dongPhong.size() - 1 ? "border-bottom:1px solid #f5f5f4;" : "";
            sb.append("<tr><td style=\"padding:12px 16px;font-size:14px;color:#292524;").append(border).append("\">")
                    .append(d).append("</td></tr>");
        }
        return sb.toString();
    }
}
