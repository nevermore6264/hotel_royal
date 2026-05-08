package com.royallotushotel.controller;

import com.royallotushotel.dto.YeuCauChatFaqDto;
import com.royallotushotel.service.TroGiupFaqService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/tro-giup-faq")
@RequiredArgsConstructor
public class TroGiupFaqController {

    private final TroGiupFaqService troGiupFaqService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@Valid @RequestBody YeuCauChatFaqDto yeuCau) {
        String traLoi = troGiupFaqService.traLoi(yeuCau);
        return ResponseEntity.ok(Map.of("traLoi", traLoi));
    }
}
