import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { ArrowLeft, Play, Pause, RotateCcw, Camera, Image as ImageIcon, Send, X } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

interface FocusSession {
  id: string;
  duration: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  isPaused: boolean;
  pausedTime: number;
}

export default function FocusScreen() {
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [customDuration, setCustomDuration] = useState(60);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [sendingQuestion, setSendingQuestion] = useState(false);
  const [backendUrl, setBackendUrl] = useState(Constants.expoConfig?.extra?.apiUrl || 'http://192.168.43.128:3000');
  
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const durations = [
    { value: 60, label: '1 Saat' },
    { value: 120, label: '2 Saat' },
    { value: 180, label: '3 Saat' },
    { value: 0, label: 'Özel' }
  ];

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Süre doldu
            handleSessionComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setIsActive(true);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  };

  const pauseSession = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now();
  };

  const resumeSession = () => {
    setIsPaused(false);
    if (pausedTimeRef.current > 0) {
      const pauseDuration = Date.now() - pausedTimeRef.current;
      setTimeLeft(prev => prev - Math.floor(pauseDuration / 1000));
    }
  };

  const resetSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    setIsPaused(false);
    Alert.alert(
      'Odak Seansı Tamamlandı!',
      'Tebrikler! Odak seansınızı başarıyla tamamladınız.',
      [{ text: 'Tamam', onPress: () => resetSession() }]
    );
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Kamera izni olmadan fotoğraf çekemezsiniz.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setQuestionImage(result.assets[0].base64 || null);
        setShowQuestionModal(true);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setQuestionImage(result.assets[0].base64 || null);
        setShowQuestionModal(true);
      }
    } catch (error) {
      console.error('Galeri hatası:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    }
  };

  const sendQuestionToAI = async () => {
    if (!questionImage && !questionText.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir soru fotoğrafı çekin veya soru metni yazın.');
      return;
    }

    setSendingQuestion(true);

    try {
      // AsyncStorage'a çözüm verilerini kaydet
      const solutionData = {
        imageBase64: questionImage,
        questionText: questionText,
        timestamp: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('lastSolution', JSON.stringify(solutionData));
      
      // Çözüm ekranına yönlendir
      setShowQuestionModal(false);
      setQuestionImage(null);
      setQuestionText('');
      router.push('/solution');
      
    } catch (error) {
      console.error('Veri kaydedilirken hata:', error);
      Alert.alert('Hata', 'Veri kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSendingQuestion(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Odak Modu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Timer Bölümü */}
        <View style={styles.timerSection}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerLabel}>Kalan Süre</Text>
        </View>

        {/* Kontrol Butonları */}
        <View style={styles.controlsSection}>
          {!isActive ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={startSession}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Başlat</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              {isPaused ? (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={resumeSession}
                >
                  <Play size={24} color="#FFFFFF" />
                  <Text style={styles.resumeButtonText}>Devam Et</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={pauseSession}
                >
                  <Pause size={24} color="#FFFFFF" />
                  <Text style={styles.pauseButtonText}>Duraklat</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetSession}
              >
                <RotateCcw size={24} color="#4F46E5" />
                <Text style={styles.resetButtonText}>Sıfırla</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Süre Seçimi */}
        {!isActive && (
          <View style={styles.durationSection}>
            <Text style={styles.sectionTitle}>Süre Seçin</Text>
            <View style={styles.durationButtons}>
              {durations.map((duration) => (
                <TouchableOpacity
                  key={duration.value}
                  style={[
                    styles.durationButton,
                    selectedDuration === duration.value && styles.selectedDurationButton
                  ]}
                  onPress={() => {
                    if (duration.value === 0) {
                      setShowCustomModal(true);
                    } else {
                      setSelectedDuration(duration.value);
                      setTimeLeft(duration.value * 60);
                    }
                  }}
                >
                  <Text style={[
                    styles.durationButtonText,
                    selectedDuration === duration.value && styles.selectedDurationButtonText
                  ]}>
                    {duration.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* AI Koç Bölümü */}
        {isActive && (
          <View style={styles.aiCoachSection}>
            <Text style={styles.sectionTitle}>AI Koç</Text>
            <Text style={styles.aiCoachDescription}>
              Takıldığınız sorunun fotoğrafını çekin veya soru metni yazın, AI koçunuz size yardım etsin!
            </Text>
            
            <View style={styles.questionButtons}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={takePhoto}
              >
                <Camera size={24} color="#FFFFFF" />
                <Text style={styles.cameraButtonText}>Fotoğraf Çek</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <ImageIcon size={24} color="#4F46E5" />
                <Text style={styles.galleryButtonText}>Galeriden Seç</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Bugünkü İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Tamamlanan Seans</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0 dk</Text>
              <Text style={styles.statLabel}>Toplam Odak Süresi</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Soru Gönderme Modal */}
      <Modal
        visible={showQuestionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>AI Koça Soru Gönder</Text>
              <TouchableOpacity
                onPress={() => setShowQuestionModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {questionImage && (
                <View style={styles.imagePreview}>
                  <Text style={styles.imagePreviewText}>Fotoğraf seçildi ✓</Text>
                </View>
              )}

              <Text style={styles.inputLabel}>Soru Açıklaması (İsteğe bağlı)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Sorunuzu buraya yazabilirsiniz..."
                value={questionText}
                onChangeText={setQuestionText}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!questionImage && !questionText.trim()) && styles.disabledButton
                ]}
                onPress={sendQuestionToAI}
                disabled={!questionImage && !questionText.trim() || sendingQuestion}
              >
                {sendingQuestion ? (
                  <Text style={styles.sendButtonText}>Gönderiliyor...</Text>
                ) : (
                  <>
                    <Send size={20} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>AI Koça Gönder</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Özel Süre Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Özel Süre Belirle</Text>
              <TouchableOpacity
                onPress={() => setShowCustomModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Süre (dakika)</Text>
              <TextInput
                style={styles.textInput}
                value={customDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setCustomDuration(value);
                }}
                placeholder="60"
                keyboardType="numeric"
                autoFocus
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCustomModal(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    if (customDuration > 0) {
                      setSelectedDuration(customDuration);
                      setTimeLeft(customDuration * 60);
                      setShowCustomModal(false);
                    }
                  }}
                >
                  <Text style={styles.confirmButtonText}>Belirle</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  timerSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '800',
    color: '#4F46E5',
    fontFamily: 'monospace',
  },
  timerLabel: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 8,
  },
  controlsSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 16,
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resumeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  resetButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '700',
  },
  durationSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedDurationButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  durationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedDurationButtonText: {
    color: '#FFFFFF',
  },
  aiCoachSection: {
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
  aiCoachDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  questionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  galleryButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  statsSection: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  imagePreview: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreviewText: {
    color: '#0369A1',
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});