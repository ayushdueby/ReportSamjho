package com.reportsamjho.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reportsamjho.dto.ApiErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final String RAZORPAY_API = "https://api.razorpay.com/v1/orders";

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.amount.paise:9900}")
    private int amountPaise;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder() {
        try {
            RestTemplate rest = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBasicAuth(keyId, keySecret);

            String body = mapper.writeValueAsString(Map.of(
                    "amount", amountPaise,
                    "currency", "INR",
                    "receipt", "rs_" + UUID.randomUUID().toString().substring(0, 8)
            ));

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = rest.postForEntity(RAZORPAY_API, entity, String.class);

            JsonNode order = mapper.readTree(response.getBody());

            return ResponseEntity.ok(Map.of(
                    "orderId", order.path("id").asText(),
                    "amount", amountPaise,
                    "currency", "INR",
                    "keyId", keyId
            ));
        } catch (Exception e) {
            log.error("Razorpay create-order error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiErrorResponse("PAYMENT_ERROR", "Could not create payment order. Please try again."));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> body) {
        String orderId   = body.get("razorpay_order_id");
        String paymentId = body.get("razorpay_payment_id");
        String signature = body.get("razorpay_signature");

        if (orderId == null || paymentId == null || signature == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiErrorResponse("INVALID_PARAMS", "Missing payment details."));
        }

        if (!verifySignature(orderId, paymentId, signature)) {
            log.warn("Payment signature verification failed for order {}", orderId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiErrorResponse("PAYMENT_FAILED", "Payment verification failed."));
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified successfully."));
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String computed = HexFormat.of().formatHex(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
            return computed.equals(signature);
        } catch (Exception e) {
            log.error("HMAC error: {}", e.getMessage());
            return false;
        }
    }
}
