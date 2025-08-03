import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ArrowLeft, Volume2, CircleAlert as AlertCircle, MessageCircle, Share, RefreshCw } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SolutionData {
  solutionId: string;
  problem: string;
  problemType: string;
  solution: string;
  steps: Array<{
    step: number;
    description: string;
    equation: string;
    result: string;
    reasoning: string;
  }>;
  explanation: string;
  formula: string;
  finalAnswer: string;
  verification: string;
  commonMistakes: string[];
  similarProblems: string[];
  confidence: number;
  hasImage: boolean;
  rawResponse?: string;
}

export default function SolutionScreen() {
  const [showError, setShowError] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [solutionData, setSolutionData] = useState<SolutionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendUrl, setBackendUrl] = useState(Constants.expoConfig?.extra?.apiUrl || 'http://192.168.43.128:3000');

  useEffect(() => {
    // AsyncStorage'dan çözüm verilerini al
    loadSolutionData();
  }, []);

  const loadSolutionData = async () => {
    try {
      const lastSolution = await AsyncStorage.getItem('lastSolution');
      if (lastSolution) {
        const solutionInfo = JSON.parse(lastSolution);
        handleAISolution(solutionInfo);
      } else {
        setError('Çözüm verisi bulunamadı');
      }
    } catch (error) {
      setError('Veri yüklenirken hata oluştu');
    }
  };

  const handleAISolution = async (solutionInfo: any) => {
    setLoading(true);
    setError(null);

    try {
      console.log('AI çözümü isteniyor...');
      const response = await fetch(`${backendUrl}/api/ai/solve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: solutionInfo.base64Image,
          subject: 'TYT Matematik',
          difficulty: 'TYT seviyesi',
          language: 'tr'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSolutionData(data.data);
        console.log('AI çözümü başarıyla alındı');
      } else {
        setError(data.error || 'AI çözümü alınamadı');
        console.error('AI çözüm hatası:', data.error);
      }
    } catch (error) {
      console.error('Backend bağlantı hatası:', error);
      setError(
        `Sunucuya bağlanılamadı.\n\nHata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}\n\nLütfen:\n1. Backend sunucusunun çalıştığından emin olun\n2. İnternet bağlantınızı kontrol edin\n3. Tekrar deneyin`
      );
    } finally {
      setLoading(false);
    }
  };

  const retrySolution = async () => {
    try {
      const lastSolution = await AsyncStorage.getItem('lastSolution');
      if (lastSolution) {
        const solutionInfo = JSON.parse(lastSolution);
        await handleAISolution(solutionInfo);
      }
    } catch (error) {
      setError('Veri yüklenirken hata oluştu');
    }
  };

  const playAudio = () => {
    setIsPlayingAudio(true);
    // Simulate audio playback
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  const handleErrorAnalysis = () => {
    setShowError(true);
  };

  const handleAskAgain = () => {
    // Odak moduna geri dön
    router.push('/(tabs)/focus');
  };

  const shareSolution = () => {
    if (solutionData) {
      const shareText = `StudyMate AI Çözümü:\n\nSoru: ${solutionData.problem}\n\nÇözüm: ${solutionData.explanation}\n\nSonuç: ${solutionData.finalAnswer}`;
      // Burada paylaşım fonksiyonu eklenebilir
      Alert.alert('Paylaş', shareText);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)/focus" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>AI Çözümü</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>AI çözümü hazırlanıyor...</Text>
          <Text style={styles.loadingSubtext}>Bu işlem birkaç saniye sürebilir</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)/focus" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>AI Çözümü</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Çözüm Alınamadı</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.errorButtons}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retrySolution}
            >
              <RefreshCw size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleAskAgain}
            >
              <Text style={styles.backButtonText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!solutionData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)/focus" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>AI Çözümü</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Çözüm verisi bulunamadı</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleAskAgain}
          >
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)/focus" asChild>
          <TouchableOpacity>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>AI Çözümü</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={playAudio}>
            <Volume2
              size={24}
              color={isPlayingAudio ? "#10B981" : "#FFFFFF"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareSolution}>
            <Share size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Soru Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Soru</Text>
          <Text style={styles.problemText}>{solutionData.problem}</Text>
          
          <View style={styles.problemInfo}>
            <Text style={styles.problemType}>Tip: {solutionData.problemType}</Text>
            <Text style={styles.confidenceText}>
              Güven: %{(solutionData.confidence * 100).toFixed(0)}
            </Text>
          </View>
        </View>

        {/* Çözüm Adımları */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Çözüm Adımları</Text>
          {solutionData.steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>Adım {step.step}</Text>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              {step.equation && (
                <Text style={styles.stepEquation}>{step.equation}</Text>
              )}
              {step.result && (
                <Text style={styles.stepResult}>Sonuç: {step.result}</Text>
              )}
              <Text style={styles.stepReasoning}>{step.reasoning}</Text>
            </View>
          ))}
        </View>

        {/* Final Sonuç */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Final Sonuç</Text>
          <View style={styles.finalAnswerContainer}>
            <Text style={styles.finalAnswerText}>{solutionData.finalAnswer}</Text>
          </View>
          <Text style={styles.explanationText}>{solutionData.explanation}</Text>
        </View>

        {/* Kullanılan Formül */}
        {solutionData.formula && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📐 Kullanılan Formül</Text>
            <Text style={styles.formulaText}>{solutionData.formula}</Text>
          </View>
        )}

        {/* Doğrulama */}
        {solutionData.verification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Doğrulama</Text>
            <Text style={styles.verificationText}>{solutionData.verification}</Text>
          </View>
        )}

        {/* Yaygın Hatalar */}
        {solutionData.commonMistakes && solutionData.commonMistakes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Yaygın Hatalar</Text>
            {solutionData.commonMistakes.map((mistake, index) => (
              <Text key={index} style={styles.mistakeText}>• {mistake}</Text>
            ))}
          </View>
        )}

        {/* Benzer Problemler */}
        {solutionData.similarProblems && solutionData.similarProblems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Benzer Problemler</Text>
            {solutionData.similarProblems.map((problem, index) => (
              <Text key={index} style={styles.similarProblemText}>• {problem}</Text>
            ))}
          </View>
        )}

        {/* Aksiyon Butonları */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={retrySolution}
          >
            <RefreshCw size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tekrar Çöz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newQuestionButton}
            onPress={handleAskAgain}
          >
            <Text style={styles.newQuestionButtonText}>Yeni Soru</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  problemText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  problemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  problemType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  stepContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  stepEquation: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepResult: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 8,
  },
  stepReasoning: {
    fontSize: 14,
    color: '#0C4A6E',
    fontStyle: 'italic',
  },
  finalAnswerContainer: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  finalAnswerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#166534',
    fontFamily: 'monospace',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  formulaText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#5B21B6',
  },
  verificationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  mistakeText: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
  },
  similarProblemText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newQuestionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  newQuestionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#7F1D1D',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
});