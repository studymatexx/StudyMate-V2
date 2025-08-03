import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Calendar, Plus, Trash2, Save, X, Clock, MapPin } from 'lucide-react-native';

interface ScheduleItem {
  id: string;
  startTime: string;
  endTime: string;
  subject: string;
  type: 'theoretical' | 'practical';
  location: string;
}

interface DaySchedule {
  day: string;
  shortDay: string;
  date: string;
  items: ScheduleItem[];
}

export default function WeeklySchedule() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: '',
    startTime: '',
    endTime: '',
    location: '',
    type: 'theoretical' as 'theoretical' | 'practical',
  });

  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([
    {
      day: 'Pazartesi',
      shortDay: 'Pzt',
      date: '2025-01-20',
      items: [],
    },
    {
      day: 'Salı',
      shortDay: 'Sal',
      date: '2025-01-21',
      items: [],
    },
    {
      day: 'Çarşamba',
      shortDay: 'Çar',
      date: '2025-01-22',
      items: [],
    },
    {
      day: 'Perşembe',
      shortDay: 'Per',
      date: '2025-01-23',
      items: [],
    },
    {
      day: 'Cuma',
      shortDay: 'Cum',
      date: '2025-01-24',
      items: [],
    },
    { day: 'Cumartesi', shortDay: 'Cmt', date: '2025-01-25', items: [] },
    { day: 'Pazar', shortDay: 'Paz', date: '2025-01-26', items: [] },
  ]);

  // Basit ders ekleme - not ekleme gibi
  const addNewClass = () => {
    if (!newClass.subject.trim()) return;

    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      subject: newClass.subject.trim(),
      startTime: newClass.startTime || '09:00',
      endTime: newClass.endTime || '10:00',
      location: newClass.location.trim() || 'Sınıf',
      type: newClass.type,
    };

    // Basit array kopyalama ve ekleme
    const updatedSchedule = [...weekSchedule];
    updatedSchedule[selectedDay] = {
      ...updatedSchedule[selectedDay],
      items: [...updatedSchedule[selectedDay].items, newItem]
    };

    setWeekSchedule(updatedSchedule);
    closeModal();
  };

  // Basit ders silme - not silme gibi
  const deleteClass = (classId: string) => {
    // Basit array kopyalama ve filtreleme
    const updatedSchedule = [...weekSchedule];
    updatedSchedule[selectedDay] = {
      ...updatedSchedule[selectedDay],
      items: updatedSchedule[selectedDay].items.filter(item => item.id !== classId)
    };

    setWeekSchedule(updatedSchedule);
  };

  const closeModal = () => {
    setNewClass({
      subject: '',
      startTime: '',
      endTime: '',
      location: '',
      type: 'theoretical',
    });
    setShowAddClass(false);
  };

  const getTypeColor = (type: 'theoretical' | 'practical') => {
    return type === 'theoretical' ? '#3B82F6' : '#10B981';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Calendar size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Haftalık Program</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddClass(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {weekSchedule.map((dayData, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                selectedDay === index && styles.selectedDayCard,
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text
                style={[
                  styles.dayName,
                  selectedDay === index && styles.selectedDayName,
                ]}
              >
                {dayData.shortDay}
              </Text>
              <Text
                style={[
                  styles.dayDate,
                  selectedDay === index && styles.selectedDayDate,
                ]}
              >
                {dayData.date.slice(8, 10)}
              </Text>
              {dayData.items.length > 0 && (
                <View style={[
                  styles.dayIndicator,
                  selectedDay === index && styles.selectedDayIndicator,
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Schedule Content */}
      <ScrollView style={styles.scheduleContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.dayHeader}>
          <Text style={styles.selectedDayTitle}>
            {weekSchedule[selectedDay].day}
          </Text>
          <Text style={styles.selectedDaySubtitle}>
            {weekSchedule[selectedDay].date}
          </Text>
        </View>

        {weekSchedule[selectedDay].items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Calendar size={48} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Ders Yok</Text>
            <Text style={styles.emptySubtitle}>
              Bu gün için henüz ders programlanmamış
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddClass(true)}
            >
              <Plus size={20} color="#4F46E5" />
              <Text style={styles.emptyButtonText}>İlk Dersi Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.classesContainer}>
            {weekSchedule[selectedDay].items.map((item) => (
              <View key={item.id} style={styles.classCard}>
                <View style={[
                  styles.classColorBar,
                  { backgroundColor: getTypeColor(item.type) }
                ]} />
                
                <View style={styles.classContent}>
                  <View style={styles.classHeader}>
                    <View style={styles.classMainInfo}>
                      <Text style={styles.classSubject}>{item.subject}</Text>
                      <View style={styles.classTypeContainer}>
                        <View style={[
                          styles.classTypeBadge,
                          { backgroundColor: getTypeColor(item.type) + '20' }
                        ]}>
                          <Text style={[
                            styles.classTypeText,
                            { color: getTypeColor(item.type) }
                          ]}>
                            {item.type === 'theoretical' ? 'Teorik' : 'Lab'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteClass(item.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.classDetails}>
                    <View style={styles.classDetailItem}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.classDetailText}>
                        {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                    
                    <View style={styles.classDetailItem}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.classDetailText}>
                        {item.location}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Class Modal */}
      <Modal visible={showAddClass} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Ders Ekle</Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ders Adı *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newClass.subject}
                  onChangeText={(text) => setNewClass({ ...newClass, subject: text })}
                  placeholder="Matematik, Fizik, Kimya..."
                />
              </View>

              <View style={styles.timeInputs}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.inputLabel}>Başlangıç</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={newClass.startTime}
                    onChangeText={(text) => setNewClass({ ...newClass, startTime: text })}
                    placeholder="09:00"
                  />
                </View>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.inputLabel}>Bitiş</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={newClass.endTime}
                    onChangeText={(text) => setNewClass({ ...newClass, endTime: text })}
                    placeholder="10:30"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Konum</Text>
                <TextInput
                  style={styles.textInput}
                  value={newClass.location}
                  onChangeText={(text) => setNewClass({ ...newClass, location: text })}
                  placeholder="A101 Sınıfı"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ders Türü</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newClass.type === 'theoretical' && styles.selectedType,
                    ]}
                    onPress={() => setNewClass({ ...newClass, type: 'theoretical' })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newClass.type === 'theoretical' && styles.selectedTypeText,
                      ]}
                    >
                      Teorik
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newClass.type === 'practical' && styles.selectedType,
                    ]}
                    onPress={() => setNewClass({ ...newClass, type: 'practical' })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newClass.type === 'practical' && styles.selectedTypeText,
                      ]}
                    >
                      Laboratuvar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addNewClass}>
                <Save size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Kaydet</Text>
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
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  daySelectorContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dayCard: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    minWidth: 60,
    position: 'relative',
  },
  selectedDayCard: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  selectedDayName: {
    color: '#FFFFFF',
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  selectedDayDate: {
    color: '#FFFFFF',
  },
  dayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4F46E5',
  },
  selectedDayIndicator: {
    backgroundColor: '#FFFFFF',
  },
  scheduleContainer: {
    flex: 1,
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  selectedDayTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  selectedDaySubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  classesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  classColorBar: {
    width: 4,
  },
  classContent: {
    flex: 1,
    padding: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  classMainInfo: {
    flex: 1,
  },
  classSubject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  classTypeContainer: {
    flexDirection: 'row',
  },
  classTypeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  classTypeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classDetails: {
    gap: 8,
  },
  classDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classDetailText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalContent: {
    padding: 24,
  },
  inputGroup: {
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
  timeInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedType: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F5FF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTypeText: {
    color: '#4F46E5',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});