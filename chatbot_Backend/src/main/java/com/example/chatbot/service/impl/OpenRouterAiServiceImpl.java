package com.example.chatbot.service.impl;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.chatbot.dto.ChatRequest;
import com.example.chatbot.service.CloudAiService;

import reactor.core.publisher.Flux;

@Service
public class OpenRouterAiServiceImpl implements CloudAiService {

	private final ChatModel chatModel;
	private final VectorStore vectorStore;

	public OpenRouterAiServiceImpl(ChatModel chatModel, VectorStore vectorStore) {
		this.chatModel = chatModel;
		this.vectorStore = vectorStore;
	}

	@Override
	public void storeKnowledge(String content) {
		Document document = new Document(content, Map.of("origin", "manual-ingest"));
		vectorStore.add(List.of(document));
	}

	@Override
	public void storeDocumentFile(MultipartFile file) {
		try {
			InputStreamResource resource = new InputStreamResource(file.getInputStream());
			TikaDocumentReader reader = new TikaDocumentReader(resource);
			List<Document> rawDocuments = reader.read();

			for (Document doc : rawDocuments) {
				doc.getMetadata().put("origin", "file-upload");
				doc.getMetadata().put("filename", file.getOriginalFilename());
			}

			TokenTextSplitter splitter = TokenTextSplitter.builder().withChunkSize(800).withMinChunkSizeChars(200)
					.withKeepSeparator(true).build();
			List<Document> splitDocuments = splitter.apply(rawDocuments);
			vectorStore.accept(splitDocuments);

		} catch (IOException e) {
			throw new RuntimeException("Vector ingest broken: " + e.getMessage(), e);
		}
	}

	@Override
	public void clearAllKnowledge() {
		try {
			SearchRequest cleanRequest = SearchRequest.builder().query("text")
					.filterExpression("origin=='file-upload' || origin=='manual-ingest'").topK(1000)
					.similarityThresholdAll().build();

			List<Document> allDocuments = vectorStore.similaritySearch(cleanRequest);
			if (!allDocuments.isEmpty()) {
				List<String> documentIds = allDocuments.stream().map(Document::getId).collect(Collectors.toList());
				vectorStore.delete(documentIds);
			}
		} catch (Exception e) {
			throw new RuntimeException("Failed flushing data layers: " + e.getMessage(), e);
		}
	}

	@Override
	public Flux<String> streamChatWithMemory(ChatRequest request) {
		List<Document> relevantDocs = vectorStore.similaritySearch(request.message());
		String contextData = relevantDocs.stream().map(Document::getText).collect(Collectors.joining("\n"));

		String systemInstructions = "You are a production-level cloud AI agent. Use this context data to answer: \n"
				+ contextData;

		SystemMessage systemMessage = new SystemMessage(systemInstructions);
		UserMessage userMessage = new UserMessage(request.message());

		return chatModel.stream(new Prompt(List.of(systemMessage, userMessage)))
		        .map(response -> {
		            if (response.getResult() != null && response.getResult().getOutput() != null) {
		                String text = response.getResult().getOutput().getText();
		                return text != null ? text : "";
		            }
		            return "";
		        });
	}
}