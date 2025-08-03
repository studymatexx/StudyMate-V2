# GPT Integration Flow for StudyMate

## Overview
StudyMate integrates with GPT-3.5 to provide AI-powered problem-solving capabilities. The system processes images of academic problems and provides step-by-step solutions with explanations.

## Architecture

### Image Processing Pipeline
```
Capture Image → OCR/Text Extraction → Context Analysis → GPT Query → Solution Rendering
```

### Backend Integration Point
- **Server IP**: `192.168.43.128`
- **API Key**: `<GPT_API_KEY>` (stored securely in environment variables)
- **Model**: GPT-3.5-turbo with vision capabilities

---

## Implementation Flow

### 1. Image Capture & Upload
```javascript
// Frontend (React Native)
const captureImage = async () => {
  const photo = await cameraRef.current.takePictureAsync({
    quality: 0.8,
    base64: true,
  });
  
  // Upload to backend
  const formData = new FormData();
  formData.append('image', {
    uri: photo.uri,
    type: 'image/jpeg',
    name: 'problem.jpg',
  });
  
  const response = await fetch('http://192.168.43.128:3000/api/ai/solve', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
};
```

### 2. Backend Processing
```javascript
// Backend (Node.js/Express)
app.post('/api/ai/solve', upload.single('image'), async (req, res) => {
  try {
    // 1. Process image with OCR
    const extractedText = await extractTextFromImage(req.file.buffer);
    
    // 2. Analyze context
    const context = await analyzeContext(extractedText, req.body);
    
    // 3. Construct GPT prompt
    const prompt = buildGPTPrompt(extractedText, context);
    
    // 4. Query GPT
    const solution = await queryGPT(prompt);
    
    // 5. Store and return result
    const solutionId = await storeSolution(solution, req.user.id);
    
    res.json({
      success: true,
      data: {
        solutionId,
        ...solution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 3. GPT Prompt Construction
```javascript
const buildGPTPrompt = (extractedText, context) => {
  const basePrompt = `
You are an expert tutor helping a ${context.language === 'tr' ? 'Turkish' : 'English'} student solve academic problems.

PROBLEM IMAGE TEXT:
${extractedText}

CONTEXT:
- Subject: ${context.subject || 'Unknown'}
- Student Level: ${context.studentLevel || 'High School'}
- Previous Attempts: ${context.previousAttempts?.join(', ') || 'None'}
- Language: ${context.language}

INSTRUCTIONS:
1. Identify the exact problem from the image text
2. Provide a complete step-by-step solution
3. Explain each step clearly
4. Include the mathematical reasoning
5. Highlight common mistakes students make
6. Respond in ${context.language === 'tr' ? 'Turkish' : 'English'}

FORMAT your response as JSON:
{
  "question": "Identified problem statement",
  "solution": "Final answer",
  "steps": [
    {
      "stepNumber": 1,
      "description": "What we're doing in this step",
      "equation": "Mathematical expression",
      "result": "Result of this step",
      "explanation": "Why we do this"
    }
  ],
  "explanation": "Overall explanation of the solution method",
  "subject": "Detected subject area",
  "difficulty": "easy/medium/hard",
  "commonMistakes": ["List of common errors"],
  "confidence": 0.95
}

If the image is unclear or doesn't contain a solvable problem, set confidence to 0 and explain what's needed.
`;

  return basePrompt;
};
```

### 4. GPT API Integration
```javascript
const queryGPT = async (prompt) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GPT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic tutor specializing in mathematics, physics, and chemistry.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`GPT API error: ${data.error?.message || 'Unknown error'}`);
  }

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (parseError) {
    throw new Error('Failed to parse GPT response');
  }
};
```

---

## Error Analysis Feature

### "Why could it be wrong?" Implementation
```javascript
const analyzeErrors = async (solutionId, userQuestion) => {
  const originalSolution = await getSolutionById(solutionId);
  
  const errorAnalysisPrompt = `
ORIGINAL SOLUTION:
${JSON.stringify(originalSolution)}

USER QUESTION: "${userQuestion}"

As an expert tutor, analyze potential issues with this solution:

1. Check for mathematical errors
2. Identify assumptions that might be wrong
3. Consider alternative interpretations of the problem
4. Look for edge cases or special conditions
5. Verify each step's logic

Provide a critical analysis that helps the student understand potential pitfalls.

FORMAT as JSON:
{
  "potentialIssues": [
    {
      "issue": "Description of potential problem",
      "explanation": "Why this could be an issue",
      "severity": "low/medium/high"
    }
  ],
  "alternativeApproaches": ["List of other solution methods"],
  "verificationSteps": ["Steps to verify the solution"],
  "confidence": 0.85
}
`;

  return await queryGPT(errorAnalysisPrompt);
};
```

---

## Voice Synthesis Integration

### Text-to-Speech Implementation
```javascript
// Frontend - React Native
import * as Speech from 'expo-speech';

const playExplanation = async (text, language) => {
  const speechOptions = {
    language: language === 'tr' ? 'tr-TR' : 'en-US',
    pitch: 1.0,
    rate: 0.8,
    quality: 'enhanced',
  };
  
  await Speech.speak(text, speechOptions);
};

// Motivational messages for focus session completion
const motivationalMessages = {
  en: [
    "Excellent work! You completed your focus session.",
    "Great job staying focused! Your dedication is paying off.",
    "Well done! You're building strong study habits.",
  ],
  tr: [
    "Harika çalışma! Odaklanma seansını tamamladın.",
    "Çok iyi! Odaklanman kararlılığının karşılığını veriyor.",
    "Tebrikler! Güçlü çalışma alışkanlıkları geliştiriyorsun.",
  ],
};

const playMotivationalMessage = (language) => {
  const messages = motivationalMessages[language];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  playExplanation(randomMessage, language);
};
```

---

## OCR Integration

### Text Extraction from Images
```javascript
// Using Google Cloud Vision API or Tesseract.js
const extractTextFromImage = async (imageBuffer) => {
  try {
    // Option 1: Google Cloud Vision
    const vision = new ImageAnnotatorClient({
      keyFilename: 'path/to/service-account.json',
    });
    
    const [result] = await vision.textDetection({
      image: { content: imageBuffer.toString('base64') },
    });
    
    return result.textAnnotations?.[0]?.description || '';
    
  } catch (error) {
    console.error('OCR failed:', error);
    
    // Fallback: Send image directly to GPT-4 Vision
    return await processWithGPTVision(imageBuffer);
  }
};

const processWithGPTVision = async (imageBuffer) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GPT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract and transcribe all text from this image, especially mathematical equations and problems.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

---

## Sample Prompt Templates

### Primary Solution Prompt
```javascript
const PRIMARY_SOLUTION_TEMPLATE = `
You are StudyMate AI, an expert academic tutor helping students with {SUBJECT} problems.

STUDENT CONTEXT:
- Current Subject: {SUBJECT}
- Academic Level: {LEVEL}
- Language: {LANGUAGE}
- Previous Attempts: {PREVIOUS_ATTEMPTS}

PROBLEM TO SOLVE:
{EXTRACTED_TEXT}

TASK:
Provide a comprehensive solution following these guidelines:

1. IDENTIFY the exact problem type and requirements
2. SOLVE step-by-step with clear mathematical reasoning
3. EXPLAIN why each step is necessary
4. HIGHLIGHT common mistakes students make with this type of problem
5. VERIFY the solution works

RESPONSE FORMAT (JSON):
{
  "question": "Clear restatement of the problem",
  "solution": "Final answer with units if applicable",
  "steps": [
    {
      "stepNumber": 1,
      "description": "What we're doing",
      "equation": "Mathematical expression",
      "result": "Step result",
      "explanation": "Why this step is necessary"
    }
  ],
  "explanation": "Overall method explanation",
  "subject": "Specific subject area",
  "difficulty": "easy/medium/hard",
  "commonMistakes": [
    "Specific mistakes students often make"
  ],
  "verificationSteps": [
    "How to check if the answer is correct"
  ],
  "confidence": 0.95,
  "relatedTopics": ["Related concepts to study"]
}

LANGUAGE: Respond in {LANGUAGE} ({LANGUAGE_CODE}).
TONE: Patient, encouraging, and educational.
FOCUS: Help the student understand the concept, not just get the answer.
`;
```

### Error Analysis Prompt
```javascript
const ERROR_ANALYSIS_TEMPLATE = `
You are reviewing a solution for potential errors and alternative approaches.

ORIGINAL SOLUTION:
{ORIGINAL_SOLUTION}

STUDENT QUESTION: "{STUDENT_QUESTION}"

ANALYSIS TASK:
Critically examine this solution for:
1. Mathematical accuracy
2. Logical consistency  
3. Assumption validity
4. Alternative solution methods
5. Edge cases or special conditions

Provide constructive feedback that helps the student think critically about problem-solving approaches.

RESPONSE FORMAT (JSON):
{
  "potentialIssues": [
    {
      "issue": "Specific concern",
      "explanation": "Why this could be problematic",
      "severity": "low/medium/high",
      "suggestion": "How to address this"
    }
  ],
  "alternativeApproaches": [
    {
      "method": "Alternative solution method",
      "description": "Brief explanation",
      "advantages": "When this method is better"
    }
  ],
  "verificationMethods": [
    "Ways to double-check the answer"
  ],
  "confidence": 0.90,
  "overallAssessment": "General feedback on solution quality"
}

LANGUAGE: {LANGUAGE}
TONE: Constructive and educational, not discouraging.
`;
```

### Follow-up Question Prompt
```javascript
const FOLLOWUP_QUESTION_TEMPLATE = `
CONVERSATION HISTORY:
Original Problem: {ORIGINAL_PROBLEM}
Previous Solution: {PREVIOUS_SOLUTION}
Previous Explanation: {PREVIOUS_EXPLANATION}

NEW STUDENT QUESTION: "{NEW_QUESTION}"

CONTEXT:
- The student is asking a follow-up question about the same problem
- They may want clarification, alternative methods, or related concepts
- Maintain continuity with previous explanations

TASK:
Address the student's new question while building on previous interactions.

RESPONSE FORMAT (JSON):
{
  "response": "Direct answer to their question",
  "elaboration": "Additional details or examples",
  "connections": "How this relates to previous discussion",
  "suggestions": [
    "Related questions they might want to explore"
  ],
  "practiceProblems": [
    "Similar problems they could try"
  ],
  "confidence": 0.92
}

LANGUAGE: {LANGUAGE}
TONE: Conversational and supportive, building on previous interaction.
`;
```

---

## Error Handling Strategies

### 1. Network Failures
```javascript
const handleGPTRequest = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await queryGPT(prompt);
      return response;
    } catch (error) {
      if (i === retries - 1) {
        return {
          success: false,
          error: 'AI service temporarily unavailable',
          fallbackSolution: generateFallbackResponse(prompt)
        };
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
```

### 2. Invalid Image Processing
```javascript
const validateImage = (imageBuffer) => {
  // Check file size (max 5MB)
  if (imageBuffer.length > 5 * 1024 * 1024) {
    throw new Error('Image too large. Please use an image under 5MB.');
  }
  
  // Check image format
  const signature = imageBuffer.slice(0, 4).toString('hex');
  const validFormats = {
    'ffd8': 'jpeg',
    '8950': 'png',
  };
  
  if (!Object.keys(validFormats).some(sig => signature.startsWith(sig))) {
    throw new Error('Invalid image format. Please use JPEG or PNG.');
  }
  
  return true;
};
```

### 3. Malformed GPT Responses
```javascript
const parseGPTResponse = (rawResponse) => {
  try {
    const parsed = JSON.parse(rawResponse);
    
    // Validate required fields
    const required = ['question', 'solution', 'steps', 'explanation'];
    const missing = required.filter(field => !parsed[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Sanitize and validate step structure
    parsed.steps = parsed.steps.map((step, index) => ({
      stepNumber: step.stepNumber || index + 1,
      description: step.description || 'Step description',
      equation: step.equation || '',
      result: step.result || '',
      explanation: step.explanation || ''
    }));
    
    return parsed;
  } catch (error) {
    return {
      question: 'Problem could not be parsed',
      solution: 'Solution unavailable',
      steps: [],
      explanation: 'The AI service encountered an error processing this problem.',
      confidence: 0,
      error: true
    };
  }
};
```

---

## Offline Handling

### 1. Cache Recent Solutions
```javascript
// Store recent solutions in AsyncStorage
const cacheService = {
  async storeSolution(solutionId, solution) {
    await AsyncStorage.setItem(
      `solution_${solutionId}`,
      JSON.stringify({
        ...solution,
        cachedAt: Date.now()
      })
    );
  },
  
  async getCachedSolution(solutionId) {
    const cached = await AsyncStorage.getItem(`solution_${solutionId}`);
    if (cached) {
      const solution = JSON.parse(cached);
      // Return if cached within last 24 hours
      if (Date.now() - solution.cachedAt < 24 * 60 * 60 * 1000) {
        return solution;
      }
    }
    return null;
  }
};
```

### 2. Offline Queue for Image Processing
```javascript
const offlineQueue = {
  async queueImageForProcessing(imageUri, context) {
    const queueItem = {
      id: Date.now().toString(),
      imageUri,
      context,
      timestamp: Date.now(),
      processed: false
    };
    
    const queue = await this.getQueue();
    queue.push(queueItem);
    await AsyncStorage.setItem('pending_images', JSON.stringify(queue));
    
    return queueItem.id;
  },
  
  async processQueue() {
    const queue = await this.getQueue();
    const unprocessed = queue.filter(item => !item.processed);
    
    for (const item of unprocessed) {
      try {
        await this.processQueuedImage(item);
        item.processed = true;
      } catch (error) {
        console.error('Failed to process queued image:', error);
      }
    }
    
    await AsyncStorage.setItem('pending_images', JSON.stringify(queue));
  }
};
```

---

## Security Considerations

### 1. API Key Protection
```javascript
// Backend environment configuration
const config = {
  gpt: {
    apiKey: process.env.GPT_API_KEY, // Never expose to frontend
    baseUrl: process.env.GPT_BASE_URL || 'https://api.openai.com/v1',
    timeout: 30000,
    maxRetries: 3
  },
  rateLimit: {
    aiRequests: {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // 10 requests per minute per user
    }
  }
};
```

### 2. Input Validation & Sanitization
```javascript
const validateSolveRequest = (req, res, next) => {
  const { subject, difficulty, language } = req.body;
  
  // Validate subject
  const validSubjects = ['mathematics', 'physics', 'chemistry', 'biology'];
  if (subject && !validSubjects.includes(subject.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid subject specified'
    });
  }
  
  // Validate difficulty
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (difficulty && !validDifficulties.includes(difficulty.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid difficulty level'
    });
  }
  
  // Validate language
  const validLanguages = ['en', 'tr'];
  if (language && !validLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported language'
    });
  }
  
  next();
};
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  keyGenerator: (req) => req.user.id,
  message: {
    success: false,
    error: 'Too many AI requests. Please wait before trying again.'
  }
});

app.use('/api/ai', aiRateLimit);
```

---

## Performance Optimization

### 1. Response Caching
```javascript
const Redis = require('redis');
const redis = Redis.createClient();

const cacheGPTResponse = async (promptHash, response) => {
  // Cache for 1 hour
  await redis.setex(`gpt_${promptHash}`, 3600, JSON.stringify(response));
};

const getCachedResponse = async (promptHash) => {
  const cached = await redis.get(`gpt_${promptHash}`);
  return cached ? JSON.parse(cached) : null;
};
```

### 2. Image Optimization
```javascript
const sharp = require('sharp');

const optimizeImage = async (imageBuffer) => {
  return await sharp(imageBuffer)
    .resize(1024, 1024, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ 
      quality: 80,
      progressive: true 
    })
    .toBuffer();
};
```

---

## Monitoring & Analytics

### 1. GPT Usage Tracking
```javascript
const trackGPTUsage = async (userId, request, response, duration) => {
  await db.collection('gpt_usage').add({
    userId,
    timestamp: new Date(),
    requestType: request.type,
    subject: request.subject,
    responseTime: duration,
    tokensUsed: response.usage?.total_tokens || 0,
    confidence: response.confidence || 0,
    success: response.success || false
  });
};
```

### 2. Error Monitoring
```javascript
const logGPTError = async (error, context) => {
  console.error('GPT Integration Error:', {
    error: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Send to monitoring service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context });
  }
};
```

This comprehensive GPT integration provides robust AI-powered problem solving with proper error handling, security measures, and performance optimizations for the StudyMate application.