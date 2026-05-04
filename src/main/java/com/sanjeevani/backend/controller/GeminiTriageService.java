package com.sanjeevani.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.List;

@Service
public class GeminiTriageService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public String triageDonor(String medicalHistory) {
        RestTemplate restTemplate = new RestTemplate();
        String url = API_URL + apiKey;

        // The prompt that tells the AI how to act as a medical triage officer
        String prompt = "Act as a medical triage officer for a bio-asset donation network. " +
                "Analyze this medical history: '" + medicalHistory + "'. " +
                "If the person is unfit to donate (e.g., fever, active infection, recent surgery, chronic illness), " +
                "start your response with 'REJECTED' followed by a brief reason. " +
                "If they are fit, start with 'APPROVED'. Be concise.";

        // Prepare the request body for Gemini
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            Map<String, Object> response = restTemplate.postForObject(url, requestBody, Map.class);

            // Navigate the JSON response to get the text
            List<?> candidates = (List<?>) response.get("candidates");
            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

            return (String) firstPart.get("text");
        } catch (Exception e) {
            return "ERROR: AI Triage failed. " + e.getMessage();
        }
    }
}