# ReportSamjho

> Apni report samjhein, apni bhasha mein — AI-powered medical report explainer for Indian users.

## Stack

| Layer    | Technology                   |
|----------|------------------------------|
| Frontend | React 18 + Tailwind CSS      |
| Backend  | Spring Boot 3 (Java 21+)     |
| AI       | Anthropic Claude API (Sonnet)|

## Quick Start

### 1. Backend

```bash
cd backend
# Copy and fill in your API key
cp .env.example .env   # set ANTHROPIC_API_KEY

# Run with Maven wrapper
./mvnw spring-boot:run
# or: ANTHROPIC_API_KEY=sk-ant-... ./mvnw spring-boot:run
```

Backend starts on **http://localhost:5001**

### 2. Frontend

```bash
cd frontend
cp .env.example .env   # REACT_APP_API_URL=http://localhost:5001
npm install
npm start
```

Frontend starts on **http://localhost:3000**

## API Endpoints

| Method | Path                 | Body / Form            | Description              |
|--------|----------------------|------------------------|--------------------------|
| POST   | `/api/analyse`       | `{ reportText, language }` | Analyse pasted text  |
| POST   | `/api/analyse-file`  | `multipart: report (file), language` | Analyse image/PDF |

## Languages Supported

English • हिंदी • தமிழ் • తెలుగు • বাংলা

## Disclaimer

Educational use only. Not medical advice.
