# StudyMate.V2

StudyMate.V2, öğrenciler için geliştirilmiş kapsamlı bir çalışma uygulamasıdır. AI destekli soru çözme, YKS quiz sistemi, odak modu ve daha fazlasını içerir.

## 🚀 Özellikler

### 📱 Ana Özellikler
- **AI Destekli Soru Çözme**: Kamera ile soru fotoğrafı çekip anında çözüm alın
- **YKS Quiz Sistemi**: Gerçek YKS soruları ile kendinizi test edin
- **Odak Modu**: Pomodoro tekniği ile odaklanma oturumları
- **Günlük Çalışma Planı**: Ders bazlı görev takibi
- **Not Ortalaması Hesaplama**: Üniversite not sistemi entegrasyonu
- **Haftalık Program**: Ders programı yönetimi

### 🤖 AI Özellikleri
- GPT-4 Vision entegrasyonu
- Matematik problemi çözme
- Adım adım açıklamalar
- Yaygın hatalar analizi
- Benzer problem önerileri

## 🛠 Teknoloji Stack'i

### Frontend
- React Native + Expo
- TypeScript
- Expo Router
- Lucide React Native (İkonlar)
- Expo Image Picker

### Backend
- Node.js + Express
- OpenAI API (GPT-4 Vision)
- Multer (Dosya yükleme)
- CORS desteği

### Veritabanı
- CSV dosyaları (TYT/AYT soru havuzu)
- 4000+ gerçek YKS sorusu

## 📦 Kurulum

### Gereksinimler
- Node.js (v18+)
- npm veya yarn
- Expo CLI
- OpenAI API Key

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd StudyMate.V2
```

### 2. Frontend Bağımlılıklarını Yükleyin
```bash
npm install
```

### 3. Backend Bağımlılıklarını Yükleyin
```bash
cd backend
npm install
```

### 4. Environment Dosyasını Oluşturun
Backend dizininde `.env` dosyası oluşturun:

```env
# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret-key-here
```

### 5. Backend'i Başlatın
```bash
cd backend
npm start
```

Backend http://localhost:3000 adresinde çalışacak.

### 6. Frontend'i Başlatın
```bash
# Yeni terminal açın
npm run dev
```

## 🔧 Kullanım

### AI Soru Çözme
1. Odak Modu'na gidin
2. "Kamera" butonuna tıklayın
3. Sorunun fotoğrafını çekin
4. AI çözümünü bekleyin
5. Detaylı çözümü inceleyin

### YKS Quiz
1. Quiz sekmesine gidin
2. TYT veya AYT seçin
3. Soruları cevaplayın
4. Sonuçlarınızı görün

### Odak Modu
1. Süre seçin (25, 45, 60, 90 dakika)
2. "Başlat" butonuna tıklayın
3. Odaklanma oturumunu tamamlayın
4. Gerekirse şifre ile çıkış yapın

## 🐛 Sorun Giderme

### Backend Bağlantı Sorunları
- Backend'in çalıştığından emin olun
- Port 3000'in açık olduğunu kontrol edin
- `.env` dosyasının doğru yapılandırıldığını kontrol edin

### AI Çözüm Sorunları
- OpenAI API key'inizin geçerli olduğunu kontrol edin
- İnternet bağlantınızı kontrol edin
- Fotoğrafın net olduğundan emin olun

### Quiz Sorunları
- CSV dosyalarının backend dizininde olduğunu kontrol edin
- Backend'in çalıştığını doğrulayın

## 📁 Proje Yapısı

```
StudyMate.V2/
├── app/                    # Frontend ana dizini
│   ├── (tabs)/            # Tab navigasyonu
│   │   ├── index.tsx      # Ana sayfa
│   │   ├── quiz.tsx       # Quiz sistemi
│   │   ├── focus.tsx      # Odak modu
│   │   └── ...
│   ├── solution.tsx       # AI çözüm ekranı
│   └── welcome.tsx        # Giriş ekranı
├── backend/               # Backend dizini
│   ├── server.js          # Ana sunucu dosyası
│   ├── TYT_questions.csv  # TYT soru havuzu
│   ├── AYT_questions.csv  # AYT soru havuzu
│   └── package.json       # Backend bağımlılıkları
├── assets/                # Statik dosyalar
├── docs/                  # Dokümantasyon
└── package.json           # Frontend bağımlılıkları
```

## 🔒 Güvenlik

- OpenAI API key'inizi güvenli tutun
- `.env` dosyasını git'e commit etmeyin
- Production'da HTTPS kullanın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

**StudyMate.V2** - Yapay Zeka Destekli Çalışma Arkadaşınız 🤖📚 