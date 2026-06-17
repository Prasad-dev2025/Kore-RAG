package com.example.chatbot.service;

import org.springframework.web.multipart.MultipartFile;
import com.example.chatbot.dto.ChatRequest;
import reactor.core.publisher.Flux;

public interface CloudAiService {
    void storeKnowledge(String content);
    void storeDocumentFile(MultipartFile file);
    void clearAllKnowledge();
    Flux<String> streamChatWithMemory(ChatRequest request);
}