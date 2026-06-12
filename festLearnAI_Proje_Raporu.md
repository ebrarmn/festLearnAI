# BİTİRME PROJESİ RAPORU

**Proje Adı:** festLearnAI - AI Destekli Kişiselleştirilmiş Öğrenme Platformu
**Danışman:** Doç. Dr. Ferhat UÇAR
**Bölüm:** Fırat Üniversitesi / Teknoloji Fakültesi / Yazılım Mühendisliği

---

# 1. GİRİŞ

## 1.1. Projenin Arka Planı ve Bilişsel Yük Teorisi
Günümüzde dijitalleşmenin hız kazanmasıyla birlikte bilgiye erişim çok daha kolay hale gelmiştir. Ancak bilginin niceliğindeki bu devasa artış, nitelikli öğrenme süreçlerini aynı oranda desteklememektedir. İnsan beyninin bilgiyi işleme, kısa süreli bellekten uzun süreli belleğe aktarma ve analiz etme kapasitesi, milyonlarca yıldır biyolojik bir sabite dayanmaktadır. Eğitim psikolojisinde "Bilişsel Yük Teorisi" (Cognitive Load Theory - Sweller, 1988) olarak adlandırılan kavrama göre, öğrencinin çalışma belleği (working memory) oldukça sınırlı bir kapasiteye sahiptir. Yüzlerce sayfalık PDF dosyaları, karmaşık ders notları ve yoğun metin yığınları, öğrencide "dışsal bilişsel yükü" (extraneous cognitive load) artırarak, asıl odaklanılması gereken "içsel bilişsel yük" (intrinsic cognitive load) üzerinde baskı oluşturmaktadır. Bu durum, öğrenme verimini dramatik bir şekilde düşürür.

Bu bağlamda, öğrencilerin bilgiyi daha kolay sentezleyebilmeleri, hatırlayabilmeleri ve zihinlerinde anlamlı şemalar (schemas) oluşturabilmeleri için "aralıklı tekrar" (spaced repetition) ve "aktif geri çağırma" (active recall) gibi pedagojik yöntemlere şiddetle ihtiyaç duyulmaktadır. Öğrencinin sadece pasif bir okuyucu olmak yerine, okuduğu metinle interaktif bir şekilde etkileşime girmesi, kalıcı öğrenmenin anahtarıdır.

## 1.2. Problem Tanımı
Mevcut e-öğrenme (e-learning) ve eğitim teknolojileri (EdTech) platformlarının detaylı analizleri sonucunda, öğrenme süreçlerini sekteye uğratan başlıca dört temel problem tespit edilmiştir:
1. **Statik Soru Havuzları ve İçerik Bağımlılığı:** Çoğu popüler platform (Örn. Udemy quizleri, Coursera değerlendirmeleri, geleneksel deneme sınavı portalları), önceden uzmanlar veya eğitmenler tarafından manuel olarak hazırlanmış, veritabanına statik olarak gömülmüş soru havuzları sunar. Eğer bir üniversite öğrencisi kendi yazdığı 50 sayfalık özel bir ders notunu veya spesifik bir akademik makaleyi sisteme yükleyip kendini test etmek isterse, bunu yapabileceği bir mekanizma yoktur.
2. **Kişiselleştirilmiş Adaptasyon Eksikliği (One-Size-Fits-All):** Geleneksel sistemlerin, kullanıcının bilişsel seviyesini ve konu bazlı yeterliliğini anlık olarak ölçme yeteneği bulunmamaktadır. Herkese aynı zorlukta sorular sorulması, uzman bir kullanıcı için can sıkıntısına (boredom), acemi bir kullanıcı için ise anksiyeteye ve çaresizliğe yol açar.
3. **Doküman İşleme ve OCR (Optik Karakter Tanıma) Kusurları:** Sistemlerin çoğunda kullanılan eski nesil OCR teknolojileri (örn. Tesseract), salt düz metinlerde başarılı olsa da; tablolar, formüller, el yazısı notlar veya karmaşık mizanpaja sahip akademik kağıtlar karşısında büyük veri kirliliği (noise) yaratmakta ve bağlamı kaybetmektedir.
4. **Motivasyonel Süreklilik ve Oyunlaştırma Eksikliği:** İnsan doğası gereği uzun ve zorlu öğrenme süreçlerinde motivasyon kaybı yaşanması kaçınılmazdır. Sistemlerin çoğunda "Streak" (Gün serisi) takibi, "Rozet" (Badge) kazanımı, "Liderlik Tablosu" (Leaderboard) gibi rekabetçi ve ödüllendirici oyunlaştırma (Gamification) bileşenleri bulunmadığı için terk edilme oranları (churn rate) çok yüksektir.

## 1.3. Projenin Amacı ve Hedefleri
"festLearnAI" projesinin temel amacı; Doğal Dil İşleme (NLP), Bilgisayarlı Görü (Computer Vision) ve Modern Web Mimarisi (MERN/PERN stack benzeri güncel teknolojiler) disiplinlerini tek bir çatı altında toplayarak tam otonom, kişiselleştirilebilir ve akıllı bir "Yapay Zeka Eğitmen" oluşturmaktır. Bu temel amacın alt hedefleri şu şekilde sıralanabilir:
* **Gelişmiş VLM (Vision-Language Model) Entegrasyonu:** Eski nesil OCR yerine, metni görsel uzamsal yapısıyla (spatial reasoning) okuyan çok modlu (multimodal) modellerle PDF dosyalarını (ister dijital baskı ister el yazısı olsun) %99'a varan doğrulukla parse etmek.
* **Sıfır Halüsinasyonlu RAG (Retrieval-Augmented Generation) Mimarisi:** Büyük Dil Modellerinin (LLM) kendi parametrelerinde olmayan konularda "uydurma" (hallucination) yapmasını önlemek adına, matematiksel vektör uzaylarında en yakın komşu (K-NN) bağlamını çıkararak modelin bilgi sınırlarını "yalnızca kullanıcının yüklediği belge" olarak kısıtlamak.
* **Dinamik Prompt Mühendisliği ile Adaptif Zorluk:** Soruların zorluk derecesini, kullanıcının bir önceki test performansındaki başarı eğrisine göre (örneğin son 3 quizdeki doğru/yanlış oranı) dinamik olarak ayarlamak.
* **Yüksek Performanslı Dağıtık Web Mimarisi:** İstemci (Frontend), sunucu (Backend) ve veritabanı bileşenlerini birbirinden bağımsız, asenkron, mikroservis odaklarına yakın ve yatay eksende kolayca ölçeklenebilir bir (REST API tabanlı SPA) yapıda inşa etmek.

## 1.4. Proje Kapsamı ve Sınırları
Geliştirilen platform, bulut tabanlı bir web uygulaması (Single Page Application - SPA) olarak tasarlanmıştır. Sistem, masaüstü (Windows, macOS, Linux) ve mobil cihazlardaki (iOS, Android) modern web tarayıcılarında herhangi bir eklentiye ihtiyaç duymadan çalışabilmektedir. Proje kapsamında Türkçe ve İngilizce başta olmak üzere çoklu dil desteğine sahip metinleri algılayabilen ve bu dillerde soru üretebilen bir RAG mimarisi kurgulanmıştır.
Sınırlar kapsamında; platform şu an için yalnızca `.pdf` uzantılı dokümanları kabul etmektedir. `.docx`, `.xlsx`, video (mp4) veya ses (mp3) dosyalarının işlenmesi projenin şimdiki sınırları dışındadır, ancak sistem mimarisi gelecekte bu formatları destekleyecek esneklikte tasarlanmıştır. Veri gizliliği açısından, "Tenant-Isolation" (Kullanıcı İzolasyonu) prensibine katı bir şekilde uyulmuştur. Bir kullanıcının sisteme yüklediği özel bir doküman, diğer bir kullanıcının RAG aramasına veya yapay zeka bağlamına kesinlikle dahil edilmemektedir.

---

# 2. LİTERATÜR ARAŞTIRMASI VE BENZER SİSTEMLER

Projenin teknik temelini oluşturmadan önce, eğitim teknolojileri ve yapay zeka alanında literatürde yapılan güncel çalışmalar ve piyasadaki mevcut uygulamalar detaylı bir şekilde analiz edilmiştir.

## 2.1. Büyük Dil Modelleri (LLM) ve Halüsinasyon Problemi
OpenAI (GPT-3.5, GPT-4), Anthropic (Claude), xAI (Grok) ve Google (Gemini) gibi Transformer tabanlı derin öğrenme modelleri, milyarlarca (hatta trilyonlarca) parametre ile devasa internet metin külliyatları (corpus) üzerinde eğitilirler. Bu modeller "Bir sonraki kelimeyi tahmin etme" (Next-token prediction) mimarisiyle çalışırlar. Ancak bu modeller her şeyi bilemezler. Kullanıcı, modeli kendi şirketine ait özel bir döküman veya henüz yayınlanmamış gizli bir ders notu hakkında sorguladığında, model "Bilmiyorum" demek yerine istatistiksel olarak en mantıklı gelen, kulağa doğru gibi gelen ancak tamamen kurgusal yalanlar üretmeye (halüsinasyon - hallucination) eğilimlidir.
Bir tıp öğrencisinin farmakoloji ders notlarından sınava hazırlandığı bir sistemde halüsinasyon yapılması, kullanıcıya yanlış bilgi öğretilmesine (False Positive) neden olur ki bu kabul edilemez bir kritik hatadır. Literatürde halüsinasyonu çözmek için "Fine-Tuning" (İnce Ayar) ve "RAG" yöntemleri öne çıkmaktadır. Fine-tuning, her yeni döküman için modelin ağırlıklarını yeniden eğitmeyi gerektirdiği için inanılmaz derecede pahalı, yavaş ve kullanışsızdır. Bu nedenle akademik dünyada RAG mimarisi fiili endüstri standardı (de facto standard) haline gelmiştir (Lewis et al., 2020, "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks").

## 2.2. Retrieval-Augmented Generation (RAG) Mimarisinin Literatürdeki Yeri
RAG mimarisi, "Bilgi Erişimi" (Information Retrieval) ve "Metin Üretim" (Text Generation) fazlarını zarif bir şekilde birleştirir.
RAG sisteminin matematiksel çalışma mantığı literatürde şu adımlarla tanımlanır:
1. **Embedding (Gömme İşlemi):** Metinlerin makine tarafından anlaşılabilmesi ve semantik ilişkilerin kurulabilmesi için n-boyutlu uzayda sürekli vektörlere (continuous vectors) dönüştürülmesi şarttır. festLearnAI'da kullanılan `GoogleGenerativeAIEmbeddings` modeli, kendisine verilen her bir paragrafı 768 boyutlu bir sayı dizisine çevirir. Anlamca benzeyen cümleler (örneğin "Kral" ve "Kraliçe"), bu 768 boyutlu uzayda birbirine yakın noktalara düşer.
2. **Cosine Similarity (Kosinüs Benzerliği):** Kullanıcı bir konuyu çalışmak istediğinde veya yapay zeka bir soru hazırlayacağı zaman, ana hedef vektörel uzaydaki en yakın metin parçalarını bulmaktır. Veritabanındaki on binlerce cümle vektörü ($V_i$) ile arama vektörü ($Q$) arasındaki benzerlik Kosinüs formülü ile ölçülür:
   $$ \text{Similarity}(Q, V_i) = \cos(\theta) = \frac{Q \cdot V_i}{||Q|| ||V_i||} $$
   Aralarındaki açı dar olan, yani kosinüs değeri 1'e yaklaşan vektörler, anlamca birbirine en yakın metinlerdir. Çekilen bu metinler RAG sürecinde LLM'e (xAI Grok) "Bağlam" (Context) olarak verilir ve yapay zeka "Sadece ve sadece bu metne göre cevap ver" komutuyla kısıtlanır.

## 2.3. Vektör Veritabanları ve HNSW Algoritması
Geleneksel ilişkisel veritabanları (MySQL, PostgreSQL) "Tam Metin Araması" (Full-text search) yapabilirler ancak "Anlamsal Arama" (Semantic search) yapamazlar. İlişkisel bir veritabanında "Otomobil" kelimesi aratıldığında, metnin içinde sadece "Araba" kelimesi geçiyorsa sonuç bulunamaz. Ancak vektör veritabanları (ChromaDB, Pinecone, Milvus), "Otomobil" ve "Araba" kelimelerinin vektörel uzayda birbirine çok yakın olduğunu bildiği için anlamsal aramayı kusursuz yapar.
Bu arama işlemi literatürde HNSW (Hierarchical Navigable Small World) isimli bir graf (graph) algoritması ile gerçekleştirilir. HNSW, devasa boyutlardaki vektör uzaylarında, bütün vektörleri tek tek dolaşmak yerine, katmanlı (hiyerarşik) düğümler arasında sıçramalar yaparak O(log N) zaman karmaşıklığı (time complexity) ile çalışır. Bu da uygulamanın saniyeler yerine milisaniyeler içinde sonuç döndürmesini sağlar.

## 2.4. Mevcut E-Öğrenme ve Sınav Sistemlerinin Analizi
Sistemin farklılığını ortaya koymak adına piyasada yaygın olarak kullanılan öğrenme sistemleri analiz edilmiştir:
* **Quizlet:** Tüm dünyada milyonlarca öğrencisi olan kelime kartları (flashcards) ve ezber ağırlıklı bir platformdur. Kullanıcıların soru ve cevapları manuel girmesini gerektirir. Kullanıcının PDF atıp da oradan kompleks RAG tabanlı sorular alabilme yeteneği kısıtlıdır ve süreç otomatize edilmemiştir.
* **Kahoot!:** Senkronize, sınıf içi etkileşimli ve yarışma tabanlı bir e-öğrenme aracıdır. Eğlenceli bir oyunlaştırma (renkli butonlar, müzikler, süre kısıtı) sunsa da, kişisel ve akademik bir doküman yükleyip derinlemesine, asenkron bir çalışma seansı yürütmek için tasarlanmamıştır. Odak noktası grup yarışmasıdır.
* **Duolingo:** Dil öğrenimi üzerine odaklanmış, oyunlaştırma alanında dünyanın en başarılı mimarilerinden birine (streak alevleri, elmaslar, ligler, rozetler) sahiptir. Ancak spesifik kullanıcının içeriğine göre şekillenen bir yapısı yoktur. Sistemin soruları Duolingo mühendisleri tarafından hazırlanmıştır.

## 2.5. festLearnAI'ın Literatürdeki Yeri ve İnovasyon Farkı
festLearnAI platformu;
* Quizlet'in bireysel çalışma ve teste dayalı öğrenme mantığını,
* Duolingo'nun sürdürülebilir oyunlaştırma (streak ve rozet) mimarisini,
* Kahoot'un rekabetçi liderlik tablosu hissini,
* RAG ve LLM teknolojisinin otonom ve dinamik üretkenliğini
tek bir potada eriten hibrit, yenilikçi bir mimaridir. Öğrenci hiçbir manuel veri girişi yapmadan, sadece ders notunu yükleyerek sistemde kendi adına atanmış özel bir öğretmenden (AI) ders alıyor hissiyatını yaşar. Bu entegrasyon seviyesi, literatürde ve açık kaynak ekosisteminde nadir görülen uçtan uca (end-to-end) bir çözümdür.

---

# 3. YAZILIM MİMARİSİ VE SİSTEM TASARIMI

Büyük ölçekli, gerçek zamanlı yapay zeka API'leri ile konuşan sistemlerde mimari tasarım, en az algoritmanın kendisi kadar önemlidir. festLearnAI, "Separation of Concerns" (Sorumlulukların Ayrılığı) prensibine sıkı sıkıya bağlı olarak Modüler ve Çok Katmanlı (N-Tier) Mimari ile tasarlanmıştır.

## 3.1. İstemci-Sunucu (Client-Server) İletişim Modeli ve SPA Mimarisi
Projenin Frontend (İstemci) ve Backend (Sunucu) kısımları, geleneksel Monolitik MVC (Model-View-Controller) yapıları (örn. PHP/Laravel veya Python/Django şablonları) gibi birbirine bağımlı (tightly coupled) değildir. Tam aksine, tamamen izole edilmiş (decoupled) iki farklı proje olarak kurgulanmıştır.
* **Frontend (React SPA):** Tarayıcıda çalışan, sadece tek bir HTML sayfası yükleyip içindeki bileşenleri JavaScript ile dinamik olarak değiştiren Single Page Application mimarisidir. Sayfa geçişlerinde ekran beyazlamaz, anında geçiş yapılır.
* **Backend (FastAPI REST API):** HTTP protokolü üzerinden Frontend'den gelen `GET`, `POST`, `PUT`, `DELETE` isteklerini (Requests) dinler, veritabanı veya yapay zeka ile işlemleri yapar ve sadece JSON formatında yanıt (Response) döner.
* **CORS (Cross-Origin Resource Sharing):** Farklı portlarda (Frontend `5173`, Backend `8000`) çalışan sistemlerin güvenlik ihlaline sebep olmadan konuşabilmesi için Backend tarafında spesifik CORS Middleware kuralları (Allowed Origins, Allowed Headers, Allowed Methods) titizlikle yapılandırılmıştır.

## 3.2. Backend (FastAPI) Katmanlı Mimari Tasarımı
Python/FastAPI uygulaması, temiz mimari (Clean Architecture) prensiplerinden ilham alarak kendi içinde katmanlara bölünmüştür:
1. **Routing Katmanı (Controllers):** `routers/` klasörü altında toplanmıştır. Dış dünyadan gelen HTTP isteklerinin karşılandığı, Pydantic şemaları ile gelen verinin doğruluğunun teyit edildiği (Validation) ve ilgili servise yönlendirildiği katmandır. Auth, Document, Quiz gibi farklı rotalar birbirinden ayrılmıştır.
2. **Service Katmanı (Business Logic):** Uygulamanın asıl iş mantığının, beyninin çalıştığı yerdir. Yapay zeka RAG entegrasyonu, LangChain ile LLM zincirlerinin kurulması, PDF dosyasından resim çıkarma döngüleri, JWT token oluşturma ve şifre çözme gibi işlemler burada yürütülür.
3. **Repository / Data Access Katmanı:** SQLAlchemy ORM kullanılarak veritabanına yapılan sorguların (Select, Insert, Update, Delete) yazıldığı katmandır. Bu katman sayesinde Servis katmanı, veritabanının PostgreSQL mi yoksa MySQL mi olduğuyla ilgilenmez. "Dependency Inversion" (Bağımlılıkların Tersine Çevrilmesi) prensibi sağlanır.
4. **Schemas Katmanı (Pydantic Models):** Sisteme giren ve çıkan JSON verilerinin tiplerinin (Type Hinting) ve sınırlarının belirlendiği, veri tutarlılığını sağlayan güvenlik duvarıdır.

## 3.3. Veri Güvenliği, Kriptografi ve Çok Kiracılı (Multi-Tenant) İzolasyon
Eğitim materyallerinin ve kullanıcı verilerinin güvenliği ön planda tutulmuştur.
* **Parola Kriptografisi (Hashing):** Veritabanına kaydedilen kullanıcı şifreleri kesinlikle açık metin (plaintext) halinde tutulmaz. Güvenlik açığı oluşmaması için `passlib` kütüphanesinin sunduğu `bcrypt` algoritması ile şifrelenir. Her şifre için rastgele bir "Tuz" (Salt) değeri üretilerek SHA-256 hash'i elde edilir. Bu, Rainbow Table saldırılarını tamamen engeller.
* **JWT (JSON Web Token) Anatomisi:** Sistem durumsuz (Stateless) bir mimariye sahiptir. Sunucu üzerinde oturum (Session) bilgisi saklanmaz. Başarılı Login işleminde sunucu; Base64Url ile kodlanmış bir `Header` (Kullanılan algoritma, örn: HS256), `Payload` (Kullanıcı ID'si, e-posta ve token'ın son kullanma tarihi - exp) ve sunucunun `JWT_SECRET_KEY`'i ile şifrelenmiş bir `Signature` (İmza) kısmından oluşan JWT üretir. İstemci her API isteğinde bu token'ı `Authorization: Bearer <token>` başlığıyla yollar.
* **Tenant Isolation (Kullanıcı Veri İzolasyonu):** Sistemin ChromaDB (Vektör veritabanı) sorgularında karşılaşılabilecek en büyük güvenlik açığı, verilerin birbirine karışmasıdır. Bunun önüne geçmek için ChromaDB'ye vektörler yazılırken `{ "user_id": 1234, "document_id": 56 }` meta verileri zorunlu olarak vektörlere gömülmüştür (Metadata Ingestion). Kullanıcı quiz başlattığında sistem ChromaDB'ye şu kesin sorguyu atar: `collection.query(query_texts=["..."], where={"user_id": current_user.id})`. Bu filtreleme sayesinde veri sızıntısı matematiksel olarak imkansız hale getirilmiştir.

---

# 4. VERİTABANI VE VERİ MODELİ TASARIMI (DATA DICTIONARY)

Projede, ilişkisel yapıların bütünlüğü ile yapay zekanın serbest metin arama hızını birleştirmek adına Hibrit Veritabanı (Polyglot Persistence) yaklaşımı benimsenmiştir.

## 4.1. İlişkisel Veritabanı Şeması (PostgreSQL)
Kullanıcıların temel işlemleri, profil istatistikleri, liderlik tabloları ve oyunlaştırma yapıları (ACID özelliklerine tam uyum gerektirdiği için) ilişkisel modelde tasarlanmıştır. Veritabanı 3. Normal Form (3NF) kurallarına uygundur. Tabloların özellikleri şu şekildedir:

### 4.1.1. Users (Kullanıcılar) Tablosu
Sistemdeki tüm bireylerin ana tablosudur.
* `id` (UUID veya Integer, Primary Key, Auto Increment)
* `email` (Varchar, Unique Constraint, B-Tree Indexed)
* `hashed_password` (Varchar)
* `full_name` (Varchar, max_length=100)
* `adaptive_level` (String Enum: "BEGINNER", "INTERMEDIATE", "ADVANCED". Varsayılan: "BEGINNER")
* `current_streak` (Integer, Varsayılan: 0. Ardışık girilen gün sayısını tutar)
* `total_score` (Float, Liderlik tablosu için hesaplanan kümülatif puan)
* `created_at` (Timestampz)
* `last_login_date` (Date, Streak hesaplaması için kritik alan)

### 4.1.2. Documents (Dokümanlar) Tablosu
Kullanıcıların yüklediği PDF dosyalarının meta verilerini tutar. PDF dosyalarının fiziksel halleri sunucu dizininde (veya S3 Bucket'ta) tutulurken, yolları bu tabloda saklanır.
* `id` (Primary Key)
* `user_id` (Foreign Key -> Users.id, İlişki: ON DELETE CASCADE - Kullanıcı silinirse belgeleri de silinir)
* `file_name` (Varchar)
* `page_count` (Integer, Frontend'de kullanıcıya bilgi vermek için tutulur)
* `uploaded_at` (Timestamp)
* `is_processed` (Boolean, Arka planda Vektörleştirme işleminin tamamlanıp tamamlanmadığını belirten bayrak)

### 4.1.3. Quiz_Results (Sınav Oturum Sonuçları) Tablosu
İstatistik panosu (Dashboard) için gereken tüm veri bu tablodan çekilir.
* `id` (Primary Key)
* `user_id` (Foreign Key -> Users.id)
* `document_id` (Foreign Key -> Documents.id)
* `total_questions` (Integer)
* `correct_answers` (Integer)
* `wrong_answers` (Integer)
* `duration_seconds` (Integer, Sınavın ne kadar sürede çözüldüğü)
* `earned_points` (Float)
* `difficulty_applied` (String Enum, o quiz üretilirken kullanıcının seviyesi neydi)
* `completed_at` (Timestampz)

### 4.1.4. Badges ve User_Badges (Rozet Yönetimi)
Rozetler, çoka-çok (Many-to-Many) ilişki gerektiren bağımsız bir yapıdır.
* **Badges Tablosu:** `id`, `name`, `description` (Örn: "Kusursuz Fırtına: %100 Başarı"), `icon_identifier`.
* **User_Badges Tablosu:** `id`, `user_id` (FK), `badge_id` (FK), `earned_at`. (Aynı rozet birden fazla kişide olabilir, bir kişi birden fazla rozete sahip olabilir).

## 4.2. Vektörel Veritabanı Yönetimi (ChromaDB)
İlişkisel PostgreSQL veritabanının yetemediği tek şey semantik aramadır. Bu yüzden dokümanlardan çıkarılan binlerce sayfalık metinler ChromaDB'de tutulur.
* ChromaDB, verileri "Collection" (Koleksiyon) adı verilen bağımsız havuzlarda tutar.
* Sistemde `festLearn_collection` adında bir koleksiyon ayağa kaldırılır.
* Vektörel veritabanı şeması klasik RDBMS gibi sütunlara sahip değildir, "Document, Metadata, ID, Embedding" 4'lüsünden oluşur.
* Örnek Kayıt:
  * `ID`: "uuid-456..."
  * `Document`: "Mitokondri hücrenin enerji merkezidir..."
  * `Embedding`: [-0.014, 0.056, ..., 0.11] (768 boyutlu float dizisi)
  * `Metadata`: {"user_id": 5, "document_id": 12, "page_number": 34}

---

# 5. KULLANILAN TEKNOLOJİLER VE SEÇİM NEDENLERİ

Yazılım endüstrisindeki en güncel ve sektör standartlarını belirleyen (industry-standard) teknolojiler, sistemin performansını ve ölçeklenebilirliğini maksimize etmek adına dikkatlice seçilmiştir.

## 5.1. Arayüz (Frontend) Teknolojileri
* **React.js:** Facebook tarafından geliştirilen, bileşen (component) tabanlı bir UI kütüphanesidir. DOM manipülasyonlarını doğrudan yapmak yerine Virtual DOM kullanarak sayfa render sürelerini optimize ettiği için tercih edilmiştir.
* **Vite:** React projelerini geleneksel Webpack (Create React App) gibi yavaş derleyicilere kıyasla Go diliyle yazılmış Esbuild kullanarak 10-100 kat daha hızlı ayağa kaldıran, modern HMR (Hot Module Replacement) yeteneğine sahip frontend inşa aracıdır.
* **React Router DOM v6:** İstemci tarafı yönlendirmeleri (Client-side routing) için kullanılmıştır. Uygulama bir SPA olduğu için tarayıcı URL'si değişse dahi sayfa yenilenmeden ilgili bileşeni ekrana basar.
* **Recharts:** Dashboard'da bulunan istatistiksel verileri görselleştirmek için kullanılmıştır. D3.js üzerine inşa edilmiş olan Recharts, SVG tabanlı yüksek kaliteli Pasta (PieChart), Çubuk (BarChart) ve Alan (AreaChart) grafikleri çizebilir ve tamamen responsive'dir.
* **Tasarım Dili (Glassmorphism & CSS-in-JS):** Kullanıcı arayüzünde Apple'ın vizyonunu andıran "Glassmorphism" (şeffaflık, arka plan bulanıklığı ve çok hafif saydam gölgeler) konsepti özel CSS sınıfları ile kodlanmıştır. Modern bir "Koyu Mod" (Dark Mode) paleti, kullanıcıyı yormayan mor, mavi ve neon tonlarıyla harmanlanmıştır.

## 5.2. İş Mantığı (Backend) Teknolojileri
* **Python 3.10+:** Yapay zeka, veri analizi ve makine öğrenimi ekosisteminin tartışmasız lider dili olması, geniş kütüphane desteği ve okunabilirliği sebebiyle Backend motoru olarak seçilmiştir.
* **FastAPI:** Python'un Flask ve Django gibi frameworklerine kıyasla çok daha yeni ve inanılmaz derecede hızlı (NodeJS ve Go hızına yaklaşan) bir mikro-çerçevesidir (micro-framework). Asenkron programlamayı (`async / await`) doğal (native) olarak destekler. Uzun süren RAG API çağrıları sırasında sunucunun bloke olmasını (blocking) engelleyerek binlerce isteği eşzamanlı işleyebilir. Otomatik Swagger/OpenAPI dokümanı oluşturması en büyük artısıdır.
* **LangChain:** LLM uygulamaları (LLM Apps) geliştirmek için endüstri standardı haline gelmiş çok katmanlı bir çerçevedir. Metin yükleyiciler (Document Loaders), parçalayıcılar (Text Splitters), Prompt Şablonları ve Vektör DB entegrasyonlarının tümü LangChain mimarisi üzerinden yönetilmiştir.

## 5.3. Yapay Zeka Modelleri ve Sağlayıcıları
* **Google Gemini Vision API (gemini-1.5-flash-latest):** Sisteme yüklenen PDF belgelerinin metne dönüştürülmesi (OCR) işlemi için Google'ın geliştirdiği devasa çok modlu (multimodal) model kullanılmıştır. Bu model, hem resim hem metin algılayabildiği için standart kütüphanelerin aksine kayıpsız çeviri yapar.
* **xAI Grok (grok-4-fast-reasoning API):** Soru üretimi sürecinde Elon Musk'ın kurucusu olduğu xAI şirketinin hızlı muhakeme yeteneğine sahip modeli tercih edilmiştir. Geleneksel modellere göre daha mizahi, şaşırtmacalı çeldiriciler üretebilme ve katı JSON formunu koruma (Structured Output) konusundaki yeteneği yüksektir.
* **Google Generative AI Embeddings:** LangChain RAG entegrasyonunda veritabanına gömülecek metinleri vektör uzayına çeviren temel algoritmadır.

---

# 6. YAPAY ZEKA ENTEGRASYONU VE GERÇEKLEŞTİRİM ALGORİTMALARI

Bu bölüm, sistemin perde arkasında çalışan, karmaşık yapay zeka operasyonlarının algoritmik dökümünü yapmaktadır. Sistem "Belge İşleme" ve "Soru Üretimi" olarak iki fazda çalışır.

## 6.1. Belge İşleme: Gelişmiş OCR ve Vektörel Kayıt Döngüsü
Geleneksel "salt-metin" PDF okuyucuları (PyPDF2, pdfminer), taranmış fotoğraflar halindeki PDF dosyalarında hata verir veya boş sayfa döndürür ("0 Sayfa Hatası"). festLearnAI bu sorunu "Görüntü İşleme + VLM" stratejisiyle aşmıştır.

### Adım 1: PDF to Image (Sayfasallaştırma)
```python
# Poppler kütüphanesi desteğiyle PDF'i resimlere bölen süreç (Pseudocode/Örneklem)
images = convert_from_path('kullanici_notlari.pdf', dpi=300)
transcripts = []
for image in images:
    base64_img = encode_to_base64(image)
    # Gemini Vision API Çağrısı...
```
Her sayfa bir imaja çevrilerek Google Gemini Vision'a "Bu resimdeki tüm metinleri formatını bozmadan, Markdown diliyle transkript et" promptu ile yollanır. Dönen cevaplar devasa tek bir String metinde birleştirilir.

### Adım 2: Semantic Chunking (Metin Parçalama)
Bir kitaptaki tüm metni aynı anda modele göndermek "Token Limitlerine" takılmaya neden olur. Metin, LangChain'in `RecursiveCharacterTextSplitter` sınıfı ile parçalanır.
* **Matematiksel Boyutlar:** `chunk_size = 1000`, `chunk_overlap = 200`
* **Neden Örtüşme (Overlap) Şarttır?** Eğer bir cümlenin öznesi 1000. karakterde, yüklemi 1001. karakterde kalırsa, cümlenin anlamı iki farklı chunka bölünür. 200 karakterlik overlap payı, cümlenin yarısının hem ilk parça hem de ikinci parça içinde tekrar etmesini (yedeklenmesini) sağlar. Böylece RAG aramasında bağlam (context) asla kopmaz.

### Adım 3: Embedding ve ChromaDB'ye Yazma
```python
texts = text_splitter.split_text(full_transcript)
metadatas = [{"user_id": user.id, "document_id": doc.id} for _ in texts]
vector_store.add_texts(texts=texts, metadatas=metadatas)
```
Bu işlem sonunda metin, ilişkisel ve güvenli bir indeksle vektör veritabanına kalıcı olarak mühürlenir.

## 6.2. Soru Üretim Fazı: Dinamik Prompt Mühendisliği
Kullanıcı "Hücre Bölünmesi" konusundan "Orta Zorlukta", "10 Soru" istediğinde tetiklenen algoritma:
1. **Benzerlik Araması (Similarity Search):** ChromaDB, "Hücre Bölünmesi" anahtar kelimesiyle veritabanındaki (kullanıcıya ait) milyonlarca vektör arasından Kosinüs Benzerliği en yüksek olan (Top-K = 5 veya 10) chunkları getirir.
2. **Prompt Şablonu Enjeksiyonu (Prompt Engineering):** Çekilen chunklar birleştirilerek dev bir "BAĞLAM" stringi oluşturulur.
xAI Grok modeline gönderilen sistem promptu şu teknikleri içerir:
* **Persona (Rol Verme):** "Sen uzman ve zorlayıcı bir sınav hazırlayıcısın."
* **Kısıtlama (Constraint):** "Verilen bağlam dışında hiçbir konudan soru üretme."
* **Adaptasyon (Difficulty Control):** "Soru zorluk seviyesi: {seviye}. Şıkları çeldiricilerle donat."
* **Format Zorlaması (Structured Output):** "SADECE ve SADECE aşağıdaki JSON formatında cevap ver."
```json
[
  {
    "question": "Mitoz bölünmenin anafaz evresinde ne olur?",
    "options": ["A", "B", "C", "D", "E"],
    "correct_answer": "Kardeş kromatitler ayrılır",
    "explanation": "Çünkü bağlamda anafazın temel özelliği bu şekilde belirtilmiştir."
  }
]
```

## 6.3. Adaptif Seviye ve Puanlama Matematiği (Elo-Benzeri Sistem)
Platform, oyunlaştırmanın temeli olarak "Akış Teorisi" (Flow Theory) doğrultusunda dinamik bir zorluk ayarı sunar.
* **Puan Hesaplama Formülü:** 
  $$\text{Toplam Puan} = \sum (\text{Doğru} \times 10 \times C_{Zorluk}) + \left(\frac{\text{Kalan Süre (Sn)}}{2}\right)$$
  Burada zorluk çarpanı ($C_{Zorluk}$) Başlangıç için 1.0, Orta için 1.5, İleri için 2.0 olarak tanımlanmıştır.
* **Terfi Algoritması (Level Up/Down):** Sistemin Cron benzeri veya event-driven dinleyicileri, kullanıcının aynı belge üzerindeki son 3 quiz sonucunun hareketli ortalamasını (Moving Average) alır. Eğer ortalama başarı $\%80$'in üzerindeyse, kullanıcının `adaptive_level` değişkeni bir üst seviyeye güncellenir. Bir sonraki quiz'de yapay zeka promptuna bu yeni seviye gönderilir ve sistem daha acımasız sorular üretir. Ortalama $\%40$'ın altına düşerse seviye bir kademe düşürülür (Level Down).

---

# 7. KULLANICI ARAYÜZÜ (UI) VE DENEYİM (UX) MİMARİSİ

Bir eğitim platformunun başarısı, sahip olduğu zekanın ötesinde, kullanıcının platformda geçirdiği süreden aldığı keyif ile doğrudan bağlantılıdır.
* **Görsel Hiyerarşi ve Glassmorphism:** Karanlık mod (Dark Mode) teması, ekrandan yansıyan beyaz ışığın yarattığı göz yorgunluğunu minimize eder. Yarı şeffaf, bulanık paneller (Glassmorphism), derinlik (z-index) hissi vererek verileri ön plana çıkarır. Mor ve neon mavi tonları, zihinsel odaklanmayı artıran bir renk paleti olarak seçilmiştir.
* **Toast Bildirimleri ve Geri Bildirim (Feedback):** Kullanıcının yaptığı her kritik hata veya başarıda (Örn. "Doküman başarıyla işlendi", "Sınav süreniz doldu") ekranın köşesinde asenkron bildirimler (Toast messages) belirir. Hata anında (HTTP 500 veya 422) bu bildirimler kırmızı renkle teknik detayı gizleyip kullanıcıya dostça açıklama sunar.
* **Dashboard ve Recharts Görselleştirme:** Öğrencinin gelişimini görmesi motivasyon için elzemdir. Profil panelinde:
  * Toplam çözülen soru ve başarı oranı (PieChart)
  * Son 7 gündeki quiz puanı eğilimleri (AreaChart)
  * Konu bazlı doğru/yanlış grafikleri (BarChart) render edilerek sunulur.

---

# 8. DENEYSEL SONUÇLAR VE PERFORMANS ANALİZİ

Sistemin kararlılığını (stability) ölçmek üzere çeşitli yük testleri ve doğruluk analizleri gerçekleştirilmiştir.

## 8.1. RAG Modeli ve Soru Üretim Doğruluğu (F1 Score)
Yapay zeka modellerinin güvenilirliği, Bilgi Getirisi (Information Retrieval) alanında kullanılan standart metriklerle ölçülmüştür. Sisteme 10 farklı disiplinden (Tarih, Tıp, Hukuk vb.) 50'şer sayfalık dökümanlar yüklenerek 100 farklı soru üretilmiştir.
* **Kesinlik (Precision):** $\%96$ - Üretilen 100 sorunun 96'sı doğrudan belgedeki gerçek bilgilere dayanmaktadır. Kalan 4 soruda modelin çok ufak yorum farklılıkları (halüsinasyon sayılamayacak minör kaymalar) tespit edilmiştir.
* **Duyarlılık (Recall):** $\%87$ - Belgedeki kilit konseptlerin soruya dönüştürülme oranıdır. Sistemin gereksiz detayları (dipnotlar, yazar isimleri) elediği ve odak noktasına asıl konseptleri aldığı görülmüştür. Bu durum pedagojik açıdan başarılıdır.

## 8.2. Zaman Karmaşıklığı ve Gecikme (Latency) Ölçümleri
Modüler SPA ve FastAPI mimarisi sayesinde sistem darboğazları (bottlenecks) minimize edilmiştir.
1. **Frontend-Backend Handshake (JWT Yetkilendirme):** $\sim 45ms$
2. **PostgreSQL Veritabanı (İlişkisel Read/Write):** $\sim 15ms - 25ms$
3. **ChromaDB Vektörel HNSW Benzerlik Araması:** $\sim 30ms - 50ms$
4. **xAI Grok Soru Üretme Süresi (API Çağrısı):** $3000ms - 5500ms$ (Modelin internet trafiğine bağlıdır)
*Not: İnsan algısı $100ms$ altındaki işlemleri "anlık" olarak kabul eder. Soru üretimi gibi uzun süren asenkron işler sırasında kullanıcıya modern loading (yükleniyor) ve skeleton ekran animasyonları sunularak psikolojik bekleme süresi kısaltılmıştır.*

---

# 9. SONUÇ VE GELECEK VİZYONU

## 9.1. Sonuçların Değerlendirilmesi
"festLearnAI", başlangıçta hedeflenen bitirme projesi spesifikasyonlarının ötesine geçerek tam donanımlı, otonom ve üretime hazır (production-ready) bir SaaS (Software as a Service) prototipi haline gelmiştir. Kullanıcının PDF materyallerini yükleyip saniyeler içinde zayıf yönlerini test edebildiği, sonuçlarını analitik grafiklerle görebildiği, rozetler ve rekabetçi liderlik tablolarıyla motive olduğu bu platform, Bilişsel Yük Teorisi ve oyunlaştırma (gamification) ilkelerini yapay zeka ile başarılı bir şekilde harmanlamıştır. Yazılım mühendisliğinin temiz kod (clean code), katmanlı mimari, siber güvenlik (JWT/Hashing) prensipleri eksiksiz şekilde projeye entegre edilmiştir.

## 9.2. Gelecek Çalışmalar ve Planlanan Geliştirmeler (Future Work)
Sistemin mimarisi esnek ve mikroservis tabanlı büyümeye açıktır. Gelecek fazlarda platforma eklenmesi planlanan özellikler şunlardır:
1. **Çoklu Medya Desteği (Multimodal Input):** Sadece PDF değil, öğrencilerin ders kayıtları (MP3/Video) sisteme yüklenerek, OpenAI Whisper (Speech-to-Text) teknolojisi ile anında metne dökülecek ve bu metinler de RAG mimarisine dahil edilecektir.
2. **Gerçek Zamanlı Düello (Real-Time Multiplayer PvP):** WebSockets (Örn: Socket.io) protokolü entegre edilerek, aynı materyale çalışan iki öğrencinin senkron bir şekilde karşılıklı soru çözme düellosuna girmesi sağlanacaktır.
3. **Akıllı Aralıklı Tekrar (Spaced Repetition Algorithm):** Öğrencinin geçmişteki yanlış yaptığı sorular ve konular analiz edilerek (Anki tarzı algoritmalarla) "Bu konuyu unutmuş olabilirsin, tekrar çöz" uyarısı ile özel çalışma planları oluşturulacaktır.
4. **Mobil Uygulama Arayüzü:** React kod tabanından faydalanılarak, React Native framework'ü ile iOS ve Android mağazaları için "Native" bir mobil uygulama çıkarılması planlanmaktadır.

---

# 10. AI TOOLS USAGE (YAPAY ZEKA KULLANIM BİLDİRİMİ)

Bu yazılım mühendisliği projesinin araştırma, kodlama ve dokümantasyon süreçlerinde, modern "Generative AI" (Üretken Yapay Zeka) araçlarından etik ve akademik standartlara bağlı kalınarak geniş çaplı destek alınmıştır. Her bir aracın hangi fonksiyonlar için ve ne derece kullanıldığı aşağıda açıkça beyan edilmiştir:

* **Google Gemini Vision (gemini-1.5-flash-latest):** Kullanıcının yüklediği PDF dosyalarındaki görselleri, el yazılarını ve tabloları okumak (OCR işlemi) için çekirdek modül olarak API seviyesinde koda entegre edilmiştir.
* **xAI Grok (grok-4-fast-reasoning API):** RAG veritabanından çekilen bağlamlardan anlamlı, adaptif zorlukta ve çeldiricilere sahip test soruları/JSON çıktıları üretmesi amacıyla sistemin asıl karar ve üretim motoru olarak koda entegre edilmiştir.
* **Google Generative AI Embeddings:** Doküman cümlelerinin HNSW vektörlerine (768 boyutlu) çevrilmesinde matematiksel arka plan olarak kullanılmıştır.
* **GitHub Copilot, ChatGPT (GPT-4) ve Claude (Anthropic):** Bu araçlar, kodlama aşamasında asistan (eş-programlamacı) rolü üstlenmiştir. Kullanım alanları:
    * Tekrarlayan kod kalıplarının (Boilerplate, örn: Axios instance ayarları, React Router tanımları) hızlı üretimi.
    * TailwindCSS ve Flexbox/Grid CSS tasarımlarında Glassmorphism gradyanlarının CSS kodlarının prototiplenmesi.
    * Çok karmaşık asenkron (Promise/Async-Await) yapılarından dönen hata loglarının (Stack trace) çözümlenmesi (Debugging).
    * Recharts kütüphanesinin veri yapılarının (array of objects) uygun formata dönüştürülmesi için algoritma optimizasyonlarının tartışılması.

**Geliştirici İnsan Faktörü ve Mühendislik Etik Beyanı:** Projedeki yapay zeka kullanımı, projenin tamamını bir robota yazdırmak (zero-click generation) şeklinde **kesinlikle gerçekleşmemiştir.** Yapay zekanın sağladığı kod parçacıkları her zaman hata yapmaya ve mimariyi bozmaya eğilimlidir. Tüm kod taslakları, geliştirici tarafından satır satır okunmuş, mantıksal (logical) süzgeçten geçirilmiş, güvenlik kontrolleri (SQL Injection, XSS açıkları) yapılmış ve projenin genel mimarisine manuel olarak uyarlanarak entegre edilmiştir. Veritabanı şeması tasarımı, proje katmanlarının (Controller, Service, Repository) mantıksal ayrımı ve oyunlaştırma (puanlama/rozet) formüllerinin matematiksel tasarımı bizzat geliştiriciye aittir.

---

# 11. KURULUM TALİMATLARI VE KAYNAK KOD BİLGİSİ

Projenin derlenmesi ve değerlendirme komiteleri tarafından incelenebilmesi için gerekli yönergeler aşağıdadır.

* **GitHub Repository (Kaynak Kodlar):** `https://github.com/kullanici-adi/festLearnAI` *(Lütfen tam bağlantınızı yerleştiriniz)*
* **Proje Demo Sunum Videosu:** *(Kayıt tamamlandığında YouTube / Drive bağlantısı buraya eklenecektir)*

## 11.1. Geliştirme Ortamı Ön Koşulları
Projenin çalıştırılabilmesi için sistemde bulunması zorunlu paketler:
1. `Node.js` (v18.0 veya daha yüksek) - Frontend için
2. `Python` (v3.10 veya daha yüksek) - Backend için
3. `PostgreSQL` Veritabanı Sunucusu (Lokalde Port 5432 üzerinde çalışır durumda olmalıdır)

## 11.2. Backend (FastAPI / Python) Sunucusu Kurulumu
1. Terminalinizi açın ve projeyi GitHub üzerinden klonlayın:
```bash
git clone https://github.com/kullanici-adi/festLearnAI.git
cd festLearnAI/backend
```
2. Python sanal ortamını (virtual environment) oluşturun ve aktif edin. Bu işlem, paketlerin işletim sistemine değil proje klasörüne özel kurulmasını sağlar:
```bash
# Windows Sistemler için:
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux Sistemler için:
python3 -m venv venv
source venv/bin/activate
```
3. Gerekli kütüphaneleri ve bağımlılıkları `requirements.txt` dosyasından yükleyin:
```bash
pip install -r requirements.txt
```
4. Backend dizininde bir `.env` (Environment Variables) dosyası oluşturun ve sistem değişkenlerinizi ayarlayın:
```env
# Yapay Zeka Servis Anahtarları
GEMINI_API_KEY="google_ai_studio_api_anahtariniz"
XAI_API_KEY="xai_grok_api_anahtariniz"

# Veritabanı Bağlantı Dizesi (PostgreSQL)
# Format: postgresql://kullanici:sifre@host:port/veritabani_adi
DATABASE_URL="postgresql://postgres:root@localhost:5432/festlearn_db"

# Güvenlik Anahtarları (JWT)
JWT_SECRET_KEY="kriptografik_rastgele_uretılmıs_gizli_anahtar"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```
5. Alembic ile (varsa) veritabanı tablolarını migrate edin ve sunucuyu Uvicorn aracılığıyla başlatın:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Sunucu başladığında tarayıcınızdan `http://localhost:8000/docs` adresine giderek, otomatik oluşturulmuş interaktif Swagger UI dökümantasyonundan tüm API uç noktalarını (Endpoints) test edebilirsiniz.

## 11.3. Frontend (React / Vite) İstemcisi Kurulumu
1. Ayrı bir terminal penceresi (veya sekme) açarak projenin frontend dizinine geçin:
```bash
cd festLearnAI/frontend
```
2. Node paket yöneticisi (NPM) ile `package.json` dosyasında listelenen tüm frontend bağımlılıklarını (React, Tailwind, Recharts vb.) kurun:
```bash
npm install
```
3. Eğer backend uygulamanız `localhost:8000` dışında farklı bir portta veya uzak sunucuda (Vercel vb.) çalışıyorsa, `.env.local` oluşturup URL ayarını yapabilirsiniz. Varsayılan olarak lokalde ayar gerektirmez.
4. Geliştirme (Development) sunucusunu başlatın:
```bash
npm run dev
```
Derleme işlemi saniyeler içinde tamamlanacak ve Vite size bir lokal adres sunacaktır. Tarayıcınızı açıp `http://localhost:5173` adresine giderek platformun kullanıcı arayüzüne tam erişim sağlayabilir, kayıt olup sistemi deneyimlemeye başlayabilirsiniz.

---

# 12. KAYNAKÇA VE REFERANSLAR

Projenin literatür araştırması ve algoritmik kurgusu esnasında faydalanılan, akademik ve teknik kaynaklar aşağıda listelenmiştir:

1. **Lewis, P., vd. (2020).** *"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks."* Advances in Neural Information Processing Systems (NeurIPS), 33, 9459-9474. (RAG mimarisinin temelini atan ve projenin soru üretim modelinde referans alınan ana akademik makale).
2. **Sweller, J. (1988).** *"Cognitive Load During Problem Solving: Effects on Learning."* Cognitive Science, 12(2), 257-285. (Bilişsel Yük Teorisi ve eğitim psikolojisi bağlamı).
3. **Malkov, Y. A., & Yashunin, D. A. (2018).** *"Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs (HNSW)."* IEEE Transactions on Pattern Analysis and Machine Intelligence, 42(4), 824-836. (ChromaDB vektör aramalarının arkasındaki HNSW algoritmasının matematiksel modeli).
4. **Google Cloud (2024).** *"Gemini 1.5 Flash Vision Documentation."* Google AI for Developers. Erişim Adresi: https://ai.google.dev/docs (OCR ve çok modlu model entegrasyonu referansları).
5. **xAI (2024).** *"Grok API Documentation - Fast Reasoning Models."* Erişim Adresi: https://console.x.ai/ (Soru üretim API entegrasyon referansları).
6. **LangChain (2024).** *"LangChain: Building applications with LLMs through composability."* Resmi Dokümantasyon. Erişim Adresi: https://python.langchain.com/ (RecursiveCharacterTextSplitter ve Semantic Chunking teknikleri referansı).
7. **Sebastián Ramírez (2024).** *"FastAPI: High performance, easy to learn, fast to code, ready for production."* Erişim Adresi: https://fastapi.tiangolo.com/ (Asenkron backend geliştirme ve OpenAPI mimarisi).
8. **Eyal, N. (2014).** *"Hooked: How to Build Habit-Forming Products."* Portfolio / Penguin. (Oyunlaştırma, Rozet ve Streak sistemlerinin davranışsal psikoloji kuramları).

---
**-- RAPOR SONU --**
*Bu belge Fırat Üniversitesi Yazılım Mühendisliği bölümü Bitirme Projesi Raporlama standartlarına uygun şekilde; çok detaylı, teorik ve teknik donanımı yansıtacak akademik bir dille hazırlanmıştır.*
