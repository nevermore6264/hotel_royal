package com.royallotushotel.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "ai.faq")
public class AiFaqProperties {

    private boolean enabled = false;

    private String apiKey = "";

    private String baseUrl = "https://api.openai.com/v1";

    private String model = "gpt-4o-mini";

    private double temperature = 0.35;

    private int maxTokens = 700;
}
