# StudyMate Backend Server

GPT-3.5 entegrasyonu ile matematik problemlerini çözen backend sunucusu.

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
npm install
```

2. `.env` dosyası oluşturun:
```bash
cp .env.example .env
```

3. `.env` dosyasına OpenAI API anahtarınızı ekleyin:
```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

## Çalıştırma

```bash
# Geliştirme modu
npm run dev

# Üretim modu  
npm start
```

Sunucu `http://192.168.43.128:3000` adresinde çalışacak.

## API Endpoints

### POST /api/ai/solve
Matematik problemini çözer.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "subject": "matematik", 
  "difficulty": "orta",
  "language": "tr"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "problem": "Çöz: 2x + 5 = 13",
    "solution": "x = 4",
    "steps": [...],
    "explanation": "...",
    "commonMistakes": [...]
  }
}
```

### POST /api/ai/analyze-errors
Çözümdeki olası hataları analiz eder.

## Gereksinimler

- Node.js 16+
- OpenAI API Key
- İnternet bağlantısı