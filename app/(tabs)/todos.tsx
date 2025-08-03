import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { 
  SquareCheck as CheckSquare, 
  Plus, 
  Trash2, 
  CreditCard as Edit3, 
  Check, 
  X,
  CircleCheck as CheckCircle2,
  Circle,
  BookOpen,
  Timer,
  Target
} from 'lucide-react-native';

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  courseRelated?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface SubTask {
  id: string;
  name: string;
  completed: boolean;
}

interface Course {
  id: string;
  name: string;
  color: string;
  subtasks: SubTask[];
}

export default function TasksAndStudyPlan() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'study'>('tasks');
  
  // Görevler state'i
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: '1',
      title: 'Matematik Ödevini Tamamla',
      description: 'Bölüm 5\'ten 1-15 arası problemleri çöz',
      completed: false,
      courseRelated: 'Matematik',
      priority: 'high',
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Fizik Notlarını Gözden Geçir',
      description: 'Elektromanyetik teori notlarını incele',
      completed: true,
      courseRelated: 'Fizik',
      priority: 'medium',
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Kimya Laboratuvarına Hazırlan',
      description: 'Bir sonraki deney için laboratuvar kılavuzunu oku',
      completed: false,
      courseRelated: 'Kimya',
      priority: 'medium',
      createdAt: new Date(),
    },
  ]);

  // Çalışma planı state'i
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      name: 'Matematik',
      color: '#3B82F6',
      subtasks: [
        { id: '1', name: 'Çalışıldı', completed: false },
        { id: '2', name: 'Tekrar Edildi', completed: true },
        { id: '3', name: 'Not Alındı', completed: false },
        { id: '4', name: 'Quiz Çözüldü', completed: false },
        { id: '5', name: 'Ek Kaynak Okundu', completed: false },
      ],
    },
    {
      id: '2',
      name: 'Fizik',
      color: '#10B981',
      subtasks: [
        { id: '1', name: 'Çalışıldı', completed: true },
        { id: '2', name: 'Tekrar Edildi', completed: false },
        { id: '3', name: 'Not Alındı', completed: true },
        { id: '4', name: 'Quiz Çözüldü', completed: false },
        { id: '5', name: 'Ek Kaynak Okundu', completed: false },
      ],
    },
    {
      id: '3',
      name: 'Kimya',
      color: '#F59E0B',
      subtasks: [
        { id: '1', name: 'Çalışıldı', completed: false },
        { id: '2', name: 'Tekrar Edildi', completed: false },
        { id: '3', name: 'Not Alındı', completed: false },
        { id: '4', name: 'Quiz Çözüldü', completed: false },
        { id: '5', name: 'Ek Kaynak Okundu', completed: false },
      ],
    },
  ]);

  // Görevler için state'ler
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    courseRelated: '',
  });

  // Çalışma planı için state'ler
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  const [editCourseName, setEditCourseName] = useState('');

  const courseColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

  // Görevler fonksiyonları
  const addTodo = () => {
    if (newTodo.title.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now().toString(),
          title: newTodo.title,
          description: newTodo.description,
          completed: false,
          courseRelated: newTodo.courseRelated || undefined,
          priority: newTodo.priority,
          createdAt: new Date(),
        },
      ]);
      setNewTodo({ title: '', description: '', priority: 'medium', courseRelated: '' });
      setIsAdding(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    Alert.alert(
      'Görevi Sil',
      'Bu görevi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => {
          setTodos(todos.filter(todo => todo.id !== id));
        }},
      ]
    );
  };

  // Çalışma planı fonksiyonları
  const toggleSubtask = (courseId: string, subtaskId: string) => {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId
          ? {
              ...course,
              subtasks: course.subtasks.map(subtask =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : course
      )
    );
  };

  const addCourse = () => {
    if (newCourseName.trim()) {
      const newCourse: Course = {
        id: Date.now().toString(),
        name: newCourseName.trim(),
        color: courseColors[courses.length % courseColors.length],
        subtasks: [
          { id: '1', name: 'Çalışıldı', completed: false },
          { id: '2', name: 'Tekrar Edildi', completed: false },
          { id: '3', name: 'Not Alındı', completed: false },
          { id: '4', name: 'Quiz Çözüldü', completed: false },
          { id: '5', name: 'Ek Kaynak Okundu', completed: false },
        ],
      };
      setCourses([...courses, newCourse]);
      setNewCourseName('');
      setShowAddCourse(false);
    }
  };

  const deleteCourse = (courseId: string) => {
    Alert.alert(
      'Dersi Sil',
      'Bu dersi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => setCourses(courses.filter(course => course.id !== courseId)),
        },
      ]
    );
  };

  const editCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setEditCourseName(course.name);
      setEditingCourse(courseId);
    }
  };

  const saveCourseEdit = () => {
    if (editCourseName.trim() && editingCourse) {
      setCourses(courses.map(course =>
        course.id === editingCourse
          ? { ...course, name: editCourseName.trim() }
          : course
      ));
      setEditingCourse(null);
      setEditCourseName('');
    }
  };

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getCompletionStats = () => {
    const completed = todos.filter(todo => todo.completed).length;
    const total = todos.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const calculateOverallProgress = () => {
    const totalTasks = courses.reduce((acc, course) => acc + course.subtasks.length, 0);
    const completedTasks = courses.reduce(
      (acc, course) => acc + course.subtasks.filter(task => task.completed).length,
      0
    );
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const stats = getCompletionStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {activeTab === 'tasks' ? (
            <CheckSquare size={28} color="#FFFFFF" />
          ) : (
            <BookOpen size={28} color="#FFFFFF" />
          )}
          <Text style={styles.headerTitle}>
            {activeTab === 'tasks' ? 'Görevler' : 'Günlük Çalışma'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addHeaderButton}
          onPress={() => {
            if (activeTab === 'tasks') {
              setIsAdding(true);
            } else {
              setShowAddCourse(true);
            }
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}
        >
          <CheckSquare size={20} color={activeTab === 'tasks' ? '#4F46E5' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>
            Görevler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'study' && styles.activeTab]}
          onPress={() => setActiveTab('study')}
        >
          <BookOpen size={20} color={activeTab === 'study' ? '#4F46E5' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'study' && styles.activeTabText]}>
            Çalışma
          </Text>
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      {activeTab === 'tasks' ? (
        // Görevler İçeriği
        <>
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Bugünkü İlerleme</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsNumber}>{stats.completed}/{stats.total}</Text>
              <Text style={styles.statsPercentage}>{stats.percentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.percentage}%` }]} />
            </View>
          </View>

          <ScrollView style={styles.todoList} showsVerticalScrollIndicator={false}>
            {isAdding && (
              <View style={styles.addTodoCard}>
                <TextInput
                  style={styles.titleInput}
                  value={newTodo.title}
                  onChangeText={(text) => setNewTodo({ ...newTodo, title: text })}
                  placeholder="Görev başlığı"
                  autoFocus
                />
                <TextInput
                  style={styles.descriptionInput}
                  value={newTodo.description}
                  onChangeText={(text) => setNewTodo({ ...newTodo, description: text })}
                  placeholder="Açıklama (isteğe bağlı)"
                  multiline
                />
                <TextInput
                  style={styles.courseInput}
                  value={newTodo.courseRelated}
                  onChangeText={(text) => setNewTodo({ ...newTodo, courseRelated: text })}
                  placeholder="İlgili ders (isteğe bağlı)"
                />
                
                <View style={styles.prioritySelector}>
                  <Text style={styles.priorityLabel}>Öncelik:</Text>
                  {[
                    { key: 'low', label: 'Düşük' },
                    { key: 'medium', label: 'Orta' },
                    { key: 'high', label: 'Yüksek' }
                  ].map(priority => (
                    <TouchableOpacity
                      key={priority.key}
                      style={[
                        styles.priorityButton,
                        newTodo.priority === priority.key && styles.selectedPriority,
                        { borderColor: getPriorityColor(priority.key as any) },
                      ]}
                      onPress={() => setNewTodo({ ...newTodo, priority: priority.key as any })}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          newTodo.priority === priority.key && { color: getPriorityColor(priority.key as any) },
                        ]}
                      >
                        {priority.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.addActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsAdding(false);
                      setNewTodo({ title: '', description: '', priority: 'medium', courseRelated: '' });
                    }}
                  >
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveButton} onPress={addTodo}>
                    <Check size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {todos.map(todo => (
              <View key={todo.id} style={styles.todoCard}>
                <TouchableOpacity
                  style={styles.todoContent}
                  onPress={() => toggleTodo(todo.id)}
                >
                  <View style={styles.todoLeft}>
                    <View
                      style={[
                        styles.checkbox,
                        todo.completed && styles.checkedBox,
                      ]}
                    >
                      {todo.completed && <Check size={16} color="#FFFFFF" />}
                    </View>
                    <View style={styles.todoDetails}>
                      <Text
                        style={[
                          styles.todoTitle,
                          todo.completed && styles.completedTitle,
                        ]}
                      >
                        {todo.title}
                      </Text>
                      {todo.description && (
                        <Text
                          style={[
                            styles.todoDescription,
                            todo.completed && styles.completedDescription,
                          ]}
                        >
                          {todo.description}
                        </Text>
                      )}
                      {todo.courseRelated && (
                        <Text style={styles.courseTag}>{todo.courseRelated}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.todoRight}>
                    <View
                      style={[
                        styles.priorityIndicator,
                        { backgroundColor: getPriorityColor(todo.priority) },
                      ]}
                    />
                    <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      ) : (
        // Çalışma Planı İçeriği
        <>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Bugünkü İlerleme</Text>
            <Text style={styles.progressPercentage}>{calculateOverallProgress()}%</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${calculateOverallProgress()}%` },
                ]}
              />
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {courses.map(course => {
              const completedCount = course.subtasks.filter(task => task.completed).length;
              const progress = Math.round((completedCount / course.subtasks.length) * 100);

              return (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <View style={[styles.colorIndicator, { backgroundColor: course.color }]} />
                    {editingCourse === course.id ? (
                      <TextInput
                        style={styles.courseNameInput}
                        value={editCourseName}
                        onChangeText={setEditCourseName}
                        onBlur={saveCourseEdit}
                        onSubmitEditing={saveCourseEdit}
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.courseName}>{course.name}</Text>
                    )}
                    <Text style={styles.courseProgress}>{progress}%</Text>
                    <View style={styles.courseActions}>
                      <TouchableOpacity onPress={() => editCourse(course.id)}>
                        <Edit3 size={16} color="#6B7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteCourse(course.id)}>
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.subtaskContainer}>
                    {course.subtasks.map(subtask => (
                      <TouchableOpacity
                        key={subtask.id}
                        style={styles.subtaskRow}
                        onPress={() => toggleSubtask(course.id, subtask.id)}
                      >
                        {subtask.completed ? (
                          <CheckCircle2 size={24} color={course.color} />
                        ) : (
                          <Circle size={24} color="#9CA3AF" />
                        )}
                        <Text
                          style={[
                            styles.subtaskText,
                            subtask.completed && styles.completedText,
                          ]}
                        >
                          {subtask.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Ders Ekleme Modal */}
      <Modal visible={showAddCourse} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Yeni Ders Ekle</Text>
            <TextInput
              style={styles.modalInput}
              value={newCourseName}
              onChangeText={setNewCourseName}
              placeholder="Ders adını girin"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddCourse(false);
                  setNewCourseName('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={addCourse}>
                <Text style={styles.confirmButtonText}>Ekle</Text>
              </TouchableOpacity>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  addHeaderButton: {
    padding: 4,
  },
  tabSelector: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F0F5FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  statsPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  addTodoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    marginBottom: 12,
  },
  descriptionInput: {
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    marginBottom: 12,
    minHeight: 40,
  },
  courseInput: {
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    marginBottom: 16,
  },
  prioritySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  priorityButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedPriority: {
    backgroundColor: '#F9FAFB',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  todoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todoContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkedBox: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  todoDetails: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  todoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: '#D1D5DB',
  },
  courseTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#F0F5FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  todoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  // Çalışma planı stilleri
  progressCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4F46E5',
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  colorIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginRight: 12,
  },
  courseName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  courseNameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#4F46E5',
    paddingVertical: 4,
  },
  courseProgress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 12,
  },
  courseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  subtaskContainer: {
    gap: 12,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtaskText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
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