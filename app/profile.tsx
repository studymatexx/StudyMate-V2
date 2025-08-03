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
} from 'react-native';
import { ArrowLeft, User, Mail, Lock, Save, Trash2, CreditCard as Edit3 } from 'lucide-react-native';
import { Link } from 'expo-router';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  school: string;
  grade: string;
  subjects: string[];
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 555 123 4567',
    school: 'Atatürk Lisesi',
    grade: '11. Sınıf',
    subjects: ['Matematik', 'Fizik', 'Kimya', 'Biyoloji'],
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [newSubject, setNewSubject] = useState('');

  const handleSave = () => {
    if (!editedProfile.name.trim() || !editedProfile.email.trim()) {
      Alert.alert('Hata', 'Ad ve e-posta alanları boş bırakılamaz.');
      return;
    }

    setProfile(editedProfile);
    setIsEditing(false);
    Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setNewSubject('');
  };

  const addSubject = () => {
    if (newSubject.trim() && !editedProfile.subjects.includes(newSubject.trim())) {
      setEditedProfile({
        ...editedProfile,
        subjects: [...editedProfile.subjects, newSubject.trim()],
      });
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setEditedProfile({
      ...editedProfile,
      subjects: editedProfile.subjects.filter(s => s !== subject),
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            // Hesap silme işlemi
            Alert.alert('Hesap Silindi', 'Hesabınız başarıyla silindi.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)" asChild>
          <TouchableOpacity>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Link>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          {isEditing ? (
            <Save size={24} color="#FFFFFF" />
          ) : (
            <Edit3 size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#4F46E5" />
          </View>
          <Text style={styles.profileName}>
            {isEditing ? editedProfile.name : profile.name}
          </Text>
          <Text style={styles.profileEmail}>
            {isEditing ? editedProfile.email : profile.email}
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ad Soyad</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedProfile.name}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, name: text })
                }
                placeholder="Adınızı ve soyadınızı girin"
              />
            ) : (
              <View style={styles.displayField}>
                <Text style={styles.displayText}>{profile.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-posta</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedProfile.email}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, email: text })
                }
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <View style={styles.displayField}>
                <Mail size={16} color="#6B7280" />
                <Text style={styles.displayText}>{profile.email}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedProfile.phone}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, phone: text })
                }
                placeholder="Telefon numaranızı girin"
                keyboardType="phone-pad"
              />
            ) : (
              <View style={styles.displayField}>
                <Text style={styles.displayText}>{profile.phone}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Eğitim Bilgileri</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Okul</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedProfile.school}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, school: text })
                }
                placeholder="Okulunuzun adını girin"
              />
            ) : (
              <View style={styles.displayField}>
                <Text style={styles.displayText}>{profile.school}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Sınıf</Text>
            {isEditing ? (
              <TextInput
                style={styles.textInput}
                value={editedProfile.grade}
                onChangeText={(text) =>
                  setEditedProfile({ ...editedProfile, grade: text })
                }
                placeholder="Sınıfınızı girin"
              />
            ) : (
              <View style={styles.displayField}>
                <Text style={styles.displayText}>{profile.grade}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Dersler</Text>
          
          {isEditing && (
            <View style={styles.addSubjectContainer}>
              <TextInput
                style={styles.subjectInput}
                value={newSubject}
                onChangeText={setNewSubject}
                placeholder="Yeni ders ekle"
              />
              <TouchableOpacity style={styles.addButton} onPress={addSubject}>
                <Text style={styles.addButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.subjectsContainer}>
            {(isEditing ? editedProfile.subjects : profile.subjects).map((subject, index) => (
              <View key={index} style={styles.subjectChip}>
                <Text style={styles.subjectText}>{subject}</Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => removeSubject(subject)}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editSubjectsButton} 
              onPress={() => setIsEditing(true)}
            >
              <Edit3 size={20} color="#4F46E5" />
              <Text style={styles.editSubjectsText}>Dersleri Düzenle</Text>
            </TouchableOpacity>
          )}
        </View>

        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Tehlikeli Alan</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Hesabı Sil</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  formSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
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
  displayField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 8,
  },
  displayText: {
    fontSize: 16,
    color: '#1F2937',
  },
  addSubjectContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  subjectInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dangerZone: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editSubjectsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F5FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  editSubjectsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
});