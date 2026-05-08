package com.royallotushotel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class YeuCauChatFaqDto {

    @NotBlank(message = "Nhập câu hỏi")
    @Size(max = 2000, message = "Tin nhắn quá dài")
    private String tinNhan;

    @Valid
    private List<TinNhanChatFaqLichSuDto> lichSu = new ArrayList<>();
}
