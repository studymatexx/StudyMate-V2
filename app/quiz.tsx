import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { ArrowLeft, Clock, CircleCheck as CheckCircle, Circle as XCircle, ChartBar as BarChart3 } from 'lucide-react-native';
import { Link } from 'expo-router';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export default function QuizScreen() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const questions: Question[] = [
    {
      id: '1',
      question: 'What is the derivative of x² + 3x + 2?',
      options: ['2x + 3', 'x² + 3', '2x + 2', 'x + 3'],
      correctAnswer: 0,
      explanation: 'The derivative of x² is 2x, the derivative of 3x is 3, and the derivative of a constant is 0.',
      subject: 'Mathematics',
      difficulty: 'medium',
    },
    {
      id: '2',
      question: 'Which of the following is Newton\'s second law of motion?',
      options: ['F = ma', 'E = mc²', 'V = IR', 'PV = nRT'],
      correctAnswer: 0,
      explanation: 'Newton\'s second law states that Force equals mass times acceleration (F = ma).',
      subject: 'Physics',
      difficulty: 'easy',
    },
    {
      id: '3',
      question: 'What is the atomic number of Carbon?',
      options: ['4', '6', '8', '12'],
      correctAnswer: 1,
      explanation: 'Carbon has 6 protons in its nucleus, making its atomic number 6.',
      subject: 'Chemistry',
      difficulty: 'easy',
    },
  ];

  useEffect(() => {
    let interval: number;
    
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            completeQuiz();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, quizCompleted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setQuestionStartTime(Date.now());
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const newResult: QuizResult = {
        questionId: questions[currentQuestion].id,
        selectedAnswer,
        isCorrect: selectedAnswer === questions[currentQuestion].correctAnswer,
        timeSpent,
      };

      setResults([...results, newResult]);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setQuestionStartTime(Date.now());
      } else {
        completeQuiz();
      }
    }
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    setQuizStarted(false);
  };

  const getQuizStats = () => {
    const correctAnswers = results.filter(result => result.isCorrect).length;
    const totalTime = results.reduce((sum, result) => sum + result.timeSpent, 0);
    const accuracy = results.length > 0 ? (correctAnswers / results.length) * 100 : 0;
    const avgTimePerQuestion = results.length > 0 ? totalTime / results.length : 0;

    return {
      correctAnswers,
      totalQuestions: questions.length,
      accuracy,
      totalTime,
      avgTimePerQuestion,
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (!quizStarted && !quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>YKS Practice Quiz</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.startContainer}>
          <View style={styles.quizInfo}>
            <Text style={styles.quizTitle}>Mathematics & Science Quiz</Text>
            <Text style={styles.quizDescription}>
              Practice with YKS-style questions to test your knowledge and improve your exam performance.
            </Text>
            
            <View style={styles.quizDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Questions:</Text>
                <Text style={styles.detailValue}>{questions.length}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Time Limit:</Text>
                <Text style={styles.detailValue}>30 minutes</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Subjects:</Text>
                <Text style={styles.detailValue}>Math, Physics, Chemistry</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    const stats = getQuizStats();
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.resultsCard}>
            <BarChart3 size={48} color="#4F46E5" />
            <Text style={styles.scoreText}>
              {stats.correctAnswers}/{stats.totalQuestions}
            </Text>
            <Text style={styles.accuracyText}>{stats.accuracy.toFixed(1)}% Accuracy</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{Math.floor(stats.totalTime / 60)}m</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.avgTimePerQuestion.toFixed(0)}s</Text>
                <Text style={styles.statLabel}>Avg per Question</Text>
              </View>
            </View>
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Question Review</Text>
            {questions.map((question, index) => {
              const result = results[index];
              const isCorrect = result?.isCorrect || false;
              
              return (
                <View key={question.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.questionNumber}>
                      <Text style={styles.questionNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.questionInfo}>
                      <Text style={styles.questionSubject}>{question.subject}</Text>
                      <View
                        style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(question.difficulty) },
                        ]}
                      >
                        <Text style={styles.difficultyText}>{question.difficulty}</Text>
                      </View>
                    </View>
                    {isCorrect ? (
                      <CheckCircle size={24} color="#10B981" />
                    ) : (
                      <XCircle size={24} color="#EF4444" />
                    )}
                  </View>
                  
                  <Text style={styles.reviewQuestion}>{question.question}</Text>
                  
                  {!isCorrect && (
                    <View style={styles.correctAnswerContainer}>
                      <Text style={styles.correctAnswerLabel}>Correct Answer:</Text>
                      <Text style={styles.correctAnswerText}>
                        {question.options[question.correctAnswer]}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.parentReviewCard}>
            <Text style={styles.parentReviewTitle}>Parent Review Summary</Text>
            <Text style={styles.parentReviewText}>
              Performance: {stats.accuracy.toFixed(1)}% accuracy with {stats.correctAnswers} out of {stats.totalQuestions} questions correct.
              Time management: {Math.floor(stats.avgTimePerQuestion)} seconds average per question.
              
              {stats.accuracy < 70 && "\n\nRecommendation: Focus on reviewing basic concepts and practice more problems in weaker areas."}
              {stats.accuracy >= 70 && stats.accuracy < 85 && "\n\nRecommendation: Good progress! Continue practicing to improve consistency."}
              {stats.accuracy >= 85 && "\n\nExcellent work! Performance is above average. Consider moving to more challenging problems."}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Quiz</Text>
        <View style={styles.timerContainer}>
          <Clock size={16} color="#FFFFFF" />
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionSubject}>{question.subject}</Text>
            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(question.difficulty) },
              ]}
            >
              <Text style={styles.difficultyText}>{question.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption,
              ]}
              onPress={() => selectAnswer(index)}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer === index && styles.selectedOptionText,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              selectedAnswer === null && styles.disabledButton,
            ]}
            onPress={nextQuestion}
            disabled={selectedAnswer === null}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  quizInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  quizDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  quizDetails: {
    width: '100%',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  startButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F5FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLetterText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  actionContainer: {
    paddingBottom: 20,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 16,
  },
  accuracyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  questionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewQuestion: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 40,
  },
  correctAnswerContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginLeft: 40,
  },
  correctAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  correctAnswerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#047857',
  },
  parentReviewCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  parentReviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
  },
  parentReviewText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});