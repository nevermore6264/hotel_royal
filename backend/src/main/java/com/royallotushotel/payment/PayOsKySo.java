package com.royallotushotel.payment;

import com.fasterxml.jackson.databind.JsonNode;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

public final class PayOsKySo {

    private PayOsKySo() {}

    public static String taoChuKyTaoLinkThanhToan(
            long amountVnd,
            String cancelUrl,
            String description,
            long orderCode,
            String returnUrl,
            String checksumKey
    ) {
        String chuoiHamCanKy = "amount=" + amountVnd
                + "&cancelUrl=" + cancelUrl
                + "&description=" + description
                + "&orderCode=" + orderCode
                + "&returnUrl=" + returnUrl;
        return hamSha256Hex(chuoiHamCanKy, checksumKey);
    }

    public static boolean xacThucDuLieuWebhook(JsonNode duLieuNut, String chuKyNhan, String checksumKey) {
        if (chuKyNhan == null || chuKyNhan.isBlank() || checksumKey == null || checksumKey.isBlank()) {
            return false;
        }
        String chuoiDuLieuHam = chuyenDuLieuWebhookThanhChuoi(duLieuNut);
        String tinh = hamSha256Hex(chuoiDuLieuHam, checksumKey);
        return tinh.equalsIgnoreCase(chuKyNhan.trim());
    }

    private static String chuyenDuLieuWebhookThanhChuoi(JsonNode duLieuNut) {
        TreeMap<String, String> sapXep = new TreeMap<>();
        Iterator<Map.Entry<String, JsonNode>> it = duLieuNut.fields();
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            sapXep.put(e.getKey(), giaTriThanhChuoiKy(e.getValue()));
        }
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> en : sapXep.entrySet()) {
            if (sb.length() > 0) sb.append('&');
            sb.append(en.getKey()).append('=').append(en.getValue());
        }
        return sb.toString();
    }

    private static String giaTriThanhChuoiKy(JsonNode v) {
        if (v == null || v.isNull() || v.isMissingNode()) return "";
        if (v.isBoolean()) return Boolean.toString(v.booleanValue());
        if (v.isIntegralNumber()) return String.valueOf(v.longValue());
        if (v.isNumber()) return v.asText();
        if (v.isTextual()) return v.asText("");
        return v.toString();
    }

    private static String hamSha256Hex(String duLieu, String khoa) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(khoa.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(duLieu.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Không tạo được chữ ký payOS", e);
        }
    }
}
