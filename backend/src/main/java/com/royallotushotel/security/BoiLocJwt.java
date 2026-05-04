package com.royallotushotel.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class BoiLocJwt extends OncePerRequestFilter {

    private final TienIchJwt tienIchJwt;
    private final DichVuChiTietNguoiDung dichVuChiTietNguoiDung;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = layJwtTuYeuCau(request);
            if (StringUtils.hasText(jwt) && tienIchJwt.hopLe(jwt)) {
                String tenDangNhap = tienIchJwt.layTenDangNhapTuToken(jwt);
                UserDetails chiTiet = dichVuChiTietNguoiDung.loadUserByUsername(tenDangNhap);
                var xacThuc = new UsernamePasswordAuthenticationToken(
                        chiTiet, null, chiTiet.getAuthorities());
                xacThuc.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(xacThuc);
            }
        } catch (Exception e) {
            logger.debug("Khong dat xac thuc: " + e.getMessage());
        }
        filterChain.doFilter(request, response);
    }

    private String layJwtTuYeuCau(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
