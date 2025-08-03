import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ArrowLeft, Camera, RotateCcw, Zap, Image as ImageIcon } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Link href="/(tabs)/focus" asChild>
            <TouchableOpacity>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Link>
          <Text style={styles.headerTitle}>Kamera</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.permissionContainer}>
          <Camera size={64} color="#6B7280" />
          <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
          <Text style={styles.permissionText}>
            Matematik problemlerini çözmek için kamera erişimine ihtiyacımız var.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>İzin Ver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        Alert.alert('Hata', 'Fotoğraf çekilemedi. Lütfen tekrar deneyin.');
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const processPicture = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    
    try {
      // Burada AI işleme yapılacak
      // Şimdilik basit bir simülasyon
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Global state'e çözümü kaydet
      (global as any).lastSolution = {
        problem: "Çöz: 2x + 5 = 13",
        problemType: "Doğrusal Denklem",
        steps: [
          {
            step: 1,
            description: "Her iki taraftan 5 çıkar",
            equation: "2x + 5 - 5 = 13 - 5",
            result: "2x = 8",
            reasoning: "Eşitliği bozmadan her iki tarafa aynı işlemi uyguluyoruz"
          },
          {
            step: 2,
            description: "Her iki tarafı 2'ye böl",
            equation: "2x ÷ 2 = 8 ÷ 2",
            result: "x = 4",
            reasoning: "x'i yalnız bırakmak için katsayısına bölüyoruz"
          }
        ],
        explanation: "Bu bir doğrusal denklemdir. Denklemin her iki tarafında ters işlemler yaparak x değişkenini yalnız bırakırız.",
        finalAnswer: "x = 4"
      };
      
      Alert.alert(
        'Çözüm Hazır!',
        'Problem başarıyla analiz edildi. Çözümü görmek ister misiniz?',
        [
          { text: 'Hayır', style: 'cancel' },
          { text: 'Evet', onPress: () => {
            // Solution sayfasına yönlendir
            console.log('Çözüm sayfasına yönlendiriliyor...');
          }}
        ]
      );
      
    } catch (error) {
      Alert.alert('Hata', 'Problem işlenirken bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={retakePicture}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fotoğraf Önizleme</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeButton} onPress={retakePicture}>
              <RotateCcw size={24} color="#6B7280" />
              <Text style={styles.retakeButtonText}>Tekrar Çek</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.processButton, isProcessing && styles.processingButton]} 
              onPress={processPicture}
              disabled={isProcessing}
            >
              <Zap size={24} color="#FFFFFF" />
              <Text style={styles.processButtonText}>
                {isProcessing ? 'İşleniyor...' : 'AI ile Çöz'}
              </Text>
            </TouchableOpacity>
          </View>
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
        <Text style={styles.headerTitle}>Problem Çöz</Text>
        <TouchableOpacity onPress={toggleCameraFacing}>
          <RotateCcw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Matematik problemini kamera ile çekin
            </Text>
            <Text style={styles.instructionSubtext}>
              AI ile anında çözüm alın
            </Text>
          </View>

          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner}>
                <Camera size={32} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.galleryButton}>
              <ImageIcon size={24} color="#FFFFFF" />
              <Text style={styles.galleryButtonText}>Galeriden Seç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F8FAFC',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  instructionContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionSubtext: {
    color: '#D1D5DB',
    fontSize: 14,
    textAlign: 'center',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    alignItems: 'center',
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  previewImage: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
  },
  previewActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  processButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  processingButton: {
    backgroundColor: '#9CA3AF',
  },
  processButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});