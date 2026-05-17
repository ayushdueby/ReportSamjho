package com.reportsamjho.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.reportsamjho.dto.AnalyseTextRequest;
import com.reportsamjho.dto.ApiErrorResponse;
import com.reportsamjho.service.ClaudeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final List<String> ALLOWED_TYPES =
            List.of("image/jpeg", "image/png", "image/webp", "application/pdf");

    private final ClaudeService claudeService;

    public ReportController(ClaudeService claudeService) {
        this.claudeService = claudeService;
    }

    @PostMapping("/analyse")
    public ResponseEntity<?> analyseText(@RequestBody AnalyseTextRequest request) {
        if (request.getReportText() == null || request.getReportText().trim().length() < 3) {
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse("EMPTY_REPORT", "Please provide report text."));
        }

        try {
            JsonNode result = claudeService.analyseText(
                    request.getReportText().trim(),
                    request.getLanguage() != null ? request.getLanguage() : "english"
            );
            ObjectNode response = mapper.createObjectNode();
            response.put("success", true);
            response.set("data", result);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return handleServiceError(e);
        }
    }

    @PostMapping("/analyse-file")
    public ResponseEntity<?> analyseFile(
            @RequestParam("report") MultipartFile file,
            @RequestParam(value = "language", defaultValue = "english") String language) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse("NO_FILE", "No file uploaded."));
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_TYPES.contains(mimeType)) {
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse("UNSUPPORTED_FILE_TYPE",
                            "Sirf JPG, PNG, WebP, ya PDF upload karein."));
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse("FILE_TOO_LARGE", "File 10MB se badi hai."));
        }

        try {
            JsonNode result = claudeService.analyseFile(file, language);
            ObjectNode response = mapper.createObjectNode();
            response.put("success", true);
            response.set("data", result);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return handleServiceError(e);
        }
    }

    private ResponseEntity<ApiErrorResponse> handleServiceError(RuntimeException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "";
        log.error("Service error: {}", msg);

        if (msg.startsWith("AUTH_ERROR")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiErrorResponse("AUTH_ERROR", "Invalid API key."));
        }
        if (msg.startsWith("RATE_LIMIT")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiErrorResponse("RATE_LIMIT", "Too many requests. Please try again."));
        }
        if (msg.startsWith("PARSE_ERROR")) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(new ApiErrorResponse("PARSE_ERROR",
                            "Hum is report ko samajh nahi paaye — kya aap values manually type kar sakte hain?"));
        }
        if (msg.startsWith("PDF_TOO_LONG")) {
            String pages = msg.contains(":") ? msg.split(":")[1] : "?";
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse("PDF_TOO_LONG",
                            "Yeh PDF " + pages + " pages ka hai. Sirf 3 pages tak ki reports allowed hain."));
        }
        if (msg.startsWith("FILE_READ_ERROR")) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("FILE_READ_ERROR", "File padne mein problem aayi. Please retry."));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiErrorResponse("API_ERROR", "Analysis failed. Please try again."));
    }
}
