# StudyMate - Product Requirements Document

## 1. Overall Purpose & Vision

StudyMate is a comprehensive mobile study productivity application designed specifically for students to manage their academic workflows, boost study efficiency, and maintain motivation through AI-powered assistance. The app serves as a complete study companion that combines daily planning, performance tracking, and intelligent problem-solving capabilities.

### Core Objectives:
- Streamline study workflow management and academic planning
- Provide data-driven insights into study patterns and performance
- Offer AI-powered problem-solving assistance with step-by-step guidance
- Maintain student motivation through progress tracking and achievements
- Support both Turkish and English languages for accessibility

---

## 2. User Personas

### Primary User: High School & University Students
- **Age**: 16-24 years old
- **Academic Level**: Preparing for YKS (Turkish university entrance exam) or currently enrolled in university
- **Tech Proficiency**: High mobile device usage, comfortable with modern apps
- **Study Challenges**: Time management, maintaining focus, understanding complex problems
- **Goals**: Improve academic performance, better study organization, exam preparation

### Secondary User: Parents/Guardians
- **Role**: Monitor student progress and performance
- **Access Level**: Read-only dashboard with performance summaries
- **Interest**: Academic progress, time management, areas needing improvement

---

## 3. Core Features Specification

### 3.1 Home Screen (Welcome/Login)
**Purpose**: App entry point with authentication and language selection

**Components**:
- **App Branding**: StudyMate logo and tagline
- **DateTime Display**: Current date and time in selected language format
- **Language Toggle**: Turkish ⇄ English with persistent storage
- **Motivational Quotes**: Rotating inspirational quotes (5-second intervals)
- **Authentication**: "Log In" button leading to main application

**Technical Requirements**:
- Language preference persists across app sessions
- Real-time clock updates
- Smooth quote transitions with fade animations
- Secure authentication flow

### 3.2 Main Navigation (6 Core Sections)
**Architecture**: Tab-based navigation with clean, intuitive icons

**Sections**:
1. **Daily Study Plan** - Course-based task tracking
2. **Weekly School Schedule** - Calendar with class management
3. **Focus Mode** - Timed study sessions with AI problem solving
4. **GPA Goal & Calculator** - Academic performance tracking
5. **Daily To-Do List** - Task management with course integration
6. **Study Statistics** - Analytics and performance insights

### 3.3 Daily Study Plan Screen
**Purpose**: Track completion of five core study activities per course

**Core Functionality**:
- **Five Subtasks per Course**:
  1. Studied (primary learning)
  2. Reviewed (reinforcement)
  3. Notes Taken (documentation)
  4. Quiz Solved (practice testing)
  5. Extra Resource Read (supplemental learning)

**Visual Features**:
- Color-coded courses for easy identification
- Visual completion indicators (checkmarks, color changes)
- Real-time progress calculation and display
- End-of-day success percentage with visual progress bar

**Technical Requirements**:
- Real-time task status updates
- Progress persistence across sessions
- Integration with focus mode time tracking
- Sync with to-do list items

### 3.4 Weekly School Schedule
**Purpose**: Comprehensive calendar management with focus enhancement

**Core Features**:
- **7-Day Editable Calendar**: Full week view with day selection
- **Schedule Management**: Add, edit, delete class entries
- **Upload/Input Methods**: Manual entry, file upload, or text input
- **Visual Focus Enhancement**: 
  - Current day prominently highlighted
  - Other days subtly blurred to increase focus
- **Color Coding**: 
  - Theoretical classes: Blue theme
  - Practical/Lab classes: Green theme
- **Class Details**: Time, location, course type, instructor notes

**User Experience**:
- Swipe between days or tap day selector
- Long press for quick edit options
- Drag-and-drop for time adjustments
- Visual indicators for current time and upcoming classes

### 3.5 GPA Goal & Calculator (Unified Screen)
**Purpose**: Comprehensive academic performance management

**Two Operation Modes**:

#### Mode 1: Set Goal
- Input desired target GPA
- System calculates required grades to achieve goal
- Visual progress tracking toward goal
- Timeline and milestone setting

#### Mode 2: Calculate Current GPA
- Input courses, credits, and current grades
- Real-time GPA calculation and display
- Grade impact analysis

**Dual Education System Support**:

#### University Section (Top):
- **Weighted Grade System**: Midterm/Final percentages
- **Credit-based Calculation**: Weighted by course credits
- **Grade Components**: Midterm, Final, Assignments, Quizzes
- **GPA Scale**: 4.0 scale with letter grade conversion

#### Pre-University Section (Bottom):
- **Two-Term Average**: Simple semester-based calculation
- **Percentage-based**: 0-100 scale typical in Turkish high schools
- **Subject Weighting**: Equal or custom subject weights

**Visual Elements**:
- Progress graphs and charts
- Goal achievement percentage
- Grade trend analysis
- Performance predictions

### 3.6 Daily To-Do List
**Purpose**: Comprehensive task management with study plan integration

**Core Features**:
- **CRUD Operations**: Add, edit, mark complete, delete tasks
- **Drag-and-Drop Reordering**: Intuitive priority management
- **Course Integration**: Link tasks to specific courses
- **Priority Levels**: High, Medium, Low with color coding
- **Real-time Sync**: Bidirectional sync with Daily Study Plan

**Advanced Features**:
- Due date tracking and notifications
- Estimated time requirements
- Task categorization (study, assignment, exam, personal)
- Completion statistics and streaks

### 3.7 Study Statistics
**Purpose**: Comprehensive analytics and performance insights

**Analytics Periods**:
- **Daily**: Hourly breakdown of study activities
- **Weekly**: Day-by-day performance trends
- **Monthly**: Long-term progress and patterns

**Data Sources**:
- Focus Mode session tracking
- Task completion rates
- Quiz performance scores
- Time allocation across subjects

**Visualizations**:
- **Pie Charts**: Time distribution across subjects
- **Bar Charts**: Daily/weekly study hours
- **Line Graphs**: Performance trends over time
- **Heat Maps**: Study intensity patterns

**Insights Generated**:
- Strongest and weakest subjects identification
- Optimal study time recommendations
- Progress toward goals
- Performance predictions

### 3.8 Focus Mode
**Purpose**: Distraction-free study environment with AI assistance

**Core Timer Features**:
- **Preset Durations**: 25 minutes (Pomodoro), 50 minutes (class length)
- **Custom Duration**: User-defined session length (1-180 minutes)
- **Visual Timer**: Large, prominent countdown display
- **Session Management**: Start, pause, reset functionality

**Lockdown Features**:
- **Screen Lock**: Prevents accidental interaction during sessions
- **Password Exit**: Requires password to exit early (default: "exit123")
- **Distraction Blocking**: Minimal UI to maintain focus

**AI Problem Solving Integration**:
- **Camera Access**: Quick capture of problems during study
- **Instant Processing**: Send to GPT-powered solution engine
- **Solution Overlay**: Display solution steps over captured image

**Session Completion**:
- **Voice Motivation**: Automated congratulatory message
- **Session Statistics**: Time spent, problems solved, notes taken
- **Achievement Tracking**: Streak counting and badges

### 3.9 AI-Powered Solution Screen
**Purpose**: Comprehensive problem-solving interface with educational focus

**Solution Display**:
- **Image Overlay**: Solution steps overlaid on original problem image
- **Step-by-Step Breakdown**: Numbered solution steps with explanations
- **Mathematical Formatting**: Proper equation rendering
- **Visual Clarity**: Clean, readable layout with appropriate spacing

**Interactive Features**:
- **Audio Explanation**: Text-to-speech for solution steps
- **Error Analysis**: "Why could it be wrong?" button triggers critical analysis
- **Retry Mechanism**: "Ask again" button for alternative solutions or clarifications
- **Solution Verification**: Multiple approaches and answer checking

**Educational Enhancement**:
- **Concept Explanation**: Background theory and principles
- **Common Mistakes**: Identification of typical student errors
- **Related Problems**: Suggestions for similar practice problems
- **Learning Resources**: Links to relevant study materials

---

## 4. Quiz Module (YKS-Style)

### 4.1 Question Database
**Content Strategy**:
- Utilize publicly available YKS exam-style questions
- Respect copyright and attribution requirements
- Cover core subjects: Mathematics, Physics, Chemistry, Biology
- Multiple difficulty levels aligned with YKS standards

### 4.2 Quiz Mechanics
**Timed Assessments**:
- Standard time limits matching YKS format
- Question-by-question timing for pacing analysis
- Auto-submit at time expiration
- Pause/resume capability for technical issues

**Question Types**:
- Multiple choice (primary YKS format)
- True/false questions
- Problem-solving with work shown
- Image-based questions with diagrams

### 4.3 Results Analysis
**Student Dashboard**:
- Overall score and percentage
- Subject-wise performance breakdown
- Time management analysis
- Weak area identification
- Improvement recommendations

**Parent Review Dashboard**:
- **Performance Summary**: Overall accuracy and score trends
- **Time Analysis**: Average time per question and total duration
- **Subject Breakdown**: Strengths and areas needing improvement
- **Recommendation Report**: Specific study suggestions for parents
- **Progress Tracking**: Improvement over time with visual graphs

---

## 5. Technical Infrastructure

### 5.1 Frontend Architecture
- **Framework**: React Native with Expo
- **Navigation**: Expo Router with tab-based structure
- **State Management**: React Context + useReducer for complex state
- **Offline Support**: AsyncStorage for data persistence
- **Real-time Updates**: WebSocket integration for live features

### 5.2 Backend Services
- **Server Location**: `192.168.43.128` (development)
- **Authentication**: JWT-based with refresh tokens
- **Database**: PostgreSQL with proper indexing
- **File Storage**: Cloud storage for images and user data
- **Real-time**: WebSocket server for live updates

### 5.3 AI Integration
- **Model**: GPT-3.5-turbo for problem solving
- **Image Processing**: OCR + Vision API for problem recognition
- **API Security**: Backend proxy with secured API keys
- **Response Caching**: Redis for frequently requested solutions

### 5.4 Internationalization
- **Languages**: Turkish and English
- **Storage**: Persistent language preference
- **Content**: All UI text, error messages, and AI responses localized
- **Formatting**: Date, time, and number formats respect language settings

---

## 6. Data Security & Privacy

### 6.1 User Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Authentication**: Secure password hashing with bcrypt
- **Session Management**: Automatic logout after inactivity
- **Data Minimization**: Collect only necessary information

### 6.2 Focus Mode Security
- **Exit Protection**: Password-protected exit during locked sessions
- **Data Integrity**: Session data preserved during interruptions
- **Privacy**: Camera images processed securely and optionally deleted

### 6.3 API Security
- **Rate Limiting**: Prevent abuse of AI endpoints
- **Input Validation**: Sanitize all user inputs
- **Error Handling**: No sensitive data in error responses
- **Audit Logging**: Track all significant user actions

---

## 7. Performance Requirements

### 7.1 Response Times
- **App Launch**: < 3 seconds to main screen
- **Navigation**: < 500ms between screens
- **AI Solutions**: < 10 seconds for problem analysis
- **Data Sync**: < 2 seconds for CRUD operations

### 7.2 Offline Capabilities
- **Core Features**: All basic functionality available offline
- **Data Sync**: Queue operations for when connection returns
- **AI Fallback**: Cached solutions for common problems
- **Graceful Degradation**: Clear indication of offline limitations

### 7.3 Scalability
- **User Base**: Support 10,000+ concurrent users
- **Data Growth**: Efficient handling of increasing user data
- **AI Load**: Queue system for high-demand periods
- **Storage**: Automatic cleanup of old, unnecessary data

---

## 8. Success Metrics

### 8.1 User Engagement
- Daily active users (DAU)
- Session duration and frequency
- Feature adoption rates
- Task completion rates

### 8.2 Academic Impact
- GPA improvement tracking
- Study time optimization
- Quiz performance trends
- User-reported academic improvements

### 8.3 Technical Performance
- App crash rates < 0.1%
- API response time SLA: 95% under 2 seconds
- AI solution accuracy > 90%
- User satisfaction scores > 4.5/5

---

## 9. Future Roadmap

### Phase 1 (MVP): Core Features
- Basic study planning and tracking
- Focus mode with timer
- Simple GPA calculation
- Basic quiz functionality

### Phase 2: AI Enhancement
- Full GPT integration for problem solving
- Advanced analytics and insights
- Personalized study recommendations
- Voice features and audio guidance

### Phase 3: Advanced Features
- Collaborative study groups
- Teacher/tutor integration
- Advanced quiz creation tools
- Comprehensive parent dashboard

### Phase 4: Platform Expansion
- Web application
- Desktop companion app
- Integration with school systems
- Advanced AI tutoring capabilities

This comprehensive requirements document provides the foundation for developing StudyMate as a world-class study productivity application that genuinely improves student academic outcomes through intelligent technology integration.