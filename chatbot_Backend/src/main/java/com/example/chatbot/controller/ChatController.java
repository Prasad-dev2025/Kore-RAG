package com.example.chatbot.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode; // Imported for direct extraction

import com.example.chatbot.dto.ChatRequest;
import com.example.chatbot.service.CloudAiService;

import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*") 
public class ChatController {

	private final CloudAiService aiService;

	public ChatController(CloudAiService aiService) {
		this.aiService = aiService;
	}

	// 1. Regular conversation endpoint using your simple ChatRequest record
	// Keep your existing imports, but ensure you have the service call wrapped correctly
	@PostMapping(value = "/stream-chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public Flux<String> streamChat(@RequestBody ChatRequest request) {
	    // The service returns Flux<String>, which is perfect. 
	    // Ensure the service method itself is using the null-safe check we discussed.
	    return aiService.streamChatWithMemory(request);
	}

	// 2. Simple extraction directly from incoming JSON without extra DTOs
	@PostMapping("/train")
	public String ingestText(@RequestBody Map<String, String> payload) {
	    // Check if the key exists to avoid NullPointerException
	    String extractedContent = payload.getOrDefault("content", "");
	    
	    if (extractedContent.isEmpty()) {
	        throw new IllegalArgumentException("Payload must contain 'content' field");
	    }
	    
	    aiService.storeKnowledge(extractedContent);
	    return "Manual text successfully vectorized.";
	}

	@PostMapping("/upload")
	public String ingestFile(@RequestParam("file") MultipartFile file) {
		aiService.storeDocumentFile(file);
		return "Document " + file.getOriginalFilename() + " processed cleanly.";
	}

	@DeleteMapping("/clear-knowledge")
	public String clearMemory() {
		aiService.clearAllKnowledge();
		return "Vector tracking database records flushed successfully.";
	}
}