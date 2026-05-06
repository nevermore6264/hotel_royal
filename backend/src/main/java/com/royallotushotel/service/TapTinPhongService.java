package com.royallotushotel.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class TapTinPhongService {

    @Value("${app.upload.root:uploads}")
    private String thuMucGoc;

    public String luuAnhPhong(MultipartFile tep) throws IOException {
        if (tep == null || tep.isEmpty()) throw new IllegalArgumentException("Tệp trống");
        String loai = tep.getContentType();
        if (loai == null || !loai.startsWith("image/"))
            throw new IllegalArgumentException("Chỉ chấp nhận tệp ảnh (JPEG, PNG, WebP, GIF)");
        String moRong = layMoRongAnToan(tep.getOriginalFilename(), loai);
        String ten = UUID.randomUUID() + moRong;
        Path thuMuc = Paths.get(thuMucGoc).toAbsolutePath().normalize().resolve("phong");
        Files.createDirectories(thuMuc);
        Path dich = thuMuc.resolve(ten);
        Files.copy(tep.getInputStream(), dich, StandardCopyOption.REPLACE_EXISTING);
        return "/api/uploads/phong/" + ten;
    }

    public String luuAnhChat(MultipartFile tep) throws IOException {
        if (tep == null || tep.isEmpty()) throw new IllegalArgumentException("Tệp trống");
        String loai = tep.getContentType();
        if (loai == null || !loai.startsWith("image/"))
            throw new IllegalArgumentException("Chỉ chấp nhận tệp ảnh (JPEG, PNG, WebP, GIF)");
        String moRong = layMoRongAnToan(tep.getOriginalFilename(), loai);
        String ten = UUID.randomUUID() + moRong;
        Path thuMuc = Paths.get(thuMucGoc).toAbsolutePath().normalize().resolve("chat");
        Files.createDirectories(thuMuc);
        Path dich = thuMuc.resolve(ten);
        Files.copy(tep.getInputStream(), dich, StandardCopyOption.REPLACE_EXISTING);
        return "/api/uploads/chat/" + ten;
    }

    private static String layMoRongAnToan(String tenGoc, String contentType) {
        String ext = ".bin";
        if (tenGoc != null && tenGoc.contains(".")) {
            String e = tenGoc.substring(tenGoc.lastIndexOf('.')).toLowerCase(Locale.ROOT);
            if (e.length() <= 6 && e.matches("\\.[a-z0-9]+")) ext = e;
        }
        if (".bin".equals(ext)) {
            if (contentType.contains("jpeg")) ext = ".jpg";
            else if (contentType.contains("png")) ext = ".png";
            else if (contentType.contains("webp")) ext = ".webp";
            else if (contentType.contains("gif")) ext = ".gif";
        }
        return ext;
    }
}
