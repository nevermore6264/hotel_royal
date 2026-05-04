package com.royallotushotel.security;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class TienIchJwt {

    @Value("${jwt.secret}")
    private String biMatJwt;

    @Value("${jwt.expiration-ms}")
    private long thoiGianHetHanMs;

    @Value("${jwt.refresh-expiration-ms}")
    private long thoiGianHetHanLamMoiMs;

    private SecretKey layKhoaKy() {
        return Keys.hmacShaKeyFor(biMatJwt.getBytes(StandardCharsets.UTF_8));
    }

    public String taoToken(Authentication xacThuc) {
        ChuTheNguoiDung chuThe = (ChuTheNguoiDung) xacThuc.getPrincipal();
        return Jwts.builder()
                .subject(chuThe.getTenDangNhap())
                .claim("idNguoiDung", chuThe.getId())
                .claim("email", chuThe.getEmail())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + thoiGianHetHanMs))
                .signWith(layKhoaKy())
                .compact();
    }

    public String taoTokenTuTenDangNhap(String tenDangNhap) {
        return Jwts.builder()
                .subject(tenDangNhap)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + thoiGianHetHanMs))
                .signWith(layKhoaKy())
                .compact();
    }

    public String taoTokenLamMoi(String tenDangNhap) {
        return Jwts.builder()
                .subject(tenDangNhap)
                .claim("loai", "lam_moi")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + thoiGianHetHanLamMoiMs))
                .signWith(layKhoaKy())
                .compact();
    }

    public String layTenDangNhapTuToken(String token) {
        return Jwts.parser()
                .verifyWith(layKhoaKy())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean hopLe(String token) {
        try {
            Jwts.parser().verifyWith(layKhoaKy()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
