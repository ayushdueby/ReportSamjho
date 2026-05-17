package com.reportsamjho.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@Service
public class ClaudeService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model.text}")
    private String textModel;

    @Value("${groq.model.vision}")
    private String visionModel;

    private static final String SYSTEM_PROMPT =
            "You are a medical report educator for Indian users. Explain lab values simply in the user's language. " +
            "Never diagnose. Be calm. Use Indian foods (dal, roti, dahi, palak, haldi) for diet tips. " +
            "Output ONLY valid JSON — no markdown, no extra text — in this exact shape: " +
            "{\"overall_summary\":\"string\"," +
            "\"findings\":[{" +
            "\"parameter_name_en\":\"string\"," +
            "\"parameter_name_local\":\"string\"," +
            "\"value\":\"string\"," +
            "\"unit\":\"string\"," +
            "\"reference_range\":\"string\"," +
            "\"status\":\"normal|slightly_high|high|slightly_low|low\"," +
            "\"explanation\":\"2-3 sentences, no jargon, in user language\"," +
            "\"lifestyle_tips\":[\"tip1\",\"tip2\"]," +
            "\"doctor_question\":\"string or empty string if normal\"}]," +
            "\"doctor_questions_summary\":\"string\"}. " +
            "status rules: normal=within range, slightly_high/low=within 20% of limit, high/low=beyond 20%. " +
            "For normal findings set lifestyle_tips=[] and doctor_question=\"\".";

    private static final Map<String, String> LANG_NAMES = Map.of(
            "hindi",   "Hindi (हिंदी)",
            "english", "English",
            "tamil",   "Tamil (தமிழ்)",
            "telugu",  "Telugu (తెలుగు)",
            "bengali", "Bengali (বাংলা)"
    );

    // 6000 TPM free-tier budget: ~120 sys + ~30 prefix + report + 1500 output.
    // Keep report text under 2000 chars (~500 tokens) to stay comfortably within limit.
    private static final int MAX_REPORT_CHARS = 2000;

    private String buildUserPrompt(String reportText, String language) {
        String langName = LANG_NAMES.getOrDefault(language, "English");
        String truncated = reportText.length() > MAX_REPORT_CHARS
                ? reportText.substring(0, MAX_REPORT_CHARS)
                : reportText;
        return "Language: " + langName + ". Analyse this report and return JSON only.\n\n" + truncated;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public JsonNode analyseText(String reportText, String language) {
        ObjectNode body = buildOpenAIRequest(textModel, SYSTEM_PROMPT, buildUserPrompt(reportText, language));
        return callGroq(body);
    }

    public JsonNode analyseFile(MultipartFile file, String language) {
        String mimeType = file.getContentType();
        try {
            if ("application/pdf".equals(mimeType)) {
                // Extract text from PDF, then treat as text analysis
                String pdfText = extractPdfText(file);
                if (pdfText.isBlank()) throw new RuntimeException("PARSE_ERROR: PDF text extraction returned empty");
                ObjectNode body = buildOpenAIRequest(textModel, SYSTEM_PROMPT, buildUserPrompt(pdfText, language));
                return callGroq(body);
            } else {
                // Image — use vision model
                String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                String dataUrl = "data:" + mimeType + ";base64," + base64;
                ObjectNode body = buildVisionRequest(visionModel, SYSTEM_PROMPT, dataUrl, language);
                return callGroq(body);
            }
        } catch (IOException e) {
            throw new RuntimeException("FILE_READ_ERROR: " + e.getMessage(), e);
        }
    }

    // ── Request builders ──────────────────────────────────────────────────────

    private ObjectNode buildOpenAIRequest(String model, String systemPrompt, String userText) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 2500);
        body.put("temperature", 0.3);

        ArrayNode messages = body.putArray("messages");

        ObjectNode sys = messages.addObject();
        sys.put("role", "system");
        sys.put("content", systemPrompt);

        ObjectNode user = messages.addObject();
        user.put("role", "user");
        user.put("content", userText);

        return body;
    }

    private ObjectNode buildVisionRequest(String model, String systemPrompt, String imageDataUrl, String language) {
        ObjectNode body = mapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 2500);
        body.put("temperature", 0.3);

        ArrayNode messages = body.putArray("messages");

        ObjectNode sys = messages.addObject();
        sys.put("role", "system");
        sys.put("content", systemPrompt);

        ObjectNode user = messages.addObject();
        user.put("role", "user");
        ArrayNode content = user.putArray("content");

        ObjectNode imgBlock = content.addObject();
        imgBlock.put("type", "image_url");
        imgBlock.putObject("image_url").put("url", imageDataUrl);

        ObjectNode textBlock = content.addObject();
        textBlock.put("type", "text");
        textBlock.put("text", buildUserPrompt("(see the uploaded image — extract all lab values visible in it)", language));

        return body;
    }

    // ── HTTP call ─────────────────────────────────────────────────────────────

    private JsonNode callGroq(ObjectNode requestBody) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        String bodyStr;
        try {
            bodyStr = mapper.writeValueAsString(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("REQUEST_BUILD_ERROR", e);
        }

        HttpEntity<String> entity = new HttpEntity<>(bodyStr, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);
            JsonNode root = mapper.readTree(response.getBody());

            // OpenAI-compatible response: choices[0].message.content
            String rawText = root.path("choices").get(0)
                    .path("message").path("content").asText().trim();

            // Strip accidental markdown fences
            String jsonText = rawText
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)^```\\s*", "")
                    .replaceAll("\\s*```$", "");

            try {
                return mapper.readTree(jsonText);
            } catch (Exception parseEx) {
                // Response was truncated — try to close open brackets so we get partial data
                log.warn("JSON truncated, attempting repair. Error: {}", parseEx.getMessage());
                String repaired = repairTruncatedJson(jsonText);
                return mapper.readTree(repaired);
            }

        } catch (HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            log.error("Groq API HTTP {}: {}", status, e.getResponseBodyAsString());
            if (status == 401) throw new RuntimeException("AUTH_ERROR");
            if (status == 429) throw new RuntimeException("RATE_LIMIT");
            throw new RuntimeException("API_ERROR: " + e.getMessage());
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && (msg.startsWith("AUTH_ERROR") || msg.startsWith("RATE_LIMIT"))) throw e;
            throw new RuntimeException("PARSE_ERROR: " + msg, e);
        } catch (Exception e) {
            throw new RuntimeException("PARSE_ERROR: " + e.getMessage(), e);
        }
    }

    // ── JSON repair ───────────────────────────────────────────────────────────

    // Finds the last fully-closed finding object and reconstructs valid JSON from it.
    // The expected structure is: {"overall_summary":"...","findings":[{...},{...}],"doctor_questions_summary":"..."}
    // depth map: root { = 1, findings [ = 2, finding { = 3 → closes back to 2
    private String repairTruncatedJson(String json) {
        int lastGoodClose = -1;
        boolean inString = false;
        int depth = 0;

        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);

            if (c == '"') {
                // Count preceding backslashes to detect escaped quote
                int backslashes = 0;
                for (int j = i - 1; j >= 0 && json.charAt(j) == '\\'; j--) backslashes++;
                if (backslashes % 2 == 0) inString = !inString;
            }

            if (!inString) {
                if (c == '{' || c == '[') depth++;
                else if (c == '}' || c == ']') {
                    depth--;
                    if (depth == 2 && c == '}') lastGoodClose = i; // closed a finding object
                }
            }
        }

        if (lastGoodClose == -1) {
            log.warn("No complete finding found in truncated response, returning empty result");
            return "{\"overall_summary\":\"Report partially parsed — please try again.\","
                    + "\"findings\":[],"
                    + "\"doctor_questions_summary\":\"\"}";
        }

        String good = json.substring(0, lastGoodClose + 1).stripTrailing()
                         .replaceAll(",\\s*$", "");
        return good + "],\"doctor_questions_summary\":\"\"}";
    }

    // ── PDF helper ────────────────────────────────────────────────────────────

    private String extractPdfText(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc).trim();
        }
    }
}
