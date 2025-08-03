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
import { 
  BookOpen, 
  User, 
  Calendar, 
  Clock, 
  Target, 
  CheckSquare, 
  Brain, 
  BarChart3,
  Timer,
  Lightbulb,
  Plus
} from 'lucide-react-native';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppRoute = '/(tabs)/schedule' | '/(tabs)/focus' | '/(tabs)/gpa' | '/(tabs)/todos' | '/(tabs)/quiz' | '/(tabs)/statistics' | '/profile';

export default function Dashboard() {
  const [userName, setUserName] = useState('Öğrenci');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const motivationalQuotes = [
    "Başarı, her gün küçük adımlar atmaktan gelir. Bugün de o adımlardan birini at!",
    "Çalışmak, geleceğin en iyi yatırımıdır.",
    "Her başarısızlık, başarıya giden yolda bir öğrenme fırsatıdır.",
    "Hedeflerinize ulaşmak için sabırlı olun, ama asla vazgeçmeyin.",
    "Bugün yapabileceğinizi yarına bırakmayın."
  ];

  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  const mainFeatures = [
    {
      id: '1',
      title: 'Program',
      subtitle: 'Ders programını planla',
      icon: <Calendar size={24} color="#10B981" />,
      color: '#10B981',
      route: '/(tabs)/schedule' as AppRoute
    },
    {
      id: '2',
      title: 'Odaklan',
      subtitle: 'Pomodoro timer ile çalış',
      icon: <Clock size={24} color="#F59E0B" />,
      color: '#F59E0B',
      route: '/(tabs)/focus' as AppRoute
    },
    {
      id: '3',
      title: 'GPA Takibi',
      subtitle: 'Not ortalamanı izle',
      icon: <Target size={24} color="#8B5CF6" />,
      color: '#8B5CF6',
      route: '/(tabs)/gpa' as AppRoute
    },
    {
      id: '4',
      title: 'Görevler',
      subtitle: 'Yapılacaklar listesi',
      icon: <CheckSquare size={24} color="#EF4444" />,
      color: '#EF4444',
      route: '/(tabs)/todos' as AppRoute
    },
    {
      id: '5',
      title: 'YKS Quiz',
      subtitle: 'Sınav simülasyonu',
      icon: <Brain size={24} color="#06B6D4" />,
      color: '#06B6D4',
      route: '/(tabs)/quiz' as AppRoute
    },
    {
      id: '6',
      title: 'İstatistikler',
      subtitle: 'Detaylı analiz',
      icon: <BarChart3 size={24} color="#EC4899" />,
      color: '#EC4899',
      route: '/(tabs)/statistics' as AppRoute
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <BookOpen size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>StudyMate</Text>
        </View>
        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.profileButton}>
            <User size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hoş Geldin Kartı */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Merhaba, {userName}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Bugün çalışmaya hazır mısın? StudyMate ile hedeflerine ulaşmanın zamanı!
          </Text>
        </View>

        {/* Günün Motivasyonu */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationHeader}>
            <Lightbulb size={24} color="#F59E0B" />
            <Text style={styles.motivationTitle}>Günün Motivasyonu</Text>
          </View>
          <Text style={styles.motivationText}>
            "{currentQuote}"
          </Text>
        </View>

        {/* Ana Özellikler */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Ana Özellikler</Text>
          <View style={styles.featuresGrid}>
            {mainFeatures.map(feature => (
              <Link key={feature.id} href={feature.route} asChild>
                <TouchableOpacity style={styles.featureCard}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                    {feature.icon}
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Hızlı Aksiyonlar */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Hızlı Aksiyonlar</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => Alert.alert('Hızlı Başlat', 'Odaklanma modu başlatılıyor...')}
            >
              <Timer size={20} color="#4F46E5" />
              <Text style={styles.actionButtonText}>Hızlı Çalışma</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => Alert.alert('Görev Ekle', 'Yeni görev ekleme...')}
            >
              <Plus size={20} color="#10B981" />
              <Text style={styles.actionButtonText}>Görev Ekle</Text>
            </TouchableOpacity>
          </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  motivationCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  featuresSection: {
    marginTop: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: '#FFFFFF',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureSubtitle: {
    color: '#6B7280',
    fontSize: 12,
  },
  actionSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});