package com.royallotushotel.security;

import com.royallotushotel.entity.NguoiDung;
import com.royallotushotel.hangso.MaTrangThaiNguoiDung;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class ChuTheNguoiDung implements UserDetails {

    private Long id;
    private String tenDangNhap;
    private String email;
    private String matKhau;
    private String trangThai;
    private Collection<? extends GrantedAuthority> quyen;

    public static ChuTheNguoiDung tao(NguoiDung nguoiDung) {
        var authorities = nguoiDung.getVaiTro().stream()
                .map(v -> new SimpleGrantedAuthority(v.getTen()))
                .collect(Collectors.toList());
        return new ChuTheNguoiDung(
                nguoiDung.getId(),
                nguoiDung.getTenDangNhap(),
                nguoiDung.getEmail(),
                nguoiDung.getMatKhau(),
                nguoiDung.getTrangThai(),
                authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return quyen;
    }

    @Override
    public String getPassword() {
        return matKhau;
    }

    @Override
    public String getUsername() {
        return tenDangNhap;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !MaTrangThaiNguoiDung.KHOA.equals(trangThai);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return MaTrangThaiNguoiDung.HOAT_DONG.equals(trangThai);
    }
}
