import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Target, Plus, Trash2, Calculator } from 'lucide-react-native';

interface Course {
  id: string;
  name: string;
  credits: number;
  midtermGrade: number;
  finalGrade: number;
  midtermWeight: number;
  finalWeight: number;
}

interface PreUniCourse {
  id: string;
  name: string;
  term1Grade: number;
  term2Grade: number;
}

export default function GPACalculator() {
  const [mode, setMode] = useState<'goal' | 'calculate'>('calculate');
  const [calculationType, setCalculationType] = useState<'university' | 'preuni'>('university');
  const [goalGPA, setGoalGPA] = useState('3.5');
  const [currentGPA, setCurrentGPA] = useState(0);
  
  // University courses
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      name: 'Matematik I',
      credits: 4,
      midtermGrade: 85,
      finalGrade: 90,
      midtermWeight: 40,
      finalWeight: 60,
    },
  ]);

  // Pre-university courses
  const [preUniCourses, setPreUniCourses] = useState<PreUniCourse[]>([
    {
      id: '1',
      name: 'Matematik',
      term1Grade: 85,
      term2Grade: 90,
    },
  ]);

  const calculateUniversityGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const courseGrade = 
        (course.midtermGrade * course.midtermWeight + 
         course.finalGrade * course.finalWeight) / 100;
      totalPoints += courseGrade * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits) / 25 : 0; // Convert to 4.0 scale
  };

  const calculatePreUniGPA = () => {
    if (preUniCourses.length === 0) return 0;
    
    const totalAverage = preUniCourses.reduce((sum, course) => {
      return sum + (course.term1Grade + course.term2Grade) / 2;
    }, 0);

    return totalAverage / preUniCourses.length;
  };

  const addCourse = () => {
    if (calculationType === 'university') {
      setCourses([
        ...courses,
        {
          id: Date.now().toString(),
          name: '',
          credits: 3,
          midtermGrade: 0,
          finalGrade: 0,
          midtermWeight: 40,
          finalWeight: 60,
        },
      ]);
    } else {
      setPreUniCourses([
        ...preUniCourses,
        {
          id: Date.now().toString(),
          name: '',
          term1Grade: 0,
          term2Grade: 0,
        },
      ]);
    }
  };

  const removeCourse = (id: string) => {
    if (calculationType === 'university') {
      setCourses(courses.filter(course => course.id !== id));
    } else {
      setPreUniCourses(preUniCourses.filter(course => course.id !== id));
    }
  };

  const updateCourse = (id: string, field: string, value: any) => {
    if (calculationType === 'university') {
      setCourses(courses.map(course =>
        course.id === id ? { ...course, [field]: value } : course
      ));
    } else {
      setPreUniCourses(preUniCourses.map(course =>
        course.id === id ? { ...course, [field]: value } : course
      ));
    }
  };

  const getCurrentGPA = () => {
    return calculationType === 'university' 
      ? calculateUniversityGPA() 
      : calculatePreUniGPA();
  };

  const getProgressPercentage = () => {
    const current = getCurrentGPA();
    const goal = parseFloat(goalGPA);
    const maxGPA = calculationType === 'university' ? 4.0 : 100;
    
    if (calculationType === 'university') {
      return Math.min((current / goal) * 100, 100);
    } else {
      return Math.min((current / goal) * 100, 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Target size={28} color="#FFFFFF" />
        <Text style={styles.headerTitle}>Not Ortalaması Hesaplayıcı</Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'calculate' && styles.selectedMode]}
          onPress={() => setMode('calculate')}
        >
          <Text style={[styles.modeText, mode === 'calculate' && styles.selectedModeText]}>
            Not Ortalaması Hesapla
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'goal' && styles.selectedMode]}
          onPress={() => setMode('goal')}
        >
          <Text style={[styles.modeText, mode === 'goal' && styles.selectedModeText]}>
            Hedef Belirle
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'calculate' && (
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, calculationType === 'university' && styles.selectedType]}
            onPress={() => setCalculationType('university')}
          >
            <Text style={[styles.typeText, calculationType === 'university' && styles.selectedTypeText]}>
              Üniversite
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, calculationType === 'preuni' && styles.selectedType]}
            onPress={() => setCalculationType('preuni')}
          >
            <Text style={[styles.typeText, calculationType === 'preuni' && styles.selectedTypeText]}>
              Lise
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {mode === 'goal' ? (
          <View style={styles.goalSection}>
            <Text style={styles.sectionTitle}>Not Ortalaması Hedefini Belirle</Text>
            <TextInput
              style={styles.goalInput}
              value={goalGPA}
              onChangeText={setGoalGPA}
              placeholder="Hedef Not Ortalaması"
              keyboardType="decimal-pad"
            />
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Hedefe İlerleme</Text>
              <Text style={styles.progressPercentage}>
                {getProgressPercentage().toFixed(1)}%
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(getProgressPercentage(), 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.currentGPAText}>
                Mevcut: {getCurrentGPA().toFixed(2)} / Hedef: {goalGPA}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.calculateSection}>
            <View style={styles.resultCard}>
              <Calculator size={24} color="#4F46E5" />
              <Text style={styles.gpaResult}>
                {calculationType === 'university' 
                  ? calculateUniversityGPA().toFixed(2)
                  : calculatePreUniGPA().toFixed(1)
                }
              </Text>
              <Text style={styles.gpaScale}>
                {calculationType === 'university' ? '/ 4.0' : '/ 100'}
              </Text>
            </View>

            <View style={styles.coursesHeader}>
              <Text style={styles.coursesTitle}>
                {calculationType === 'university' ? 'Üniversite Dersleri' : 'Lise Dersleri'}
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={addCourse}>
                <Plus size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            {calculationType === 'university' 
              ? courses.map(course => (
                  <View key={course.id} style={styles.courseCard}>
                    <View style={styles.courseHeader}>
                      <TextInput
                        style={styles.courseNameInput}
                        value={course.name}
                        onChangeText={(text) => updateCourse(course.id, 'name', text)}
                        placeholder="Ders Adı"
                      />
                      <TouchableOpacity onPress={() => removeCourse(course.id)}>
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.gradeInputs}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Kredi</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={course.credits.toString()}
                          onChangeText={(text) => updateCourse(course.id, 'credits', parseInt(text) || 0)}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Vize</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={course.midtermGrade.toString()}
                          onChangeText={(text) => updateCourse(course.id, 'midtermGrade', parseInt(text) || 0)}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Final</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={course.finalGrade.toString()}
                          onChangeText={(text) => updateCourse(course.id, 'finalGrade', parseInt(text) || 0)}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  </View>
                ))
              : preUniCourses.map(course => (
                  <View key={course.id} style={styles.courseCard}>
                    <View style={styles.courseHeader}>
                      <TextInput
                        style={styles.courseNameInput}
                        value={course.name}
                        onChangeText={(text) => updateCourse(course.id, 'name', text)}
                        placeholder="Ders Adı"
                      />
                      <TouchableOpacity onPress={() => removeCourse(course.id)}>
                        <Trash2 size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.gradeInputs}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>1. Dönem</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={course.term1Grade.toString()}
                          onChangeText={(text) => updateCourse(course.id, 'term1Grade', parseInt(text) || 0)}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>2. Dönem</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={course.term2Grade.toString()}
                          onChangeText={(text) => updateCourse(course.id, 'term2Grade', parseInt(text) || 0)}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  </View>
                ))
            }
          </View>
        )}
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
  modeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedMode: {
    backgroundColor: '#4F46E5',
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedModeText: {
    color: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#F0F5FF',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTypeText: {
    color: '#4F46E5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  goalSection: {
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  goalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: 120,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 6,
  },
  currentGPAText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  calculateSection: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gpaResult: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 8,
  },
  gpaScale: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  coursesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#F0F5FF',
    padding: 8,
    borderRadius: 8,
  },
  courseCard: {
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
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 4,
    marginRight: 12,
  },
  gradeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  numberInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 60,
  },
});