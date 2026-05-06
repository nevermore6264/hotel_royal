package com.royallotushotel.service;

import com.royallotushotel.repository.KhachHangRepository;
import com.royallotushotel.repository.NguoiDungRepository;
import com.royallotushotel.repository.VaiTroRepository;
import com.royallotushotel.security.TienIchJwt;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class XacThucServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;
    @Mock
    private KhachHangRepository khachHangRepository;
    @Mock
    private VaiTroRepository vaiTroRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private TienIchJwt tienIchJwt;
    @InjectMocks
    private XacThucService xacThucService;

    @Test
    void layThongTinToi_idNull() {
        assertThat(xacThucService.layThongTinToi(null)).isEmpty();
    }
}
