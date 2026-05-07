package com.royallotushotel.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.Properties;

/**
 * Khi mạng công ty / proxy thay chứng chỉ SMTP, JVM báo PKIX — cách đúng là nhập CA vào {@code cacerts}.
 * Tùy chọn này chỉ để dev: tin mọi chứng chỉ TLS (rủi ro MITM).
 */
@Configuration
@ConditionalOnProperty(prefix = "app.mail", name = "smtp-trust-insecure", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class CauHinhMailSmtpTls {

    private final MailProperties mailProperties;

    @Bean
    public JavaMailSender javaMailSenderTrustInsecure() throws GeneralSecurityException {
        log.warn(
                "app.mail.smtp-trust-insecure=true: SMTP đang tin mọi chứng chỉ TLS. "
                        + "Không dùng trên production; nên import CA của proxy vào JVM.");

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(mailProperties.getHost());
        if (mailProperties.getPort() != null) {
            sender.setPort(mailProperties.getPort());
        }
        sender.setUsername(mailProperties.getUsername());
        sender.setPassword(mailProperties.getPassword());
        sender.setProtocol(mailProperties.getProtocol() != null ? mailProperties.getProtocol() : "smtp");
        if (mailProperties.getDefaultEncoding() != null) {
            sender.setDefaultEncoding(mailProperties.getDefaultEncoding().name());
        }

        Properties props = new Properties();
        props.putAll(mailProperties.getProperties());
        props.put("mail.smtp.ssl.socketFactory", sslSocketFactoryTinTatCa());
        props.put("mail.smtp.ssl.checkserveridentity", "false");

        sender.setJavaMailProperties(props);
        return sender;
    }

    private static SSLSocketFactory sslSocketFactoryTinTatCa() throws GeneralSecurityException {
        TrustManager[] tin = new TrustManager[]{
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {
                    }

                    @Override
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {
                    }

                    @Override
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[0];
                    }
                }
        };
        SSLContext ctx = SSLContext.getInstance("TLS");
        ctx.init(null, tin, new SecureRandom());
        return ctx.getSocketFactory();
    }
}
