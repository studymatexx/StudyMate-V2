import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { BookOpen, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react-native';

export default function Welcome() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });
  const fadeAnim = new Animated.Value(1);

  const quotes = [
    "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.",
    "Her konuda uzman olan bir zamanlar acemi idi.",
    "Eğitim, dünyayı değiştirmek için kullanabileceğiniz en güçlü silahtır.",
    "Harika işler yapmanın tek yolu, yaptığınız işi sevmektir.",
    "Öğrenme asla durmamalı, çünkü hayat da durmaz.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = () => {
    if (isLogin) {
      // Giriş yapma işlemi
      if (!formData.email || !formData.password) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
        return;
      }
      // Burada API çağrısı yapılacak
      console.log('Giriş yapılıyor:', { email: formData.email, password: formData.password });
    } else {
      // Üye olma işlemi
      if (!formData.email || !formData.password || !formData.name || !formData.confirmPassword) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor.');
        return;
      }
      // Burada API çağrısı yapılacak
      console.log('Üye olunuyor:', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <BookOpen size={64} color="#4F46E5" />
          </View>
          <Text style={styles.appName}>StudyMate</Text>
          <Text style={styles.tagline}>Yapay Zeka Destekli Çalışma Arkadaşın</Text>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.timeLabel}>Şu Anki Saat</Text>
          <Text style={styles.timeText}>{getCurrentTime()}</Text>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>

        <Animated.View style={[styles.quoteSection, { opacity: fadeAnim }]}>
          <Text style={styles.quoteText}>{quotes[currentQuote]}</Text>
        </Animated.View>

        <View style={styles.authSection}>
          <View style={styles.authToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                Üye Ol
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Ad Soyad</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Adınızı ve soyadınızı girin"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="E-posta adresinizi girin"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  placeholder="Şifrenizi girin"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={true}
                />
              </View>
            )}

            <Link href="/(tabs)" asChild>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                {isLogin ? (
                  <LogIn size={24} color="#FFFFFF" />
                ) : (
                  <UserPlus size={24} color="#FFFFFF" />
                )}
                <Text style={styles.submitText}>
                  {isLogin ? 'Giriş Yap' : 'Üye Ol'}
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  timeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  quoteSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  authSection: {
    width: '100%',
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4F46E5',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});