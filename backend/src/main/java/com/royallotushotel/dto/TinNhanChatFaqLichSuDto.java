package com.royallotushotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TinNhanChatFaqLichSuDto {

    @NotBlank
    @Pattern(regexp = "user|assistant", message = "vaiTro phải là user hoặc assistant")
    private String vaiTro;

    @NotBlank
    @Size(max = 4000)
    private String noiDung;
}
