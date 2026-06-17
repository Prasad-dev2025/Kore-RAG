# KoreRAG

A full-stack RAG (Retrieval-Augmented Generation) application built with Spring Boot and React.

## Project Structure
- **/backend**: Spring Boot application using Spring AI for RAG.
- **/frontend**: React application for the chat interface.

## Getting Started

### Prerequisites
- Java 25
- Node.js 18+
- Maven

### Environment Variables
To run this project, you will need to set the following environment variables in your IDE or deployment platform (Render/Vercel):
- `DB_USERNAME`: Your database username
- `DB_PASSWORD`: Your database password
- `GROQ_API_KEY`: Your Groq API key for LLM services

## How to Run Locally

### Backend
1. Navigate to the `backend/` folder.
2. Run the application using your IDE or:
   ```bash
   mvn spring-boot:run
