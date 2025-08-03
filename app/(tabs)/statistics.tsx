import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { ChartBar as BarChart3, Clock, BookOpen, Target, TrendingUp, Brain } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function StudyStatistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [studyStats, setStudyStats] = useState<any>(null);
  const [examStats, setExamStats] = useState<any>(null);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AsyncStorage'dan verileri yükle
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      // Görevler verilerini yükle
      const todosData = await AsyncStorage.getItem('todos');
      const todos = todosData ? JSON.parse(todosData) : [];

      // Odaklanma seansları verilerini yükle
      const focusSessionsData = await AsyncStorage.getItem('focusSessions');
      const focusSessions = focusSessionsData ? JSON.parse(focusSessionsData) : [];

      // Sınav sonuçları verilerini yükle
      const examSessionsData = await AsyncStorage.getItem('examSessions');
      const examSessions = examSessionsData ? JSON.parse(examSessionsData) : [];

      // İstatistikleri hesapla
      const stats = calculateStudyStatistics(todos, focusSessions);
      const examStats = calculateExamStatistics(examSessions);

      setStudyStats(stats);
      setExamStats(examStats);
      setFocusSessions(focusSessions);
      setLoading(false);
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      // Hata durumunda varsayılan değerler
      const defaultStats = {
        studyData: [],
        totalHours: 0,
        totalSessions: 0,
        avgScore: 0,
        completedTodos: 0,
        totalTodos: 0,
        activeCourses: 0,
      };
      const defaultExamStats = {
        totalExams: 0,
        avgScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        examTypes: { TYT: 0, AYT: 0 }
      };
      setStudyStats(defaultStats);
      setExamStats(defaultExamStats);
      setLoading(false);
    }
  };

  const calculateStudyStatistics = (todos: any[], focusSessions: any[]) => {
    // Ders bazında grupla
    const subjectStats: { [key: string]: any } = {};

    // Görevlerden ders istatistikleri
    todos.forEach(todo => {
      const subject = todo.subject || todo.courseRelated || 'Genel';
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          completedTasks: 0,
          totalTasks: 0,
          focusTime: 0,
          sessions: 0,
          color: getSubjectColor(subject)
        };
      }
      subjectStats[subject].totalTasks++;
      if (todo.completed) {
        subjectStats[subject].completedTasks++;
      }
    });

    // Odaklanma seanslarından ders istatistikleri
    focusSessions.forEach(session => {
      const subject = session.subject || 'Genel';
      if (session.completed) {
        if (!subjectStats[subject]) {
          subjectStats[subject] = {
            completedTasks: 0,
            totalTasks: 0,
            focusTime: 0,
            sessions: 0,
            color: getSubjectColor(subject)
          };
        }
        subjectStats[subject].focusTime += session.duration || 0;
        subjectStats[subject].sessions++;
      }
    });

    // İstatistikleri hesapla
    const studyData = Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      hoursStudied: data.focusTime / 60,
      color: data.color,
      sessions: data.sessions,
      avgScore: data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0,
      completedTasks: data.completedTasks,
      totalTasks: data.totalTasks,
    }));

    const totalHours = studyData.reduce((sum, item) => sum + item.hoursStudied, 0);
    const totalSessions = studyData.reduce((sum, item) => sum + item.sessions, 0);
    const avgScore = studyData.length > 0 ? studyData.reduce((sum, item) => sum + item.avgScore, 0) / studyData.length : 0;
    const completedTodos = todos.filter(todo => todo.completed).length;
    const totalTodos = todos.length;

    return {
      studyData,
      totalHours,
      totalSessions,
      avgScore,
      completedTodos,
      totalTodos,
      activeCourses: studyData.length,
    };
  };

  const calculateExamStatistics = (examSessions: any[]) => {
    if (!examSessions || examSessions.length === 0) {
      return {
        totalExams: 0,
        avgScore: 0,
        bestScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        examTypes: { TYT: 0, AYT: 0 }
      };
    }

    const totalExams = examSessions.length;
    const totalScore = examSessions.reduce((sum, exam) => sum + (exam.totalScore || 0), 0);
    const avgScore = totalScore / totalExams;
    const bestScore = Math.max(...examSessions.map(exam => exam.totalScore || 0));
    
    const totalQuestions = examSessions.reduce((sum, exam) => 
      sum + (exam.results ? exam.results.length : 0), 0);
    const correctAnswers = examSessions.reduce((sum, exam) => 
      sum + (exam.results ? exam.results.filter((r: any) => r.isCorrect).length : 0), 0);

    const examTypes = examSessions.reduce((acc, exam) => {
      const examType = exam.examType || 'TYT';
      acc[examType] = (acc[examType] || 0) + 1;
      return acc;
    }, {} as any);

    return {
      totalExams,
      avgScore,
      bestScore,
      totalQuestions,
      correctAnswers,
      examTypes
    };
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Matematik': '#3B82F6',
      'Fizik': '#10B981',
      'Kimya': '#F59E0B',
      'Biyoloji': '#8B5CF6',
      'Türkçe': '#EF4444',
      'Tarih': '#06B6D4',
      'Coğrafya': '#EC4899',
      'Felsefe': '#84CC16'
    };
    return colors[subject as keyof typeof colors] || '#6B7280';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <BarChart3 size={28} color="#FFFFFF" />
          <Text style={styles.headerTitle}>Çalışma İstatistikleri</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = studyStats || {
    studyData: [],
    totalHours: 0,
    totalSessions: 0,
    avgScore: 0,
    completedTodos: 0,
    totalTodos: 0,
    activeCourses: 0,
  };

  // Haftalık veri hesaplama
  const getWeeklyData = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Pazartesi

    return days.map((day: string, index: number) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      // Bu gün için odaklanma süresini hesapla
      const dayFocusSessions = focusSessions?.filter((session: any) => {
        const sessionDate = new Date(session.startTime || Date.now());
        return sessionDate.toDateString() === date.toDateString() && session.completed;
      }) || [];

      const dayHours = dayFocusSessions.reduce((sum: number, session: any) => 
        sum + ((session.duration || 0) / 60), 0);

      return { day, hours: dayHours };
    });
  };

  const weeklyData = getWeeklyData();

  const maxHours = Math.max(...weeklyData.map(item => item.hours));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BarChart3 size={28} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Çalışma İstatistikleri</Text>
      </View>

      <View style={styles.periodSelector}>
        {[
          { key: 'daily', label: 'Günlük' },
          { key: 'weekly', label: 'Haftalık' },
          { key: 'monthly', label: 'Aylık' }
        ].map(period => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.selectedPeriodText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={styles.statCard}>
            <Clock size={24} color="#4F46E5" />
            <Text style={styles.statNumber}>{stats.totalHours.toFixed(1)}h</Text>
            <Text style={styles.statLabel}>Toplam Çalışma Süresi</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color="#10B981" />
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Odaklanma Oturumları</Text>
          </View>
        </View>

        <View style={styles.overviewGrid}>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.avgScore.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Ortalama Performans</Text>
          </View>
          <View style={styles.statCard}>
            <BookOpen size={24} color="#8B5CF6" />
            <Text style={styles.statNumber}>{stats.activeCourses}</Text>
            <Text style={styles.statLabel}>Aktif Dersler</Text>
          </View>
        </View>

        {/* Weekly Hours Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Haftalık Çalışma Saatleri</Text>
          <View style={styles.barChart}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.hours / maxHours) * 100}%`,
                        backgroundColor: '#4F46E5',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{item.day}</Text>
                <Text style={styles.hoursLabel}>{item.hours}h</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sınav İstatistikleri */}
        {examStats && examStats.totalExams > 0 && (
          <View style={styles.examCard}>
            <View style={styles.examHeader}>
              <Brain size={24} color="#4F46E5" />
              <Text style={styles.examTitle}>Sınav İstatistikleri</Text>
            </View>
            
            <View style={styles.examStatsGrid}>
              <View style={styles.examStatItem}>
                <Text style={styles.examStatNumber}>{examStats.totalExams}</Text>
                <Text style={styles.examStatLabel}>Toplam Sınav</Text>
              </View>
              <View style={styles.examStatItem}>
                <Text style={styles.examStatNumber}>{examStats.avgScore.toFixed(1)}</Text>
                <Text style={styles.examStatLabel}>Ortalama Puan</Text>
              </View>
              <View style={styles.examStatItem}>
                <Text style={styles.examStatNumber}>{examStats.bestScore.toFixed(1)}</Text>
                <Text style={styles.examStatLabel}>En Yüksek Puan</Text>
              </View>
              <View style={styles.examStatItem}>
                <Text style={styles.examStatNumber}>
                  {examStats.totalQuestions > 0 ? 
                    ((examStats.correctAnswers / examStats.totalQuestions) * 100).toFixed(1) : 0}%
                </Text>
                <Text style={styles.examStatLabel}>Doğruluk Oranı</Text>
              </View>
            </View>

            <View style={styles.examTypeBreakdown}>
              <Text style={styles.examTypeTitle}>Sınav Türü Dağılımı</Text>
              <View style={styles.examTypeRow}>
                <Text style={styles.examTypeLabel}>TYT:</Text>
                <Text style={styles.examTypeCount}>{examStats.examTypes.TYT || 0} sınav</Text>
              </View>
              <View style={styles.examTypeRow}>
                <Text style={styles.examTypeLabel}>AYT:</Text>
                <Text style={styles.examTypeCount}>{examStats.examTypes.AYT || 0} sınav</Text>
              </View>
            </View>
          </View>
        )}

        {/* Subject Breakdown */}
        <View style={styles.subjectCard}>
          <Text style={styles.subjectTitle}>Ders Dağılımı</Text>
          {stats.studyData.map((subject: any, index: number) => {
            const percentage = stats.totalHours > 0 ? (subject.hoursStudied / stats.totalHours) * 100 : 0;
            return (
              <View key={index} style={styles.subjectRow}>
                <View style={styles.subjectInfo}>
                  <View
                    style={[styles.subjectColor, { backgroundColor: subject.color }]}
                  />
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                </View>
                <View style={styles.subjectStats}>
                  <Text style={styles.subjectHours}>{subject.hoursStudied.toFixed(1)}h</Text>
                  <Text style={styles.subjectPercentage}>({percentage.toFixed(1)}%)</Text>
                </View>
                <View style={styles.taskProgress}>
                  <Text style={styles.taskProgressText}>
                    {subject.completedTasks}/{subject.totalTasks} görev
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${subject.avgScore}%`,
                          backgroundColor: subject.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Performance Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Performans Öngörüleri</Text>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Tamamlanan Görevler:</Text>
            <Text style={styles.insightValue}>{stats.completedTodos}/{stats.totalTodos}</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>En Güçlü Ders:</Text>
            <Text style={styles.insightValue}>
              {stats.studyData.length > 0 ? 
                stats.studyData.reduce((best: any, current: any) => 
                  current.avgScore > best.avgScore ? current : best
                ).subject + ' (' + stats.studyData.reduce((best: any, current: any) => 
                  current.avgScore > best.avgScore ? current : best
                ).avgScore.toFixed(0) + '%)' : 'Veri yok'}
            </Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Dikkat Gerektiren:</Text>
            <Text style={styles.insightValue}>
              {stats.studyData.length > 0 ? 
                stats.studyData.reduce((worst: any, current: any) => 
                  current.avgScore < worst.avgScore ? current : worst
                ).subject + ' (' + stats.studyData.reduce((worst: any, current: any) => 
                  current.avgScore < worst.avgScore ? current : worst
                ).avgScore.toFixed(0) + '%)' : 'Veri yok'}
            </Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>En Çok Çalışılan:</Text>
            <Text style={styles.insightValue}>
              {stats.studyData.length > 0 ? 
                stats.studyData.reduce((most: any, current: any) => 
                  current.hoursStudied > most.hoursStudied ? current : most
                ).subject + ' (' + stats.studyData.reduce((most: any, current: any) => 
                  current.hoursStudied > most.hoursStudied ? current : most
                ).hoursStudied.toFixed(1) + 's)' : 'Veri yok'}
            </Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Ortalama Oturum Süresi:</Text>
            <Text style={styles.insightValue}>
              {stats.totalSessions > 0 ? Math.round((stats.totalHours * 60) / stats.totalSessions) : 0} dakika
            </Text>
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
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#4F46E5',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    height: 80,
    width: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  hoursLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  subjectRow: {
    marginBottom: 16,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subjectHours: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  subjectPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskProgress: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  taskProgressText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
  },
  progressBackground: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  examStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  examStatItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  examStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  examStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  examTypeBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  examTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  examTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examTypeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  examTypeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});