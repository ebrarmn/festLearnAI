# Yazılım Gereksinimleri Belirtimi (Software Requirements Specification - SRS)
## festLearnAI - AI Destekli Kişiselleştirilmiş Öğrenme Platformu

### 1. Giriş
#### 1.1 Amaç
Bu doküman, "festLearnAI" adlı yapay zeka destekli, kişiselleştirilmiş öğrenme platformunun yazılım gereksinimlerini tanımlar. Projenin amacı, kullanıcıların PDF formatında dokümanlar yükleyerek bu dokümanlar üzerinden yapay zeka tarafından oluşturulan çoktan seçmeli quizlerle kendilerini test etmelerini ve öğrenme süreçlerini takip etmelerini sağlamaktır.

#### 1.2 Kapsam
Sistem tam teşekküllü bir web uygulaması olarak geliştirilmiştir. FastAPI ve Python tabanlı bir backend, React tabanlı zengin bir frontend barındırır. Google Gemini Vision API ve xAI Grok modellerini kullanarak yüklenen PDF dosyalarından metin analizi yapar, RAG (Retrieval-Augmented Generation) altyapısı ile vektör veritabanından bağlam çekerek dinamik soru üretir. Kullanıcılara seviye adaptasyonu, detaylı rozet sistemi, analitik gösterge paneli ve liderlik tablosu özellikleri sunar. Tüm bunların yanı sıra çok kullanıcılı, veri izolasyonuna sahip bir yapısı vardır.

---

### 2. Genel Bakış
#### 2.1 Ürün Perspektifi
Sistem, herhangi bir indirme veya kurulum gerektirmeden tarayıcı üzerinden çalışan bağımsız bir platformdur. İstemci (Frontend) ve Sunucu (Backend) olarak iki parçaya ayrılmıştır ve aralarında REST API üzerinden iletişim kurarlar.

#### 2.2 Kullanıcı Sınıfları ve Özellikleri
- **Kayıtlı Öğrenci / Kullanıcı:** Sisteme üye olan temel kullanıcı tipidir. Kendi dokümanlarını sisteme yükleyebilir, yüklediği içeriklerden kişiselleştirilmiş quizler oluşturabilir, rozet toplayabilir, performans metriklerini inceleyebilir ve diğer kullanıcılarla rekabet edebilir.

---

### 3. Sistem Özellikleri ve Fonksiyonel Gereksinimler

#### 3.1 Kullanıcı Yetkilendirme ve Kimlik Yönetimi
- **Kayıt Olma (Register):** Kullanıcı ad, soyad, e-posta, güvenli şifre, doğum tarihi ve cinsiyet bilgileriyle üye olabilir. Kullanıcı sözleşmesi ve KVKK onayı zorunludur.
- **Giriş Yapma (Login):** Kullanıcı adı veya e-posta bilgisiyle sisteme giriş yapılabilir. Başarılı girişlerde "streak" (seri) durumu kontrol edilip güncellenir.
- **Şifre Sıfırlama:** Unutulan şifreler için sistem e-posta (SMTP) yoluyla güvenli ve süreli (1 saat) bir sıfırlama bağlantısı gönderir.

#### 3.2 Doküman Yönetimi (PDF Upload & RAG Processing)
- **PDF Yükleme:** Kullanıcılar drag-and-drop özellikli yükleme paneli ile PDF dosyalarını sisteme ekleyebilir.
- **Gelişmiş AI OCR İşlemi:** Yüklenen PDF'lerin sayfaları görsele dönüştürülür ve Google Gemini Vision modeli ile el yazısı dahil tüm metinler okunur. Toplam sayfa sayısı arayüze gerçek zamanlı yansıtılır. (0 sayfa hatası giderilmiş haliyle sisteme aktarılır).
- **Vektörel Veritabanı:** Metin parçaları (chunks) LangChain algoritmalarıyla bölünerek ChromaDB veritabanında "kullanıcı bazlı" (tenant-isolated) olarak saklanır.
- **Doküman Silme:** Kullanıcılar, artık soru çıkmasını istemedikleri veya platformda tutmak istemedikleri PDF dosyalarını kalıcı olarak silebilirler.

#### 3.3 Dinamik Quiz Modülü
- **Quiz Başlatma Yönergeleri:** Kullanıcı, ilgili konu/dosyayı ve sorulacak soru miktarını (3, 5, 10, 15, 20) seçerek quizi başlatabilir.
- **Dinamik ve Akıllı Soru Üretimi:** Sistem, xAI Grok modeli ile kullanıcının mevcut seviyesini (Başlangıç, Orta Seviye, İleri Seviye) analiz eder ve RAG entegrasyonuyla PDF bağlamını kullanarak sadece bu bağlama uygun 5 şıklı sorular üretir.
- **Sınav Akışı ve Zamanlayıcı:** Quiz esnasında sorular tek tek kullanıcıya sunulur. Anında doğru/yanlış teyidi yapılır, yapay zeka tarafından sağlanan açıklama (neden doğru/yanlış) gösterilir. Tüm süreçteki süre zamanlayıcı ile kaydedilir.
- **Güvenli Sınav Modu:** Kullanıcının sınav esnasında başka sayfaya geçmesi durumunda özel bir onay modülü belirerek "Sınav ilerlemesinin kaydedilmeyeceğini" uyarır.

#### 3.4 Puanlama ve Adaptif Seviye
- **Puanlama:** Toplam doğruluk oranına göre kullanıcıya her testin sonunda puan verilir.
- **Adaptif Seviye Mekanizması:** Kullanıcının son 3 quizi analiz edilir. Üst üste başarılı skor alan kullanıcılar bir üst seviyeye terfi eder, düşük skorlarda alt seviyeye düşürülerek soruların zorluğu dinamik şekilde yönetilir. Yeni bir PDF yüklendiğinde adaptif seviye o konu için başa döndürülür.
- **Gün Serisi (Streak):** Ardışık günlerde uygulamayı aktif kullanan kişilerin devamlılığı takip edilir.

#### 3.5 Oyunlaştırma (Rozet Sistemi)
- Genişletilebilir ve çok çeşitli "Başarı Rozetleri" bulunur.
- **Kategoriler:** "Quiz Çözme Miktarı" (Örn: 50 quiz tamamlama), "Puan Miktarı" (Örn: 5000 puan), "Zorluk Seviyesi" (İleri seviyeye ulaşma), "Streak" (30 gün üst üste girme), "Kusursuz Skor" (%100 başarı) gibi kategorilerde değerlendirme yapılır.
- Sistem her quiz tamamlanmasında rozet kilitlerini kontrol eder ve kazanılanları dinamik popup ile duyurur.

#### 3.6 İstatistik ve Analitik (Dashboard & Analytics)
- Kullanıcıya kendi gelişimini izleme fırsatı veren görsel analiz panosu sunulur.
- **Recharts Entegrasyonu:** Alan (AreaChart) ve Çubuk (BarChart) ve Pasta (PieChart) grafiklerle zaman bazında gelişim, konu bazında başarı, zorluk dağılımı görselleştirilir.
- Toplam süre, doğru cevap oranları, güçlü ve zayıf olunan konular panelden incelenebilir.

#### 3.7 Liderlik Tablosu (Leaderboard)
- Öğrencilerin platformdaki genel rekabet sıralamasını gösterir.
- Toplanan puana göre listelenen tabloda İlk 3 kişi kürsü (Podyum) dizaynı ile ön plana çıkarılır (Altın, Gümüş, Bronz görünümü).

---

### 4. Dış Arayüz Gereksinimleri

#### 4.1 Kullanıcı Arayüzü (Frontend)
- **Framework & Kütüphaneler:** React.js, Vite, React Router DOM, React Icons.
- **Tasarım Dili:** Özel CSS "Glassmorphism", koyu mod (dark mode) renk paleti (Gradient mor, mavi ve başarılı renk tonları).
- **Kullanılabilirlik:** Yüksek performanslı SPA (Single Page Application) mimarisi. Sayfa arası geçişlerde "fade-in" animasyonları ve "toast" bilgilendirme mesajları bulunur. Tüm komponentler mobil veya masaüstü ekranlara duyarlıdır (Responsive).

#### 4.2 Yazılım Arayüzleri (Backend)
- **Framework & Dil:** Python 3, FastAPI.
- **Veritabanları:** İlişkisel veriler için PostgreSQL (Kullanıcılar, Doküman meta verisi, Puanlar). Vektör verileri için ChromaDB.
- **Model Entegrasyonları:** 
  - `ChatGoogleGenerativeAI (gemini-1.5-flash-latest)` : OCR ve resim işleme için.
  - `ChatXAI (grok-4-fast-reasoning)` : Soru üretimi için.
  - `GoogleGenerativeAIEmbeddings` : Metinleri vektöre dönüştürmek için.

---

### 5. Fonksiyonel Olmayan Gereksinimler

- **Veri Gizliliği (Tenant Isolation):** Kullanıcıların yüklediği dokümanların içeriğine sadece o kullanıcıların erişmesi ve sadece o dokümandan RAG araması yapılması zorunludur. `ingest_pdf` ve `generate_quiz_from_db` fonksiyonlarında `user_id` üzerinden filtreleme uygulanmıştır.
- **Güvenlik:** Kullanıcı şifreleri SHA-256 algoritmasıyla şifrelenerek veritabanında tutulur. Token bazlı süreli şifre sıfırlama güvenlik önlemi entegredir.
- **Hata Yönetimi ve Geri Bildirim:** API'de yaşanabilecek zaman aşımı durumlarında veya kullanıcı hatalarında (sayfa sayısının okunamaması gibi) önlemler backend tarafında revize edilmiş, frontend tarafında da açıklayıcı bildirimler (toast message) eklenmiştir.
- **Performans:** PDF işleme süreci yoğun kaynak gerektirdiği için chunk sayısına göre optimize edilmiş Langchain döküman ayırıcı (`RecursiveCharacterTextSplitter`) kullanılarak veritabanı yorulmaz.
