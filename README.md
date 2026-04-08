# festLearnAI 🧠🤖

**festLearnAI**, yapay zeka destekli, kişiselleştirilmiş bir öğrenme platformudur. Kullanıcıların yüklediği PDF dökümanlarını analiz eder, bu içeriklerden akıllı sorular üretir ve kullanıcının bilgi seviyesine göre (Başlangıç, Orta, İleri) dinamik bir öğrenme deneyimi sunar.

![festLearnAI Banner](https://raw.githubusercontent.com/ebrarmn/festLearnAI/main/frontend/src/assets/hero.png)

## 🚀 Temel Özellikler

- 📄 **PDF Analizi:** Dökümanlarınızı yükleyin ve yapay zeka tarafından saniyeler içinde işlenmesini izleyin.
- 📝 **Akıllı Quizler:** xAI (Grok) ve RAG (Retrieval-Augmented Generation) teknolojisi ile döküman içeriğine dayalı çoktan seçmeli sorular.
- 📈 **Seviye Adaptasyonu:** Kullanıcının geçmiş performansına göre zorluğu değişen sorular (Başlangıç'tan İleri Seviye'ye).
- 📊 **Analitik Paneli:** Öğrenme sürecinizi, harcanan zamanı ve başarı oranlarını grafiklerle takip edin.
- 🏆 **Rozet Sistemi:** Başarılarınıza göre özel rozetler kazanın ve seviye atlayın.
- 🌍 **Tam Türkçe Dil Desteği:** Tüm arayüz ve içerik üretimi Türkçe olarak optimize edilmiştir.

## 🛠️ Teknoloji Yığını

### Backend
- **Framework:** FastAPI (Python)
- **AI/LLM:** xAI Grok (langchain-xai) & Google Gemini (Embeddings)
- **Veritabanı:** PostgreSQL (SQLAlchemy) & ChromaDB (Vektör Veritabanı)
- **RAG Araçları:** LangChain

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Vanilla CSS & React Icons
- **Grafikler:** Recharts
- **API Client:** Axios

## 📦 Kurulum

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/ebrarmn/festLearnAI.git
cd festLearnAI
```

### 2. Backend Kurulumu
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows için: venv\Scripts\activate
pip install -r requirements.txt
```
`.env` dosyasını oluşturun ve gerekli anahtarları ekleyin:
```env
GOOGLE_API_KEY=AIzaSy...
XAI_API_KEY=xai-...
DATABASE_URL=postgresql://user:password@localhost:5432/festLearnAI
```
Başlatmak için:
```bash
python main.py
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev
```

## 🤝 Katkıda Bulunma
Her türlü geri bildirim ve katkıya açığız! Lütfen bir "Issue" açın veya "Pull Request" gönderin.

---
*Bu proje eğitsel amaçlarla AI desteği kullanılarak geliştirilmiştir.*
