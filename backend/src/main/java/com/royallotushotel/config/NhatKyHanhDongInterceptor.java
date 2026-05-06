package com.royallotushotel.config;

import com.royallotushotel.security.ChuTheNguoiDung;
import com.royallotushotel.service.NhatKyHeThongService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class NhatKyHanhDongInterceptor implements HandlerInterceptor {

    private final NhatKyHeThongService nhatKyHeThongService;

    @Override
    public void afterCompletion(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler,
            Exception ex) {
        String method = request.getMethod();
        if (!coCanGhiLog(method)) return;

        Long idNguoiDung = null;
        String tenNguoiThucHien = "Người dùng chưa đăng nhập";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ChuTheNguoiDung chuThe) {
            idNguoiDung = chuThe.getId();
            tenNguoiThucHien = chuThe.getTenDangNhap();
        }

        String uri = request.getRequestURI();
        int maTrangThai = response.getStatus();
        String hanhDong = rutGonHanhDong(method + " " + uri);
        String chiTiet = taoThongDiepChiTiet(tenNguoiThucHien, method, uri, maTrangThai, ex);
        nhatKyHeThongService.ghi(hanhDong, chiTiet, idNguoiDung);
    }

    private boolean coCanGhiLog(String method) {
        return "POST".equalsIgnoreCase(method)
                || "PUT".equalsIgnoreCase(method)
                || "PATCH".equalsIgnoreCase(method)
                || "DELETE".equalsIgnoreCase(method);
    }

    private String rutGonHanhDong(String hanhDong) {
        final int doDaiToiDa = 120;
        if (hanhDong == null) return "";
        return hanhDong.length() <= doDaiToiDa
                ? hanhDong
                : hanhDong.substring(0, doDaiToiDa);
    }

    private String taoThongDiepChiTiet(
            String tenNguoiThucHien,
            String method,
            String uri,
            int maTrangThai,
            Exception ex) {
        String loaiThaoTac = switch (method.toUpperCase()) {
            case "POST" -> "thực hiện tạo mới";
            case "PUT", "PATCH" -> "thực hiện cập nhật";
            case "DELETE" -> "thực hiện xóa";
            default -> "thực hiện thao tác";
        };
        boolean thanhCong = ex == null && maTrangThai < 400;
        String ketQua = thanhCong ? "thành công" : "thất bại";
        StringBuilder sb = new StringBuilder();
        sb.append(tenNguoiThucHien)
                .append(" đã ")
                .append(loaiThaoTac)
                .append(" tại ")
                .append(uri)
                .append(" (")
                .append(ketQua)
                .append(", mã ")
                .append(maTrangThai)
                .append(")");
        if (ex != null && ex.getMessage() != null && !ex.getMessage().isBlank()) {
            sb.append(": ").append(ex.getMessage());
        }
        return sb.toString();
    }
}
