# festLearnAI 🧠🤖

![festLearnAI Banner](https://raw.githubusercontent.com/ebrarmn/festLearnAI/main/frontend/src/assets/hero.png)

## Proje Tanımı

**festLearnAI**, öğrencilerin öğrenme süreçlerini daha etkili ve verimli hale getirmek amacıyla tasarlanan yapay zeka destekli, kişiselleştirilmiş bir eğitim platformudur. Bu sistem, kullanıcıların kendi PDF formatındaki dokümanlarını (ders notları, akademik makaleler vb.) yükleyerek, bu materyaller üzerinden otomatik olarak üretilen çoktan seçmeli ve açık uçlu (klasik) quizlerle kendilerini test etmelerini sağlar. Öğrencilerin klasik sorulara verdiği yanıtlar, "LLM-as-a-Judge" (Yapay Zeka Hakemi) mimarisi ile tıpkı bir öğretmen gibi okunup değerlendirilir ve geri bildirim verilir.

Proje, yalnızca metin okuma alışkanlığını "aktif geri çağırma" (active recall) yöntemiyle destekleyerek kalıcı öğrenmeyi hedefler. Platform, oyunlaştırma bileşenleri (rozetler, gün serileri) ve analitik paneli (dashboard) ile öğrencinin motivasyonunu yüksek tutarken, aynı zamanda RAG (Retrieval-Augmented Generation) altyapısı sayesinde sadece yüklenen belgeye sadık, halüsinasyondan uzak bir soru üretim mekanizması sunar.

---

## Kullanılan Teknolojiler

Projenin geliştirilmesinde performanslı ve modern bir teknoloji yığını (stack) kullanılmıştır:

*   **Arayüz (Frontend):** React.js, Vite, React Router DOM, Recharts, Vanilla CSS (Glassmorphism tasarımı).
*   **İş Mantığı (Backend):** Python 3, FastAPI, LangChain.
*   **Veritabanı:** 
    *   **PostgreSQL:** Kullanıcı, rozet ve istatistik gibi ilişkisel veriler için.
    *   **ChromaDB:** Doküman parçacıkları ve semantik aramalar (vektör veritabanı) için.
*   **Yapay Zeka (AI) ve API'ler:**
    *   **Google Gemini Vision (1.5 Flash):** PDF sayfalarından metin ve görsel çıkarma (OCR) için.
    *   **xAI Grok (grok-4-fast-reasoning):** Bağlama uygun, zorluk seviyesi ayarlanmış dinamik soruların üretimi ve açık uçlu cevapların değerlendirilmesi (LLM-as-a-Judge) için.
    *   **Google Generative AI Embeddings:** Metin parçacıklarını vektöre dönüştürmek için.

---

## Sistem Mimarisi

Sistem, **İstemci-Sunucu (Client-Server)** modeli tabanlı, asenkron ve modüler bir mimariye (SPA) sahiptir:

1.  **Arayüz Katmanı:** Kullanıcı etkileşiminin yönetildiği katmandır. React ve Vite ile geliştirilmiş olup, RESTful API'ler ile haberleşir. Kullanıcıların rozet kazandığı, grafiklerinin oluşturulduğu bileşenler bu katmandadır.
2.  **Backend Katmanı:** FastAPI üzerine kurulu iş mantığı katmanıdır. Rota (Router), Servis (Business Logic) ve Veri Erişimi (Repository) olmak üzere kendi içinde modülerdir. Kullanıcı yetkilendirme (JWT) ve yapay zeka çağrılarını asenkron olarak yönetir.
3.  **Veritabanı Katmanı:** Hibrit veritabanı yaklaşımı kullanılır. Kullanıcıların izole edilmesi için "Tenant-Isolation" mimarisiyle yapılandırılmış vektör veritabanı (ChromaDB) ve asıl profil verilerini barındıran ilişkisel veritabanından (PostgreSQL) oluşur.
4.  **Yapay Zeka (RAG) Bileşeni:** 
    *   Yüklenen belge parçalanır (Chunking) ve vektörel embedding olarak saklanır.
    *   Kullanıcı teste başladığında, ilgili konu uzayda taranır (Cosine Similarity).
    *   En yakın metin parçacıkları xAI Grok modeline bağlanarak "Sadece bu metne dayalı zor/kolay soru üret" şeklinde dinamik promptlar ile test oluşturulur.

---

## Kurulum Talimatı

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyebilirsiniz.

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/ebrarmn/festLearnAI.git
cd festLearnAI
```

### 2. Backend Kurulumu
Backend dizinine gidin, sanal ortamı oluşturun ve bağımlılıkları yükleyin:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
```

`.env` dosyasını `backend` dizini içerisine oluşturun ve gerekli değişkenleri ekleyin:
```env
GEMINI_API_KEY=google_api_anahtariniz
XAI_API_KEY=xai_api_anahtariniz
DATABASE_URL=postgresql://kullanici:sifre@localhost:5432/festLearnAI
JWT_SECRET_KEY=gizli_anahtariniz
```

Backend sunucusunu başlatın:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# ya da
python main.py
```

### 3. Frontend Kurulumu
Yeni bir terminalde frontend dizinine gidin ve bağımlılıkları yükleyin:
```bash
cd ../frontend
npm install
npm run dev
```
Uygulama `http://localhost:5173` adresinde çalışmaya başlayacaktır.

---
*Bu proje Fırat Üniversitesi Teknoloji Fakültesi Yazılım Mühendisliği Bitirme Projesi kapsamında geliştirilmiştir.*
