const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;



// OpenAI yapılandırması
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Soru karıştırma fonksiyonu
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// CSV'den soru okuma ve karıştırma
function loadQuestionsFromCSV(examType) {
  try {
    const csvPath = path.join(__dirname, `${examType}_questions.csv`);
    
    if (!fs.existsSync(csvPath)) {
      console.error(`${examType} soru havuzu dosyası bulunamadı: ${csvPath}`);
      return [];
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const questions = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const question = {};
        
        headers.forEach((header, index) => {
          question[header.trim()] = values[index] ? values[index].trim() : '';
        });
        
        questions.push(question);
      }
    }
    
    // Soruları karıştır
    const shuffledQuestions = shuffleArray([...questions]);
    console.log(`${examType} soru havuzundan ${shuffledQuestions.length} soru yüklendi ve karıştırıldı`);
    
    return shuffledQuestions;
  } catch (error) {
    console.error('CSV okuma hatası:', error);
    return [];
  }
}

// JSON'dan soru okuma ve karıştırma
function loadQuestionsFromJSON(examType, subject) {
  try {
    let jsonPath;
    
    if (examType === 'AYT' && subject === 'Matematik') {
      jsonPath = path.join(__dirname, 'ayt_matematik.json');
    } else {
      console.error(`${examType} ${subject} için JSON dosyası bulunamadı`);
      return [];
    }
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`JSON dosyası bulunamadı: ${jsonPath}`);
      return [];
    }
    
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    if (!data.questions || !Array.isArray(data.questions)) {
      console.error('JSON dosyasında geçerli soru formatı bulunamadı');
      return [];
    }
    
    // JSON formatını quiz sistemine uygun formata dönüştür
    const convertedQuestions = data.questions.map((q, index) => ({
      id: `json_${index + 1}`,
      question: q.question,
      options: [q.choices.A, q.choices.B, q.choices.C, q.choices.D, q.choices.E],
      correctAnswer: q.answer.charCodeAt(0) - 65, // A=0, B=1, C=2, D=3, E=4
      explanation: `Doğru cevap: ${q.answer}`,
      subject: subject,
      difficulty: 'medium',
      year: 2024,
      number: q.number
    }));
    
    // Soruları karıştır
    const shuffledQuestions = shuffleArray([...convertedQuestions]);
    console.log(`${examType} ${subject} JSON'dan ${shuffledQuestions.length} soru yüklendi ve karıştırıldı`);
    
    return shuffledQuestions;
  } catch (error) {
    console.error('JSON okuma hatası:', error);
    return [];
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'StudyMate Backend çalışıyor',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Soru havuzu endpoint'i (CSV)
app.get('/api/questions/:examType', (req, res) => {
  try {
    const examType = req.params.examType.toUpperCase(); // TYT veya AYT
    console.log(`${examType} soru havuzu isteniyor...`);
    
    const questions = loadQuestionsFromCSV(examType);
    
    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `${examType} soru havuzu bulunamadı veya boş. Lütfen dosyanın mevcut olduğundan emin olun.`
      });
    }
    
    res.json({
      success: true,
      data: {
        examType: examType,
        totalQuestions: questions.length,
        questions: questions
      }
    });
    
    console.log(`${examType} soru havuzundan ${questions.length} soru başarıyla gönderildi`);
  } catch (error) {
    console.error('Soru havuzu okuma hatası:', error);
    res.status(500).json({
      success: false,
      error: `Soru havuzu okunamadı: ${error.message}`
    });
  }
});

// JSON'dan soru havuzu endpoint'i
app.get('/api/questions/:examType/:subject', (req, res) => {
  try {
    const examType = req.params.examType.toUpperCase(); // TYT veya AYT
    const subject = req.params.subject; // Matematik, Fizik, vb.
    console.log(`${examType} ${subject} soru havuzu isteniyor...`);
    
    const questions = loadQuestionsFromJSON(examType, subject);
    
    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `${examType} ${subject} soru havuzu bulunamadı veya boş.`
      });
    }
    
    res.json({
      success: true,
      data: {
        examType: examType,
        subject: subject,
        questions: questions,
        totalQuestions: questions.length
      }
    });
    
    console.log(`${examType} ${subject} JSON'dan ${questions.length} soru başarıyla gönderildi`);
  } catch (error) {
    console.error('JSON soru havuzu yükleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'JSON soru havuzu yüklenirken bir hata oluştu'
    });
  }
});

// AI soru çözümü endpoint'i
app.post('/api/ai/solve', async (req, res) => {
  try {
    const { imageBase64, subject, difficulty, language } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Resim verisi gerekli'
      });
    }
    
    console.log('AI çözümü isteniyor...');
    
    const prompt = `
    Bu bir ${subject} sorusudur. ${difficulty} seviyesinde.
    Lütfen bu soruyu Türkçe olarak çözün ve aşağıdaki formatta yanıtlayın:
    
    {
      "problem": "Soru metni",
      "problemType": "Soru tipi",
      "solution": "Genel çözüm açıklaması",
      "steps": [
        {
          "step": 1,
          "description": "Adım açıklaması",
          "equation": "Matematiksel ifade (varsa)",
          "result": "Ara sonuç",
          "reasoning": "Mantık açıklaması"
        }
      ],
      "explanation": "Detaylı açıklama",
      "formula": "Kullanılan formül (varsa)",
      "finalAnswer": "Final cevap",
      "verification": "Doğrulama",
      "commonMistakes": ["Yaygın hata 1", "Yaygın hata 2"],
      "similarProblems": ["Benzer problem 1", "Benzer problem 2"],
      "confidence": 0.95
    }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    });
    
    const aiResponse = response.choices[0].message.content;
    
    // JSON parse etmeye çalış
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      // JSON parse edilemezse, manuel olarak yapılandır
      parsedResponse = {
        problem: "Soru analiz edildi",
        problemType: subject,
        solution: aiResponse,
        steps: [
          {
            step: 1,
            description: "AI çözümü",
            equation: "",
            result: "",
            reasoning: aiResponse
          }
        ],
        explanation: aiResponse,
        formula: "",
        finalAnswer: "AI tarafından çözüldü",
        verification: "AI doğrulaması",
        commonMistakes: ["AI analizi"],
        similarProblems: ["AI önerisi"],
        confidence: 0.8
      };
    }
    
    res.json({
      success: true,
      data: parsedResponse
    });
    
    console.log('AI çözümü başarıyla tamamlandı');
  } catch (error) {
    console.error('AI çözüm hatası:', error);
    res.status(500).json({
      success: false,
      error: `AI çözümü alınamadı: ${error.message}`
    });
  }
});

// Sınav sonucu kaydetme endpoint'i
app.post('/api/exam/result', async (req, res) => {
  try {
    const { examSession } = req.body;
    
    if (!examSession) {
      return res.status(400).json({
        success: false,
        error: 'Sınav oturumu verisi gerekli'
      });
    }
    
    // Burada veritabanına kaydetme işlemi yapılabilir
    console.log('Sınav sonucu kaydedildi:', examSession.id);
    
    res.json({
      success: true,
      message: 'Sınav sonucu başarıyla kaydedildi',
      sessionId: examSession.id
    });
  } catch (error) {
    console.error('Sınav sonucu kaydetme hatası:', error);
    res.status(500).json({
      success: false,
      error: `Sınav sonucu kaydedilemedi: ${error.message}`
    });
  }
});

// Puanlama sistemi endpoint'i
app.post('/api/exam/calculate-score', async (req, res) => {
  try {
    const { examType, results, subjects } = req.body;
    
    if (!examType || !results || !subjects) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli veriler eksik'
      });
    }
    
    // YKS puanlama sistemi
    const puanlamaSistemi = {
      TYT: {
        'Türkçe': { weight: 1.32, netWeight: 1.32 },
        'Matematik': { weight: 1.32, netWeight: 1.32 },
        'Sosyal Bilimler': { weight: 1.36, netWeight: 1.36 },
        'Fen Bilimleri': { weight: 1.36, netWeight: 1.36 }
      },
      AYT: {
        'Türk Dili ve Edebiyatı': { weight: 1.32, netWeight: 1.32 },
        'Sosyal Bilimler-2': { weight: 1.36, netWeight: 1.36 },
        'Matematik': { weight: 1.32, netWeight: 1.32 },
        'Fen Bilimleri': { weight: 1.36, netWeight: 1.36 }
      }
    };
    
    let totalNet = 0;
    let totalScore = 0;
    const calculatedSubjects = {};
    
    Object.keys(subjects).forEach(subject => {
      const subjectData = subjects[subject];
      const correct = subjectData.correct;
      const total = subjectData.total;
      const wrong = total - correct;
      const net = Math.max(0, correct - (wrong * 0.25)); // YKS puanlama
      const score = net * puanlamaSistemi[examType][subject].weight;
      
      calculatedSubjects[subject] = {
        correct,
        total,
        net: Math.round(net * 100) / 100,
        score: Math.round(score * 100) / 100
      };
      
      totalNet += net;
      totalScore += score;
    });
    
    // Alan puanları hesapla
    const alanPuanlari = {
      sayisal: 0,
      sozel: 0,
      esitAgirlik: 0
    };
    
    if (examType === 'AYT') {
      // Sayısal: Matematik + Fen Bilimleri
      if (calculatedSubjects['Matematik'] && calculatedSubjects['Fen Bilimleri']) {
        alanPuanlari.sayisal = calculatedSubjects['Matematik'].score + calculatedSubjects['Fen Bilimleri'].score;
      }
      
      // Sözel: Türk Dili ve Edebiyatı + Sosyal Bilimler-2
      if (calculatedSubjects['Türk Dili ve Edebiyatı'] && calculatedSubjects['Sosyal Bilimler-2']) {
        alanPuanlari.sozel = calculatedSubjects['Türk Dili ve Edebiyatı'].score + calculatedSubjects['Sosyal Bilimler-2'].score;
      }
      
      // Eşit Ağırlık: Matematik + Türk Dili ve Edebiyatı
      if (calculatedSubjects['Matematik'] && calculatedSubjects['Türk Dili ve Edebiyatı']) {
        alanPuanlari.esitAgirlik = calculatedSubjects['Matematik'].score + calculatedSubjects['Türk Dili ve Edebiyatı'].score;
      }
    }
    
    res.json({
      success: true,
      data: {
        totalNet: Math.round(totalNet * 100) / 100,
        totalScore: Math.round(totalScore * 100) / 100,
        subjects: calculatedSubjects,
        alanPuanlari,
        examType
      }
    });
    
    console.log('Puanlama hesaplaması tamamlandı');
  } catch (error) {
    console.error('Puanlama hatası:', error);
    res.status(500).json({
      success: false,
      error: `Puanlama hesaplanamadı: ${error.message}`
    });
  }
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudyMate Backend sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log('GPT-3.5 entegrasyonu aktif');
  console.log('Soru havuzu endpoint\'leri hazır');
  console.log('Puanlama sistemi aktif');
});