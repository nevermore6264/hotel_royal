package com.royallotushotel.config;

import com.royallotushotel.security.BoiLocJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class CauHinhBaoMat {

    private final BoiLocJwt boiLocJwt;
    private final UserDetailsService dichVuChiTietNguoiDung;

    @Bean
    public SecurityFilterChain locChuoiLoc(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(nguonCors()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/xac-thuc/toi").authenticated()
                        .requestMatchers("/xac-thuc/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/chinh-sach-huy-phong/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/phong")
                        .hasAnyRole("QUAN_TRI", "LE_TAN", "BUONG_PHONG")
                        .requestMatchers(HttpMethod.GET, "/phong/can-don-ve-sinh")
                        .hasAnyRole("QUAN_TRI", "LE_TAN", "BUONG_PHONG")
                        .requestMatchers(HttpMethod.GET, "/phong/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/loai-phong", "/loai-phong/**").permitAll()
                        .requestMatchers("/dat-phong/**").hasAnyRole("QUAN_TRI", "LE_TAN", "KHACH_HANG")
                        .requestMatchers("/khach-hang/**").hasAnyRole("QUAN_TRI", "LE_TAN")
                        .requestMatchers("/dich-vu/**")
                        .hasAnyRole("QUAN_TRI", "LE_TAN", "KHACH_HANG", "BUONG_PHONG")
                        .requestMatchers("/bang-dieu-khien/**", "/nguoi-dung/**").hasRole("QUAN_TRI")
                        .requestMatchers(HttpMethod.POST, "/chinh-sach-huy-phong").hasRole("QUAN_TRI")
                        .requestMatchers(HttpMethod.PUT, "/chinh-sach-huy-phong/**").hasRole("QUAN_TRI")
                        .requestMatchers(HttpMethod.DELETE, "/chinh-sach-huy-phong/**").hasRole("QUAN_TRI")
                        .requestMatchers(HttpMethod.POST, "/thanh-toan/dong-bo-payos").authenticated()
                        .requestMatchers(HttpMethod.POST, "/thanh-toan/tien-mat")
                        .hasAnyRole("QUAN_TRI", "LE_TAN")
                        .requestMatchers("/thanh-toan/**").permitAll()
                        .requestMatchers("/chat/**")
                        .hasAnyRole("KHACH_HANG", "LE_TAN", "QUAN_TRI")
                        .requestMatchers(HttpMethod.GET, "/danh-gia").permitAll()
                        .requestMatchers(HttpMethod.POST, "/danh-gia").hasRole("KHACH_HANG")
                        .requestMatchers("/ho-so/**").authenticated()
                        .requestMatchers("/nhat-ky/**").hasRole("QUAN_TRI")
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/tap-tin/**").hasRole("QUAN_TRI")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(nhaCungCapXacThuc())
                .addFilterBefore(boiLocJwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource nguonCors() {
        CorsConfiguration cauHinh = new CorsConfiguration();
        cauHinh.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        cauHinh.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cauHinh.setAllowedHeaders(List.of("*"));
        cauHinh.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource nguon = new UrlBasedCorsConfigurationSource();
        nguon.registerCorsConfiguration("/**", cauHinh);
        return nguon;
    }

    @Bean
    public AuthenticationProvider nhaCungCapXacThuc() {
        DaoAuthenticationProvider ncc = new DaoAuthenticationProvider();
        ncc.setUserDetailsService(dichVuChiTietNguoiDung);
        ncc.setPasswordEncoder(maHoaMatKhau());
        return ncc;
    }

    @Bean
    public PasswordEncoder maHoaMatKhau() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager quanLyXacThuc(AuthenticationConfiguration cauHinh) throws Exception {
        return cauHinh.getAuthenticationManager();
    }
}
