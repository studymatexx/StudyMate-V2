# StudyMate API Specification

## Base URL
```
http://192.168.43.128:3000/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Success Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "preferredLanguage": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "student@example.com",
      "name": "John Doe",
      "preferredLanguage": "en",
      "createdAt": "2025-01-20T10:00:00Z"
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register response.

### POST /auth/refresh
Refresh expired access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

## User Management

### GET /user/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "student@example.com",
    "name": "John Doe",
    "preferredLanguage": "en",
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-20T10:00:00Z"
  }
}
```

### PUT /user/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "preferredLanguage": "tr"
}
```

---

## Courses Management

### GET /courses
Get all user courses.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "course_123",
      "name": "Mathematics",
      "code": "MATH101",
      "color": "#3B82F6",
      "type": "theoretical",
      "credits": 4,
      "isActive": true,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### POST /courses
Create a new course.

**Request Body:**
```json
{
  "name": "Physics",
  "code": "PHYS101",
  "color": "#10B981",
  "type": "theoretical",
  "credits": 3
}
```

### PUT /courses/:id
Update existing course.

### DELETE /courses/:id
Delete course and all related data.

---

## Daily Study Plan

### GET /study-plan
Get study plan for a specific date.

**Query Parameters:**
- `date`: ISO date string (optional, defaults to today)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-01-20",
    "courses": [
      {
        "courseId": "course_123",
        "courseName": "Mathematics",
        "color": "#3B82F6",
        "tasks": [
          {
            "id": "task_123",
            "type": "studied",
            "completed": true,
            "timeSpent": 45,
            "notes": "Covered differential equations"
          },
          {
            "id": "task_124",
            "type": "reviewed",
            "completed": false,
            "timeSpent": 0
          }
        ]
      }
    ],
    "overallProgress": 67
  }
}
```

### POST /study-plan/tasks
Create or update a study task.

**Request Body:**
```json
{
  "courseId": "course_123",
  "type": "studied",
  "completed": true,
  "date": "2025-01-20",
  "timeSpent": 45,
  "notes": "Completed chapter 5 exercises"
}
```

---

## Weekly Schedule

### GET /schedule
Get weekly schedule.

**Query Parameters:**
- `week`: ISO week string (optional, defaults to current week)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "schedule_123",
      "courseId": "course_123",
      "courseName": "Mathematics",
      "courseColor": "#3B82F6",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "10:30",
      "location": "Room 101",
      "type": "theoretical"
    }
  ]
}
```

### POST /schedule
Create schedule entry.

**Request Body:**
```json
{
  "courseId": "course_123",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "10:30",
  "location": "Room 101"
}
```

### PUT /schedule/:id
Update schedule entry.

### DELETE /schedule/:id
Delete schedule entry.

---

## GPA Management

### GET /gpa/goal
Get current GPA goal.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "goal_123",
    "targetGPA": 3.5,
    "currentGPA": 3.2,
    "calculationType": "university",
    "targetDate": "2025-06-15",
    "progressPercentage": 91.4
  }
}
```

### POST /gpa/goal
Set or update GPA goal.

**Request Body:**
```json
{
  "targetGPA": 3.5,
  "calculationType": "university",
  "targetDate": "2025-06-15"
}
```

### GET /gpa/calculate
Calculate current GPA.

**Query Parameters:**
- `type`: "university" or "preuni"

**Response:**
```json
{
  "success": true,
  "data": {
    "currentGPA": 3.2,
    "totalCredits": 24,
    "gradeBreakdown": [
      {
        "courseId": "course_123",
        "courseName": "Mathematics",
        "credits": 4,
        "gradePoint": 3.7,
        "letterGrade": "A-"
      }
    ]
  }
}
```

### POST /gpa/grades
Add or update grade.

**Request Body:**
```json
{
  "courseId": "course_123",
  "type": "midterm",
  "score": 85,
  "maxScore": 100,
  "weight": 40,
  "date": "2025-01-20"
}
```

---

## To-Do List

### GET /todos
Get user's todos.

**Query Parameters:**
- `date`: ISO date string (optional)
- `completed`: boolean (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "todo_123",
      "title": "Complete Math Assignment",
      "description": "Solve problems 1-15",
      "completed": false,
      "priority": "high",
      "courseId": "course_123",
      "courseName": "Mathematics",
      "dueDate": "2025-01-21T23:59:59Z",
      "estimatedTime": 60,
      "createdAt": "2025-01-20T10:00:00Z"
    }
  ]
}
```

### POST /todos
Create new todo.

**Request Body:**
```json
{
  "title": "Review Physics Notes",
  "description": "Go through electromagnetic theory",
  "priority": "medium",
  "courseId": "course_456",
  "dueDate": "2025-01-22T23:59:59Z",
  "estimatedTime": 30
}
```

### PUT /todos/:id
Update todo.

### DELETE /todos/:id
Delete todo.

---

## Focus Sessions

### POST /focus/start
Start a new focus session.

**Request Body:**
```json
{
  "courseId": "course_123",
  "plannedDuration": 25,
  "sessionType": "study"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "startTime": "2025-01-20T14:00:00Z",
    "plannedEndTime": "2025-01-20T14:25:00Z"
  }
}
```

### PUT /focus/:sessionId/end
End focus session.

**Request Body:**
```json
{
  "actualDuration": 25,
  "wasCompleted": true,
  "notes": "Completed calculus problems",
  "problemsSolved": 3
}
```

### GET /focus/history
Get focus session history.

**Query Parameters:**
- `limit`: number (optional, default 20)
- `offset`: number (optional, default 0)

---

## AI Problem Solving

### POST /ai/solve
Submit problem image for AI solution.

**Request Body (multipart/form-data):**
```
image: [image file]
subject: "mathematics"
difficulty: "medium"
language: "en"
previousAttempts: ["2x + 5 = 13, x = 4"]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "solutionId": "solution_123",
    "question": "Solve: 2x + 5 = 13",
    "solution": "x = 4",
    "steps": [
      {
        "stepNumber": 1,
        "description": "Subtract 5 from both sides",
        "equation": "2x + 5 - 5 = 13 - 5",
        "result": "2x = 8"
      }
    ],
    "explanation": "This is a linear equation...",
    "confidence": 0.95,
    "subject": "mathematics",
    "difficulty": "easy",
    "commonMistakes": [
      "Forgetting to apply operations to both sides"
    ]
  }
}
```

### POST /ai/analyze-errors
Analyze potential errors in solution.

**Request Body:**
```json
{
  "solutionId": "solution_123",
  "userQuestion": "Why might this approach be wrong?"
}
```

### POST /ai/ask-again
Submit follow-up question.

**Request Body:**
```json
{
  "solutionId": "solution_123",
  "newQuestion": "Can you solve this using a different method?",
  "context": "Previous solution used substitution"
}
```

---

## Quiz System

### GET /quizzes
Get available quizzes.

**Query Parameters:**
- `subject`: string (optional)
- `difficulty`: string (optional)
- `limit`: number (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "quiz_123",
      "title": "YKS Mathematics Practice",
      "description": "25 questions covering algebra and calculus",
      "subject": "mathematics",
      "difficulty": "medium",
      "timeLimit": 30,
      "questionCount": 25,
      "averageScore": 78.5
    }
  ]
}
```

### GET /quizzes/:id
Get quiz details and questions.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "quiz_123",
    "title": "YKS Mathematics Practice",
    "timeLimit": 30,
    "questions": [
      {
        "id": "q_123",
        "question": "What is the derivative of x²?",
        "options": ["2x", "x", "2", "x²"],
        "points": 4
      }
    ]
  }
}
```

### POST /quizzes/:id/attempt
Start quiz attempt.

**Response:**
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_123",
    "startTime": "2025-01-20T15:00:00Z",
    "endTime": "2025-01-20T15:30:00Z"
  }
}
```

### POST /quizzes/attempts/:id/submit
Submit quiz answers.

**Request Body:**
```json
{
  "responses": [
    {
      "questionId": "q_123",
      "selectedAnswer": 0,
      "timeSpent": 45
    }
  ]
}
```

### GET /quizzes/attempts/:id/results
Get quiz results.

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 80,
    "maxScore": 100,
    "accuracy": 80,
    "timeSpent": 1800,
    "correctAnswers": 20,
    "totalQuestions": 25,
    "breakdown": {
      "mathematics": { "correct": 15, "total": 20 },
      "physics": { "correct": 5, "total": 5 }
    },
    "weakAreas": ["derivatives", "integration"],
    "parentSummary": "Excellent performance with 80% accuracy..."
  }
}
```

---

## Study Statistics

### GET /statistics
Get study statistics.

**Query Parameters:**
- `period`: "daily" | "weekly" | "monthly"
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "weekly",
    "totalStudyTime": 420,
    "focusSessions": 15,
    "avgSessionLength": 28,
    "tasksCompleted": 42,
    "quizzesTaken": 3,
    "avgQuizScore": 82.5,
    "subjectBreakdown": [
      {
        "subject": "Mathematics",
        "timeSpent": 180,
        "sessions": 8,
        "avgScore": 85,
        "tasksCompleted": 20
      }
    ],
    "dailyBreakdown": [
      {
        "date": "2025-01-20",
        "studyTime": 120,
        "sessions": 3,
        "tasksCompleted": 8
      }
    ],
    "insights": {
      "strongestSubject": "Mathematics",
      "weakestSubject": "Physics",
      "mostStudiedSubject": "Mathematics",
      "recommendedFocus": ["Physics", "Chemistry"]
    }
  }
}
```

---

## Language & Preferences

### GET /user/preferences
Get user preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "language": "en",
    "theme": "light",
    "notifications": {
      "studyReminders": true,
      "quizAvailable": true,
      "goalProgress": true
    },
    "focusMode": {
      "defaultDuration": 25,
      "exitPassword": "encrypted_password_hash"
    }
  }
}
```

### PUT /user/preferences
Update user preferences.

**Request Body:**
```json
{
  "language": "tr",
  "notifications": {
    "studyReminders": false
  }
}
```

---

## Parent Dashboard

### GET /parent/summary/:studentId
Get student performance summary for parents.

**Response:**
```json
{
  "success": true,
  "data": {
    "studentName": "John Doe",
    "period": "last_week",
    "overallPerformance": {
      "studyHours": 25,
      "quizAccuracy": 82.5,
      "tasksCompleted": 42,
      "focusSessions": 15
    },
    "subjectPerformance": [
      {
        "subject": "Mathematics",
        "avgScore": 85,
        "timeSpent": 10,
        "improvement": "+5%"
      }
    ],
    "recentQuizzes": [
      {
        "quizName": "YKS Math Practice",
        "score": 85,
        "date": "2025-01-19",
        "timeSpent": "28m",
        "weakAreas": ["integration"]
      }
    ],
    "recommendations": [
      "Focus more time on Physics concepts",
      "Practice more calculus problems"
    ]
  }
}
```

---

## WebSocket Events (Real-time Updates)

### Connection
```javascript
const ws = new WebSocket('wss://api.studymate.app/ws');
ws.addEventListener('open', () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'jwt_token'
  }));
});
```

### Events

#### focus_session_update
Sent during active focus sessions.
```json
{
  "type": "focus_session_update",
  "data": {
    "sessionId": "session_123",
    "timeLeft": 1200,
    "isActive": true
  }
}
```

#### task_completion
Sent when tasks are completed.
```json
{
  "type": "task_completion",
  "data": {
    "taskId": "task_123",
    "courseId": "course_123",
    "progress": 75
  }
}
```

---

## Rate Limits
- Authentication endpoints: 5 requests per minute
- AI endpoints: 10 requests per minute
- Other endpoints: 100 requests per minute

## File Upload Limits
- Problem images: Maximum 5MB, formats: JPEG, PNG
- Profile images: Maximum 2MB, formats: JPEG, PNG

## Security Notes
- All passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Image uploads are scanned for malicious content
- Rate limiting prevents abuse
- CORS properly configured for mobile app domains