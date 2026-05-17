package com.reportsamjho.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.Map;

@Service
public class ClaudeService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.api.url}")
    private String apiUrl;

    @Value("${anthropic.model}")
    private String model;

    private static final String SYSTEM_PROMPT = """
            You are ReportSamjho, a friendly and calm medical report educator for Indian users. Your job is to explain medical lab report values in simple, reassuring language that a Class 8 student can understand.

            CRITICAL RULES:
            - NEVER diagnose. NEVER say "you have X disease". Only explain what values mean.
            - Always be calm and empowering, never alarming — even for abnormal values.
            - Use the user's selected language for all explanations (parameter names should be in BOTH English and local language).
            - For diet/lifestyle suggestions, always reference Indian foods: dal, roti, chawal, sabzi, dahi, haldi, lauki, methi, palak, etc.
            - Keep explanations simple — no medical jargon.
            - Always output ONLY valid JSON, no markdown, no extra text.

            OUTPUT FORMAT — return a single JSON object:
            {
              "overall_summary": "2 sentence plain language summary of the report in the selected language",
              "findings": [
                {
                  "parameter_name_en": "Parameter name in English",
                  "parameter_name_local": "Parameter name in selected language",
                  "value": "numeric or text value",
                  "unit": "unit of measurement",
                  "reference_range": "normal range as string e.g. '4.0–11.0'",
                  "status": "normal | slightly_high | high | slightly_low | low",
                  "explanation": "2-3 sentence plain explanation in selected language, no jargon",
                  "lifestyle_tips": ["tip 1 in selected language", "tip 2", "tip 3"],
                  "doctor_question": "One specific question to ask doctor in selected language (empty string if normal)"
                }
              ],
              "doctor_questions_summary": "WhatsApp-ready text with all doctor questions from abnormal values"
            }

            STATUS DEFINITIONS:
            - normal: within reference range
            - slightly_high: up to 20% above upper limit
            - high: more than 20% above upper limit
            - slightly_low: up to 20% below lower limit
            - low: more than 20% below lower limit

            For normal values: lifestyle_tips should be empty array [], doctor_question should be "".
            """;

    private static final Map<String, String> LANG_NAMES = Map.of(
            "hindi", "Hindi (हिंदी)",
            "english", "English",
            "tamil", "Tamil (தமிழ்)",
            "telugu", "Telugu (తెలుగు)",
            "bengali", "Bengali (বাংলা)"
    );

    private String buildUserPrompt(String reportText, String language) {
        String langName = LANG_NAMES.getOrDefault(language, "English");
        return """
                Please analyze this medical report and explain it in %s.

                REPORT TEXT:
                %s

                Instructions:
                - Selected language for all explanations: %s
                - Extract ALL values/parameters from the report
                - For each parameter, classify status, explain simply, give Indian-context tips if abnormal
                - Overall summary must be in %s
                - Return ONLY the JSON object, no other text
                """.formatted(langName, reportText, langName, langName);
    }

    public JsonNode analyseText(String reportText, String language) {
        ObjectNode requestBody = buildTextRequest(reportText, language);
        return callClaude(requestBody);
    }

    public JsonNode analyseFile(MultipartFile file, String language) {
        String mimeType = file.getContentType();
        try {
            byte[] bytes = file.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            ObjectNode requestBody = buildFileRequest(base64, mimeType, language);
            return callClaude(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("FILE_READ_ERROR: " + e.getMessage(), e);
        }
    }

    private ObjectNode buildTextRequest(String reportText, String language) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 4096);
        body.put("system", SYSTEM_PROMPT);

        ArrayNode messages = body.putArray("messages");
        ObjectNode msg = messages.addObject();
        msg.put("role", "user");

        ArrayNode content = msg.putArray("content");
        ObjectNode textBlock = content.addObject();
        textBlock.put("type", "text");
        textBlock.put("text", buildUserPrompt(reportText, language));

        return body;
    }

    private ObjectNode buildFileRequest(String base64Data, String mimeType, String language) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 4096);
        body.put("system", SYSTEM_PROMPT);

        ArrayNode messages = body.putArray("messages");
        ObjectNode msg = messages.addObject();
        msg.put("role", "user");

        ArrayNode content = msg.putArray("content");

        if ("application/pdf".equals(mimeType)) {
            // Claude document block for PDFs
            ObjectNode docBlock = content.addObject();
            docBlock.put("type", "document");
            ObjectNode source = docBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", "application/pdf");
            source.put("data", base64Data);
        } else {
            // Image block for JPG/PNG/WebP
            ObjectNode imgBlock = content.addObject();
            imgBlock.put("type", "image");
            ObjectNode source = imgBlock.putObject("source");
            source.put("type", "base64");
            source.put("media_type", mimeType != null ? mimeType : "image/jpeg");
            source.put("data", base64Data);
        }

        // Text instruction block
        ObjectNode textBlock = content.addObject();
        textBlock.put("type", "text");
        textBlock.put("text", buildUserPrompt(
                "(see the uploaded file above — extract all lab values from it)", language));

        return body;
    }

    private JsonNode callClaude(ObjectNode requestBody) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", apiKey);
        headers.set("anthropic-version", "2023-06-01");
        headers.set("anthropic-beta", "pdfs-2024-09-25");

        HttpEntity<String> entity;
        try {
            entity = new HttpEntity<>(mapper.writeValueAsString(requestBody), headers);
        } catch (Exception e) {
            throw new RuntimeException("REQUEST_BUILD_ERROR", e);
        }

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            JsonNode responseNode = mapper.readTree(response.getBody());

            // Extract text from Claude response: content[0].text
            String rawText = responseNode.path("content").get(0).path("text").asText().trim();

            // Strip accidental markdown fences
            String jsonText = rawText
                    .replaceAll("(?i)^```json\\s*", "")
                    .replaceAll("(?i)^```\\s*", "")
                    .replaceAll("\\s*```$", "");

            return mapper.readTree(jsonText);

        } catch (HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            log.error("Claude API HTTP error {}: {}", status, e.getResponseBodyAsString());
            if (status == 401) throw new RuntimeException("AUTH_ERROR");
            if (status == 429) throw new RuntimeException("RATE_LIMIT");
            throw new RuntimeException("API_ERROR: " + e.getMessage());
        } catch (RuntimeException e) {
            log.error("Claude API error: {}", e.getMessage());
            String msg = e.getMessage();
            if (msg != null && (msg.startsWith("AUTH_ERROR") || msg.startsWith("RATE_LIMIT"))) throw e;
            throw new RuntimeException("PARSE_ERROR: " + msg, e);
        } catch (Exception e) {
            log.error("Claude API unexpected error: {}", e.getMessage());
            throw new RuntimeException("PARSE_ERROR: " + e.getMessage(), e);
        }
    }
}
