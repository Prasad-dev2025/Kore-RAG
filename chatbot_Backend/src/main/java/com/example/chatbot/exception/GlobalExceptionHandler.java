package com.example.chatbot.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        // This makes sure the frontend gets a clean error message
        return ResponseEntity.status(500).body("AI Service currently unavailable: " + e.getMessage());
    }
}