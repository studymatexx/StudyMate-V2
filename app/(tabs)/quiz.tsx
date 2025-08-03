import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { ArrowLeft, BookOpen, GraduationCap, Clock, Brain, BarChart3, Users, Target } from 'lucide-react-native';
import { Link } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  year: number;
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  subject: string;
}

interface ExamSession {
  id: string;
  examType: 'TYT' | 'AYT';
  startTime: number;
  endTime?: number;
  totalTime: number;
  results: QuizResult[];
  subjects: {
    [key: string]: {
      correct: number;
      total: number;
      net: number;
      score: number;
    };
  };
  totalScore: number;
  totalNet: number;
}

const SUBJECTS = {
  TYT: {
    'Türkçe': { questionCount: 40, timeLimit: 40, weight: 1.32 },
    'Sosyal Bilimler Testi': { questionCount: 20, timeLimit: 20, weight: 1.36 },
    'Temel Matematik Testi': { questionCount: 40, timeLimit: 40, weight: 1.32 },
    'Fen Bilimleri Testi': { questionCount: 20, timeLimit: 20, weight: 1.36 }
  },
  AYT: {
    'Türk Dili ve Edebiyatı-Sosyal Bilimler I': { questionCount: 40, timeLimit: 45, weight: 1.32 },
    'Matematik': { questionCount: 40, timeLimit: 45, weight: 1.32 },
    'Fen Bilimleri': { questionCount: 40, timeLimit: 45, weight: 1.36 },
    'Sosyal Bilimler II': { questionCount: 40, timeLimit: 45, weight: 1.36 }
  }
};

const TOTAL_TIME = {
  TYT: 165 * 60, // 165 dakika
  AYT: 180 * 60  // 180 dakika
};

export default function YKSQuizScreen() {
  const [examType, setExamType] = useState<'TYT' | 'AYT' | null>(null);
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectQuestions, setSubjectQuestions] = useState<{[key: string]: Question[]}>({});
  const [loading, setLoading] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [backendUrl, setBackendUrl] = useState(Constants.expoConfig?.extra?.apiUrl || 'http://192.168.43.128:3000');

  // Backend'ten soru havuzunu yükle
  const loadQuestionsFromBackend = async (type: 'TYT' | 'AYT') => {
    setLoading(true);
    try {
      console.log(`${type} soruları yükleniyor...`);
      
      // Önce CSV'den genel soruları yükle
      const csvResponse = await fetch(`${backendUrl}/api/questions/${type}`);
      let csvQuestions: Question[] = [];
      
      if (csvResponse.ok) {
        const csvData = await csvResponse.json();
        if (csvData.success) {
          csvQuestions = csvData.data.questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: [q.A, q.B, q.C, q.D, q.E].filter(opt => opt && opt.trim()),
            correctAnswer: parseInt(q.answer) - 1,
            explanation: q.explanation,
            subject: q.subject,
            difficulty: q.difficulty?.toLowerCase() as 'easy' | 'medium' | 'hard' || 'medium',
            year: parseInt(q.year) || 2024
          }));
        }
      }
      
      // JSON dosyalarından özel soruları yükle
      const jsonQuestions: Question[] = [];
      const subjects = Object.keys(SUBJECTS[type]);
      
      for (const subject of subjects) {
        try {
          const jsonResponse = await fetch(`${backendUrl}/api/questions/${type}/${subject}`);
          if (jsonResponse.ok) {
            const jsonData = await jsonResponse.json();
            if (jsonData.success) {
              jsonQuestions.push(...jsonData.data.questions);
            }
          }
        } catch (error) {
          console.log(`${type} ${subject} için JSON dosyası bulunamadı, CSV kullanılacak`);
        }
      }
      
      // CSV ve JSON sorularını birleştir
      const allQuestions = [...csvQuestions, ...jsonQuestions];
      
      if (allQuestions.length === 0) {
        throw new Error(`${type} soru havuzu bulunamadı`);
      }
      
      // Soruları derslere göre grupla
      const groupedQuestions: {[key: string]: Question[]} = {};
      
      subjects.forEach(subject => {
        const subjectConfig = (SUBJECTS[type] as any)[subject];
        const subjectQuestions = allQuestions.filter((q: Question) => 
          q.subject.toLowerCase().includes(subject.toLowerCase())
        );
        
        // Eğer JSON'dan gelen sorular varsa onları öncelikle kullan
        const jsonSubjectQuestions = jsonQuestions.filter((q: Question) => 
          q.subject.toLowerCase().includes(subject.toLowerCase())
        );
        
        if (jsonSubjectQuestions.length > 0) {
          groupedQuestions[subject] = jsonSubjectQuestions.slice(0, subjectConfig.questionCount);
        } else {
          groupedQuestions[subject] = subjectQuestions.slice(0, subjectConfig.questionCount);
        }
      });
      
      setSubjectQuestions(groupedQuestions);
      setQuestions(allQuestions);
      console.log(`${allQuestions.length} ${type} sorusu başarıyla yüklendi (CSV: ${csvQuestions.length}, JSON: ${jsonQuestions.length})`);
    } catch (error) {
      console.error('Backend bağlantı hatası:', error);
      Alert.alert('Bağlantı Hatası', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (type: 'TYT' | 'AYT') => {
    setExamType(type);
    loadQuestionsFromBackend(type);
    setQuizStarted(true);
    setCurrentSubject(Object.keys(SUBJECTS[type])[0]);
    setCurrentQuestion(0);
    setTimeLeft(TOTAL_TIME[type]);
    setQuestionStartTime(Date.now());
    setResults([]);
    
    // Sınav oturumu oluştur
    const session: ExamSession = {
      id: Date.now().toString(),
      examType: type,
      startTime: Date.now(),
      totalTime: TOTAL_TIME[type],
      results: [],
      subjects: {},
      totalScore: 0,
      totalNet: 0
    };
    setExamSession(session);
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      Alert.alert('Uyarı', 'Lütfen bir cevap seçin.');
      return;
    }

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQ = getCurrentQuestion();
    
    if (currentQ) {
      const result: QuizResult = {
        questionId: currentQ.id,
        selectedAnswer: selectedAnswer,
        isCorrect: selectedAnswer === currentQ.correctAnswer,
        timeSpent: timeSpent,
        subject: currentSubject
      };

      setResults([...results, result]);
    }

    // Sonraki soruya geç
    const nextQuestionIndex = currentQuestion + 1;
    const currentSubjectQuestions = subjectQuestions[currentSubject] || [];
    
    if (nextQuestionIndex < currentSubjectQuestions.length) {
      // Aynı ders içinde devam et
      setCurrentQuestion(nextQuestionIndex);
    } else {
      // Ders değiştir veya sınavı bitir
      const subjects = Object.keys(SUBJECTS[examType!]);
      const currentSubjectIndex = subjects.indexOf(currentSubject);
      
      if (currentSubjectIndex < subjects.length - 1) {
        // Sonraki derse geç
        const nextSubject = subjects[currentSubjectIndex + 1];
        setCurrentSubject(nextSubject);
        setCurrentQuestion(0);
      } else {
        // Sınav bitti
        completeQuiz();
        return;
      }
    }
    
    setSelectedAnswer(null);
    setQuestionStartTime(Date.now());
  };

  const getCurrentQuestion = (): Question | null => {
    const currentSubjectQuestions = subjectQuestions[currentSubject] || [];
    return currentSubjectQuestions[currentQuestion] || null;
  };

  const completeQuiz = () => {
    setQuizCompleted(true);
    setQuizStarted(false);
    
    // Sonuçları hesapla ve kaydet
    calculateAndSaveResults();
  };

  const calculateAndSaveResults = () => {
    if (!examSession) return;

    const subjects = Object.keys(SUBJECTS[examSession.examType]);
    const calculatedSubjects: {[key: string]: any} = {};
    let totalNet = 0;
    let totalScore = 0;

    subjects.forEach(subject => {
      const subjectResults = results.filter(r => r.subject === subject);
      const correct = subjectResults.filter(r => r.isCorrect).length;
      const total = subjectResults.length;
      const wrong = total - correct;
      const net = Math.max(0, correct - (wrong * 0.25)); // YKS puanlama sistemi
             const subjectConfig = (SUBJECTS[examSession.examType] as any)[subject];
             const score = net * subjectConfig.weight;

      calculatedSubjects[subject] = {
        correct,
        total,
        net: Math.round(net * 100) / 100,
        score: Math.round(score * 100) / 100
      };

      totalNet += net;
      totalScore += score;
    });

    const updatedSession: ExamSession = {
      ...examSession,
      endTime: Date.now(),
      results,
      subjects: calculatedSubjects,
      totalScore: Math.round(totalScore * 100) / 100,
      totalNet: Math.round(totalNet * 100) / 100
    };

    setExamSession(updatedSession);
    saveExamSession(updatedSession);
  };

  const saveExamSession = async (session: ExamSession) => {
    try {
      const existingSessions = await AsyncStorage.getItem('examSessions');
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(session);
      await AsyncStorage.setItem('examSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Sınav sonucu kaydedilemedi:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setTimeLeft(0);
    setResults([]);
    setQuestions([]);
    setSubjectQuestions({});
    setExamType(null);
    setCurrentSubject('');
    setExamSession(null);
  };

  // Timer effect
  useEffect(() => {
    let interval: number;
    
    if (quizStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            // Süre doldu, sınavı bitir
            completeQuiz();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, timeLeft]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quizStarted && !quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>YKS Sınav Sistemi</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.welcomeSection}>
            <Brain size={64} color="#4F46E5" />
            <Text style={styles.welcomeTitle}>Sınav Türünü Seçin</Text>
            <Text style={styles.welcomeSubtitle}>
              Gerçek YKS formatında sınav deneyimi
            </Text>
          </View>

          <View style={styles.examTypeSection}>
            {/* TYT Kartı */}
            <TouchableOpacity
              style={styles.examTypeCard}
              onPress={() => startQuiz('TYT')}
            >
              <View style={styles.cardHeader}>
                <BookOpen size={32} color="#4F46E5" />
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.examTypeTitle}>TYT</Text>
                  <Text style={styles.examTypeSubtitle}>Temel Yeterlilik Testi</Text>
                </View>
              </View>

              <View style={styles.subjectList}>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Türkçe:</Text>
                  <Text style={styles.subjectCount}>40 soru</Text>
                </View>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Sosyal Bilimler Testi:</Text>
                  <Text style={styles.subjectCount}>20 soru</Text>
                </View>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Temel Matematik Testi:</Text>
                  <Text style={styles.subjectCount}>40 soru</Text>
                </View>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Fen Bilimleri Testi:</Text>
                  <Text style={styles.subjectCount}>20 soru</Text>
                </View>
              </View>

              <View style={styles.cardSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Toplam:</Text>
                  <Text style={styles.summaryValue}>120 soru</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Süre:</Text>
                  <Text style={styles.summaryValue}>165 dakika</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* AYT Kartı */}
            <TouchableOpacity
              style={styles.examTypeCard}
              onPress={() => startQuiz('AYT')}
            >
              <View style={styles.cardHeader}>
                <GraduationCap size={32} color="#10B981" />
                <View style={styles.cardTitleContainer}>
                  <Text style={[styles.examTypeTitle, { color: '#10B981' }]}>AYT</Text>
                  <Text style={styles.examTypeSubtitle}>Alan Yeterlilik Testi</Text>
                </View>
              </View>

              <View style={styles.subjectList}>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Türk Dili ve Edebiyatı-Sosyal Bilimler I:</Text>
                  <Text style={styles.subjectCount}>40 soru</Text>
                </View>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Matematik:</Text>
                  <Text style={styles.subjectCount}>40 soru</Text>
                </View>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Fen Bilimleri:</Text>
                  <Text style={styles.subjectCount}>40 soru</Text>
                </View>
                <View style={styles.subjectItem}>
                  <Text style={styles.subjectName}>Sosyal Bilimler II:</Text>
                  <Text style={styles.subjectCount}>40 soru</Text>
                </View>
              </View>

              <View style={styles.cardSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Toplam:</Text>
                  <Text style={styles.summaryValue}>160 soru</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Süre:</Text>
                  <Text style={styles.summaryValue}>180 dakika</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Sınav Kuralları</Text>
            <Text style={styles.infoText}>• Toplam süre: TYT 165dk, AYT 180dk</Text>
            <Text style={styles.infoText}>• Dersler arası geçiş yapabilirsiniz</Text>
            <Text style={styles.infoText}>• YKS puanlama sistemi kullanılır</Text>
            <Text style={styles.infoText}>• Sonuçlar kaydedilir ve analiz edilir</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (quizCompleted && examSession) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetQuiz}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sınav Sonucu</Text>
          <TouchableOpacity onPress={() => setShowStatsModal(true)}>
            <BarChart3 size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.resultSection}>
            <Brain size={64} color="#4F46E5" />
            <Text style={styles.resultTitle}>Sınav Tamamlandı!</Text>
            
            <View style={styles.scoreCard}>
              <Text style={styles.scoreText}>{examSession.totalNet.toFixed(2)}</Text>
              <Text style={styles.scoreLabel}>Net Puan</Text>
              <Text style={styles.totalScoreText}>{examSession.totalScore.toFixed(2)}</Text>
              <Text style={styles.totalScoreLabel}>Toplam Puan</Text>
            </View>

            <View style={styles.subjectResults}>
              {Object.entries(examSession.subjects).map(([subject, data]) => (
                <View key={subject} style={styles.subjectResultItem}>
                  <Text style={styles.subjectResultName}>{subject}</Text>
                  <View style={styles.subjectResultDetails}>
                    <Text style={styles.subjectResultText}>
                      Doğru: {data.correct}/{data.total}
                    </Text>
                    <Text style={styles.subjectResultNet}>
                      Net: {data.net}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={resetQuiz}
          >
            <Text style={styles.retryButtonText}>Yeniden Başla</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* İstatistik Modal */}
        <Modal
          visible={showStatsModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>İstatistikler</Text>
                <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.statsText}>Veli görüntüleme sistemi burada olacak</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  const currentQ = getCurrentQuestion();
  const currentSubjectQuestions = subjectQuestions[currentSubject] || [];
  const subjects = examType ? Object.keys(SUBJECTS[examType]) : [];

  if (!currentQ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetQuiz}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{examType} Sınavı</Text>
          <View style={styles.timerContainer}>
            <Clock size={20} color="#FFFFFF" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Sorular yüklenemedi</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadQuestionsFromBackend(examType!)}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
              <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowExitModal(true)}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {examType} - {currentSubject}
          </Text>
          <View style={styles.headerActions}>
            <View style={styles.timerContainer}>
              <Clock size={20} color="#FFFFFF" />
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
            <TouchableOpacity onPress={() => setShowFinishModal(true)}>
              <Text style={styles.finishButton}>Bitir</Text>
            </TouchableOpacity>
          </View>
        </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Soru {currentQuestion + 1}/{currentSubjectQuestions.length} - {currentSubject}
        </Text>
        <TouchableOpacity
          style={styles.subjectButton}
          onPress={() => setShowSubjectModal(true)}
        >
          <Text style={styles.subjectButtonText}>Ders Değiştir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{currentQ.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQ.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.selectedOption
                ]}
                onPress={() => selectAnswer(index)}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === index && styles.selectedOptionText
                ]}>
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.disabledButton
          ]}
          onPress={nextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestion + 1 === currentSubjectQuestions.length ? 'Sonraki Ders' : 'Sonraki Soru'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Ders Seçimi Modal */}
      <Modal
        visible={showSubjectModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ders Seçin</Text>
              <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectOption,
                    currentSubject === subject && styles.selectedSubjectOption
                  ]}
                  onPress={() => {
                    setCurrentSubject(subject);
                    setCurrentQuestion(0);
                    setSelectedAnswer(null);
                    setShowSubjectModal(false);
                  }}
                >
                  <Text style={[
                    styles.subjectOptionText,
                    currentSubject === subject && styles.selectedSubjectOptionText
                  ]}>
                    {subject}
                  </Text>
                  <Text style={styles.subjectOptionCount}>
                    {subjectQuestions[subject]?.length || 0} soru
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Çıkış Onay Modal */}
      <Modal
        visible={showExitModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sınavdan Çık</Text>
              <TouchableOpacity onPress={() => setShowExitModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Sınavdan çıkmak istediğinizden emin misiniz?
              </Text>
              <Text style={styles.modalWarning}>
                Çıkış yaparsanız sınav geçersiz sayılacak ve tüm veriler kaybolacak.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowExitModal(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.exitButton}
                  onPress={() => {
                    setShowExitModal(false);
                    resetQuiz();
                  }}
                >
                  <Text style={styles.exitButtonText}>Çık</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bitir Onay Modal */}
      <Modal
        visible={showFinishModal}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sınavı Bitir</Text>
              <TouchableOpacity onPress={() => setShowFinishModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Sınavı bitirmek istediğinizden emin misiniz?
              </Text>
              <Text style={styles.modalInfo}>
                Mevcut çözdüğünüz sorular hesaplanacak ve sonuçlarınız gösterilecek.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowFinishModal(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.finishConfirmButton}
                  onPress={() => {
                    setShowFinishModal(false);
                    completeQuiz();
                  }}
                >
                  <Text style={styles.finishConfirmButtonText}>Bitir</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  finishButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  subjectButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subjectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  examTypeSection: {
    marginBottom: 30,
  },
  examTypeCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleContainer: {
    marginLeft: 12,
  },
  examTypeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  examTypeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  subjectList: {
    marginBottom: 20,
  },
  subjectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  subjectCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  cardSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  questionSection: {
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
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
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
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  selectedOptionText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  resultSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4F46E5',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  totalScoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 12,
  },
  totalScoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  subjectResults: {
    width: '100%',
  },
  subjectResultItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subjectResultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectResultText: {
    fontSize: 14,
    color: '#6B7280',
  },
  subjectResultNet: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
  },
  subjectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  selectedSubjectOption: {
    backgroundColor: '#4F46E5',
  },
  subjectOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedSubjectOptionText: {
    color: '#FFFFFF',
  },
  subjectOptionCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalWarning: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalInfo: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  exitButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishConfirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  finishConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});