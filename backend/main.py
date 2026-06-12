from fastapi import FastAPI, UploadFile, File, Query, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
import shutil
import os
import uvicorn
import datetime
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List

from database import engine, Base, get_db, User, QuizHistory, Badge, UserBadge, Document, PasswordResetToken, seed_badges
from rag_service import ingest_pdf, generate_quiz_from_db, evaluate_open_ended_answers

# Uygulama başlarken tabloları oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(title="festLearnAI - AI Teacher Backend")

# React/Frontend bağlantısı için CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Başlangıçta rozetleri seed et
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_badges(db)
    db.close()

# --- Şifre Yardımcıları ---
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

# --- E-posta Gönderme ---
def send_reset_email(to_email: str, reset_token: str):
    """Şifre sıfırlama e-postası gönderir."""
    smtp_email = os.environ.get("SMTP_EMAIL")
    smtp_password = os.environ.get("SMTP_APP_PASSWORD")
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
    
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "🔑 festLearnAI - Şifre Sıfırlama"
    msg["From"] = smtp_email
    msg["To"] = to_email
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #1a1f35; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 8px;">🧠</div>
            <h2 style="color: #818cf8; margin: 0;">festLearnAI</h2>
        </div>
        <p style="color: #f1f5f9; font-size: 15px;">Merhaba,</p>
        <p style="color: #94a3b8; font-size: 14px;">Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
        <div style="text-align: center; margin: 28px 0;">
            <a href="{reset_link}" 
               style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; 
                      padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Şifremi Sıfırla
            </a>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">Bu link 1 saat geçerlidir.</p>
        <hr style="border: none; border-top: 1px solid #2a3050; margin: 20px 0;">
        <p style="color: #64748b; font-size: 11px; text-align: center;">Bu talebi siz yapmadıysanız bu e-postayı görmezden gelin.</p>
    </div>
    """
    
    msg.attach(MIMEText(html_content, "html"))
    
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_string())

# --- Pydantic Modelleri ---
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    first_name: str
    last_name: str
    birth_date: str = ""
    gender: str = ""
    terms_accepted: bool = False
    kvkk_accepted: bool = False

class LoginRequest(BaseModel):
    email_or_username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class SaveScoreRequest(BaseModel):
    user_id: int
    topic: str
    score: float
    total_questions: int = 5
    correct_answers: int = 0
    time_spent: int = 0

class EvaluateAnswerRequest(BaseModel):
    question: str
    expected_answer: str
    student_answer: str
    keywords: List[str] = []

class EvaluateAnswersBatchRequest(BaseModel):
    answers: List[dict]

# --- API ENDPOINT'LERİ ---

@app.get("/")
def home():
    return {"status": "Online", "message": "festLearnAI Backend is Live!"}

# ========== KULLANICI İŞLEMLERİ ==========

@app.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydeder."""
    # Validasyonlar
    if not req.terms_accepted:
        raise HTTPException(status_code=400, detail="Kullanıcı sözleşmesini kabul etmelisiniz.")
    if not req.kvkk_accepted:
        raise HTTPException(status_code=400, detail="KVKK / Gizlilik politikasını kabul etmelisiniz.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Şifre en az 6 karakter olmalıdır.")
    
    # Kullanıcı adı ve e-posta kontrolü
    existing_username = db.query(User).filter(User.username == req.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor.")
    
    existing_email = db.query(User).filter(User.email == req.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı.")

    new_user = User(
        username=req.username,
        email=req.email,
        password_hash=hash_password(req.password),
        first_name=req.first_name,
        last_name=req.last_name,
        birth_date=req.birth_date,
        gender=req.gender,
        terms_accepted=req.terms_accepted,
        kvkk_accepted=req.kvkk_accepted,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "Kayıt başarılı!",
        "user_id": new_user.id,
        "username": new_user.username,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "email": new_user.email,
        "level": new_user.current_level,
        "total_points": new_user.total_points,
        "streak_days": 0,
    }

@app.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    """E-posta veya kullanıcı adı ile giriş yapar."""
    user = db.query(User).filter(
        or_(User.email == req.email_or_username, User.username == req.email_or_username)
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı.")
    
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Şifre hatalı.")
    
    # Streak güncelle
    now = datetime.datetime.utcnow()
    if user.last_active:
        diff = (now - user.last_active).days
        if diff == 1:
            user.streak_days += 1
        elif diff > 1:
            user.streak_days = 1
    user.last_active = now
    db.commit()
    
    return {
        "message": "Giriş başarılı!",
        "user_id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "level": user.current_level,
        "total_points": user.total_points,
        "streak_days": user.streak_days,
    }

@app.get("/user/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Kullanıcı profil bilgilerini döner."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    quiz_count = db.query(QuizHistory).filter(QuizHistory.user_id == user_id).count()
    avg_score = db.query(func.avg(QuizHistory.score)).filter(QuizHistory.user_id == user_id).scalar() or 0
    
    # Kullanıcının rozetlerini al
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).all()
    badges_list = []
    for ub in user_badges:
        badge = db.query(Badge).filter(Badge.id == ub.badge_id).first()
        if badge:
            badges_list.append({
                "id": badge.id,
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon,
                "category": badge.category,
                "earned_at": ub.earned_at.isoformat() if ub.earned_at else None
            })
    
    # Son quizler
    recent_quizzes = db.query(QuizHistory).filter(
        QuizHistory.user_id == user_id
    ).order_by(desc(QuizHistory.timestamp)).limit(10).all()
    
    quizzes_list = [{
        "id": q.id,
        "topic": q.topic,
        "score": q.score,
        "difficulty": q.difficulty,
        "total_questions": q.total_questions,
        "correct_answers": q.correct_answers,
        "timestamp": q.timestamp.isoformat() if q.timestamp else None
    } for q in recent_quizzes]
    
    # --- Global Seviye İlerlemesi Hesaplama ---
    total_questions_done = db.query(func.sum(QuizHistory.total_questions)).filter(QuizHistory.user_id == user_id).scalar() or 0
    level_idx = LEVELS.index(user.current_level) if user.current_level in LEVELS else 0
    progress_percent = 100
    progress_text = "Maksimum Seviye!"
    
    if level_idx < len(GLOBAL_LEVEL_REQUIREMENTS):
        req = GLOBAL_LEVEL_REQUIREMENTS[level_idx]
        q_prog = min(100, int((quiz_count / req["min_quizzes"]) * 100)) if req["min_quizzes"] > 0 else 100
        ques_prog = min(100, int((total_questions_done / req["min_questions"]) * 100)) if req["min_questions"] > 0 else 100
        progress_percent = min(q_prog, ques_prog)
        progress_text = f"{quiz_count}/{req['min_quizzes']} Quiz • {total_questions_done}/{req['min_questions']} Soru"

    return {
        "id": user.id,
        "username": user.username,
        "total_points": user.total_points,
        "current_level": user.current_level,
        "streak_days": user.streak_days,
        "quiz_count": quiz_count,
        "average_score": round(avg_score, 1),
        "badges": badges_list,
        "recent_quizzes": quizzes_list,
        "global_progress_percent": progress_percent,
        "global_progress_text": progress_text,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@app.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Şifre sıfırlama e-postası gönderir."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Güvenlik: kullanıcı olmasa bile aynı mesajı ver
        return {"message": "Eğer bu e-posta kayıtlıysa, şifre sıfırlama linki gönderildi."}
    
    # Eski kullanılmamış tokenları iptal et
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).update({"used": True})
    
    # Yeni token oluştur (1 saat geçerli)
    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    )
    db.add(reset_token)
    db.commit()
    
    # E-posta gönder
    try:
        send_reset_email(user.email, token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"E-posta gönderilemedi: {str(e)}")
    
    return {"message": "Şifre sıfırlama linki e-posta adresinize gönderildi."}

@app.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Token ile şifre sıfırlar."""
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Şifre en az 6 karakter olmalıdır.")
    
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token,
        PasswordResetToken.used == False
    ).first()
    
    if not reset_token:
        raise HTTPException(status_code=400, detail="Geçersiz veya kullanılmış link.")
    
    if reset_token.expires_at < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Bu linkin süresi dolmuş. Lütfen yeni bir talep oluşturun.")
    
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    user.password_hash = hash_password(req.new_password)
    reset_token.used = True
    db.commit()
    
    return {"message": "Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz."}

# ========== DÖKÜMAN İŞLEMLERİ ==========

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...), 
    user_id: int = Form(...),
    db: Session = Depends(get_db)
):
    """PDF yükler ve RAG sistemine işler."""
    upload_dir = "../data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = os.path.getsize(file_path)
    
    # Dokümanı veritabanında bul veya oluştur
    existing_doc = db.query(Document).filter(Document.user_id == user_id, Document.filename == file.filename).first()
    
    if existing_doc:
        doc = existing_doc
        doc.file_size = file_size
        doc.status = "processing"
        doc.uploaded_at = datetime.datetime.utcnow()
    else:
        doc = Document(
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            status="processing",
            user_id=user_id
        )
        db.add(doc)
        
    db.commit()
    
    try:
        result = ingest_pdf(file_path, user_id)
        doc.status = "ready"
        doc.page_count = result.get("pages", 0)
        
        # Yeni PDF yüklenince kullanıcıyı Başlangıç seviyesine sıfırla
        upload_user = db.query(User).filter(User.id == user_id).first()
        if upload_user:
            upload_user.current_level = "Başlangıç"
        
        db.commit()
        return {
            "status": "success", 
            "message": result["message"],
            "document_id": doc.id,
            "pages": result.get("pages", 0),
            "chunks": result.get("chunks", 0)
        }
    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
def get_documents(user_id: int = Query(...), db: Session = Depends(get_db)):
    """Kullanıcının yüklediği dokümanları listeler."""
    docs = db.query(Document).filter(Document.user_id == user_id).order_by(desc(Document.uploaded_at)).all()
    return [{
        "id": d.id,
        "filename": d.filename,
        "file_size": d.file_size,
        "page_count": d.page_count,
        "status": d.status,
        "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None
    } for d in docs]

@app.delete("/documents/{doc_id}")
def delete_document(doc_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    """Kullanıcının belirtilen dokümanını siler."""
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Doküman bulunamadı veya silme yetkiniz yok")
        
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception as e:
        print(f"Dosya silinirken hata: {e}")
        
    db.delete(doc)
    db.commit()
    
    return {"status": "success", "message": "Doküman başarıyla silindi"}

# ========== QUIZ İŞLEMLERİ ==========

# ========== KONU BAZLI SEVİYE HESAPLAMA ==========

LEVELS = ["Başlangıç", "Temel Seviye", "Orta Seviye", "İleri Seviye", "Uzman"]

# --- PDF/Konu bazlı seviye şartları ---
# (Her PDF için bağımsız; puan şartı var)
TOPIC_LEVEL_REQUIREMENTS = [
    # Başlangıç → Temel Seviye
    {"min_quizzes": 2, "min_questions": 10, "recent_count": 2, "min_score": 70},
    # Temel Seviye → Orta Seviye
    {"min_quizzes": 4, "min_questions": 20, "recent_count": 2, "min_score": 75},
    # Orta Seviye → İleri Seviye
    {"min_quizzes": 6, "min_questions": 30, "recent_count": 3, "min_score": 80},
    # İleri Seviye → Uzman
    {"min_quizzes": 8, "min_questions": 40, "recent_count": 3, "min_score": 85},
]

# --- Genel (Global) seviye şartları ---
# (Tüm konular toplamı; puan şartı yok — saf deneyim)
GLOBAL_LEVEL_REQUIREMENTS = [
    # Başlangıç → Temel Seviye
    {"min_quizzes": 20,  "min_questions": 100},
    # Temel Seviye → Orta Seviye
    {"min_quizzes": 50,  "min_questions": 250},
    # Orta Seviye → İleri Seviye
    {"min_quizzes": 100, "min_questions": 500},
    # İleri Seviye → Uzman
    {"min_quizzes": 200, "min_questions": 1000},
]

def get_topic_level(user_id: int, topic: str, db: Session) -> str:
    """Belirli bir konu/PDF için kullanıcının mevcut seviyesini hesaplar.
    Son kayıtlı difficulty baz alınır ve YALNIZca bir sonraki seviyenin
    şartları kontrol edilir — böylece seviye atlama tek tek gerçekleşir.
    """
    topic_quizzes = db.query(QuizHistory).filter(
        QuizHistory.user_id == user_id,
        QuizHistory.topic == topic
    ).order_by(QuizHistory.id.asc()).all()

    if not topic_quizzes:
        return "Başlangıç"

    # Son quizde kaydedilen difficulty seviyesini mevcut seviye olarak al
    last_difficulty = topic_quizzes[-1].difficulty or "Başlangıç"
    if last_difficulty not in LEVELS:
        last_difficulty = "Başlangıç"

    current_level_idx = LEVELS.index(last_difficulty)

    # Zaten en üst seviyedeyse dur
    if current_level_idx >= len(TOPIC_LEVEL_REQUIREMENTS):
        return LEVELS[current_level_idx]

    # Sadece bir sonraki seviyenin şartlarını kontrol et (seviye atlamayı engeller)
    req = TOPIC_LEVEL_REQUIREMENTS[current_level_idx]
    total_quizzes = len(topic_quizzes)
    total_questions = sum(q.total_questions or 0 for q in topic_quizzes)
    recent = topic_quizzes[-req["recent_count"]:]

    if (total_quizzes >= req["min_quizzes"]
            and total_questions >= req["min_questions"]
            and all(q.score >= req["min_score"] for q in recent)):
        return LEVELS[current_level_idx + 1]

    return LEVELS[current_level_idx]


def get_global_level(user_id: int, db: Session) -> str:
    """Kullanıcının tüm konulardaki toplam quiz ve soru sayısına
    göre genel (global) seviyesini hesaplar.
    Puan bağımsız — saf deneyim ölçütü. Seviye yalnızca ilerler.
    """
    total_quizzes = db.query(QuizHistory).filter(
        QuizHistory.user_id == user_id
    ).count()
    total_questions = db.query(func.sum(QuizHistory.total_questions)).filter(
        QuizHistory.user_id == user_id
    ).scalar() or 0

    level_idx = 0
    for i, req in enumerate(GLOBAL_LEVEL_REQUIREMENTS):
        if total_quizzes >= req["min_quizzes"] and total_questions >= req["min_questions"]:
            level_idx = i + 1
        else:
            break

    return LEVELS[level_idx]


@app.get("/topic-level")
def get_topic_level_endpoint(user_id: int, topic: str = Query(...), db: Session = Depends(get_db)):
    """Seçilen konudaki/PDF'teki kullanıcının seviyesini döner."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    level = get_topic_level(user_id, topic, db)
    return {"topic": topic, "level": level}


@app.get("/quiz")
async def get_quiz(
    user_id: int,
    topic: str = Query(...),
    num_questions: int = Query(default=5),
    question_type: str = Query(default="mixed"),
    db: Session = Depends(get_db)
):
    """Kullanıcının o konudaki seviyesine göre quiz üretir."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    try:
        # Konu bazlı seviyeyi hesapla (global user.current_level değil)
        difficulty_level = get_topic_level(user_id, topic, db)

        # Konu bir PDF dosya adı mı?
        source_filename = topic if topic.lower().endswith('.pdf') else None

        quiz_content = generate_quiz_from_db(
            topic, 
            difficulty_level, 
            num_questions, 
            question_type=question_type, 
            user_id=user_id, 
            source_filename=source_filename
        )
        return {
            "quiz": quiz_content,
            "difficulty_level": difficulty_level,
            "topic": topic
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-answers")
def evaluate_answers(req: EvaluateAnswersBatchRequest):
    """Açık uçlu cevapları değerlendirir."""
    try:
        results = evaluate_open_ended_answers(req.answers)
        return {"evaluations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-score")
def save_score(req: SaveScoreRequest, db: Session = Depends(get_db)):
    """Skoru kaydeder ve konu bazlı adaptif seviye mesajı döner."""
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    # 1. Bu quizden ÖNCE konunun seviyesini hesapla
    topic_level_before = get_topic_level(req.user_id, req.topic, db)

    # 2. Skor kaydını oluştur (difficulty = bu quizi çözerken kullanılan seviye)
    new_history = QuizHistory(
        user_id=req.user_id,
        topic=req.topic,
        score=req.score,
        total_questions=req.total_questions,
        correct_answers=req.correct_answers,
        difficulty=topic_level_before,
        time_spent=req.time_spent
    )
    db.add(new_history)
    db.flush()  # ID alabilmek için flush, henüz commit değil

    user.total_points += int(req.score)

    # 3. Streak güncelleme
    now = datetime.datetime.utcnow()
    if user.last_active:
        diff = (now - user.last_active).days
        if diff == 1:
            user.streak_days += 1
        elif diff > 1:
            user.streak_days = 1
    else:
        user.streak_days = 1
    user.last_active = now

    # 4. Bu quizden SONRA konu seviyesini hesapla
    topic_level_after = get_topic_level(req.user_id, req.topic, db)

    # 5. Global deneyim seviyesini hesapla ve güncelle (puan bağımsız)
    new_global_level = get_global_level(req.user_id, db)
    global_level_changed = False
    if new_global_level != user.current_level:
        current_global_idx = LEVELS.index(user.current_level) if user.current_level in LEVELS else 0
        new_global_idx = LEVELS.index(new_global_level)
        if new_global_idx > current_global_idx:  # Global seviye yalnızca ilerler
            user.current_level = new_global_level
            global_level_changed = True

    # 6. Konu bazlı ilerleme mesajı
    if global_level_changed and topic_level_after != topic_level_before:
        result_msg = (f"🎉 Çift terfi! Bu PDF'de {topic_level_after} seviyesine yükseldin "
                      f"ve genel deneyim seviyeni de {new_global_level}'e taşıdın!")
    elif global_level_changed:
        result_msg = f"💫 Deneyim kazandın! Genel seviyeni {new_global_level}'e yükseldi!"
    elif topic_level_after != topic_level_before:
        result_msg = f"🎉 Tebrikler! Bu PDF'de {topic_level_after} seviyesine yükseldin!"
    else:
        # Konu bazlı bir sonraki seviye için ne kadar kaldığını hesapla
        topic_quizzes = db.query(QuizHistory).filter(
            QuizHistory.user_id == req.user_id,
            QuizHistory.topic == req.topic
        ).all()
        total_q = len(topic_quizzes)
        total_questions_done = sum(q.total_questions or 0 for q in topic_quizzes)
        current_idx = LEVELS.index(topic_level_after)

        if current_idx < len(TOPIC_LEVEL_REQUIREMENTS):
            req_next = TOPIC_LEVEL_REQUIREMENTS[current_idx]
            missing_quizzes = max(0, req_next["min_quizzes"] - total_q)
            missing_questions = max(0, req_next["min_questions"] - total_questions_done)
            next_level = LEVELS[current_idx + 1]

            if req.score >= req_next["min_score"]:
                if missing_quizzes > 0 or missing_questions > 0:
                    parts = []
                    if missing_quizzes > 0:
                        parts.append(f"{missing_quizzes} quiz daha")
                    if missing_questions > 0:
                        parts.append(f"{missing_questions} soru daha")
                    result_msg = f"İyi iş! {next_level} için {' ve '.join(parts)} çözmen gerekiyor."
                else:
                    result_msg = f"Harika performans! {next_level} seviyesine çok yakınsın."
            elif req.score <= 30:
                result_msg = "Düşük puan aldın. Bu PDF'i tekrar çalış ve tekrar dene!"
            else:
                result_msg = f"İyi gidiyorsun! {next_level} için en az %{req_next['min_score']} puan almaya çalış."
        else:
            result_msg = "Mükemmel! Bu PDF'de en üst seviyeye ulaştın! 🏆"


    # 6. Rozet kontrolü
    new_badges = check_and_award_badges(user, db, req.score)

    db.commit()
    return {
        "message": result_msg,
        "new_total_points": user.total_points,
        "current_level": user.current_level,
        "topic_level": topic_level_after,
        "streak_days": user.streak_days,
        "new_badges": new_badges
    }


def check_and_award_badges(user, db, latest_score):
    """Kullanıcının rozet kazanıp kazanmadığını kontrol eder."""
    new_badges = []
    quiz_count = db.query(QuizHistory).filter(QuizHistory.user_id == user.id).count()
    
    all_badges = db.query(Badge).all()
    existing_badge_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user.id).all()}
    
    levels = {"Başlangıç": 1, "Temel Seviye": 2, "Orta Seviye": 3, "İleri Seviye": 4, "Uzman": 5}
    
    for badge in all_badges:
        if badge.id in existing_badge_ids:
            continue
        
        earned = False
        if badge.requirement_type == "quizzes" and quiz_count >= badge.requirement_value:
            earned = True
        elif badge.requirement_type == "points" and user.total_points >= badge.requirement_value:
            earned = True
        elif badge.requirement_type == "streak" and user.streak_days >= badge.requirement_value:
            earned = True
        elif badge.requirement_type == "level":
            user_level_num = levels.get(user.current_level, 1)
            if user_level_num >= badge.requirement_value:
                earned = True
        elif badge.requirement_type == "perfect" and latest_score >= 100:
            earned = True
        
        if earned:
            ub = UserBadge(user_id=user.id, badge_id=badge.id)
            db.add(ub)
            new_badges.append({
                "name": badge.name,
                "description": badge.description,
                "icon": badge.icon
            })
    
    return new_badges

# ========== ANALİTİK İŞLEMLERİ ==========

@app.get("/analytics/{user_id}")
def get_analytics(user_id: int, db: Session = Depends(get_db)):
    """Kullanıcının öğrenme analitiği verilerini döner."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Konu bazında performans
    topic_stats = db.query(
        QuizHistory.topic,
        func.avg(QuizHistory.score).label("avg_score"),
        func.count(QuizHistory.id).label("count"),
        func.max(QuizHistory.score).label("best_score")
    ).filter(QuizHistory.user_id == user_id).group_by(QuizHistory.topic).all()
    
    topic_data = [{
        "topic": t.topic,
        "avg_score": round(t.avg_score, 1),
        "quiz_count": t.count,
        "best_score": t.best_score
    } for t in topic_stats]
    
    # Zorluk seviyesi bazında performans
    difficulty_stats = db.query(
        QuizHistory.difficulty,
        func.avg(QuizHistory.score).label("avg_score"),
        func.count(QuizHistory.id).label("count")
    ).filter(QuizHistory.user_id == user_id).group_by(QuizHistory.difficulty).all()
    
    difficulty_data = [{
        "difficulty": d.difficulty,
        "avg_score": round(d.avg_score, 1),
        "quiz_count": d.count
    } for d in difficulty_stats]
    
    # Son 30 günlük ilerleme
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    progress = db.query(
        func.date(QuizHistory.timestamp).label("date"),
        func.avg(QuizHistory.score).label("avg_score"),
        func.count(QuizHistory.id).label("count")
    ).filter(
        QuizHistory.user_id == user_id,
        QuizHistory.timestamp >= thirty_days_ago
    ).group_by(func.date(QuizHistory.timestamp)).order_by("date").all()
    
    progress_data = [{
        "date": str(p.date),
        "avg_score": round(p.avg_score, 1),
        "quiz_count": p.count
    } for p in progress]
    
    # Genel istatistikler
    total_quizzes = db.query(QuizHistory).filter(QuizHistory.user_id == user_id).count()
    avg_score = db.query(func.avg(QuizHistory.score)).filter(QuizHistory.user_id == user_id).scalar() or 0
    total_time = db.query(func.sum(QuizHistory.time_spent)).filter(QuizHistory.user_id == user_id).scalar() or 0
    best_score = db.query(func.max(QuizHistory.score)).filter(QuizHistory.user_id == user_id).scalar() or 0
    
    return {
        "overview": {
            "total_quizzes": total_quizzes,
            "average_score": round(avg_score, 1),
            "total_time_minutes": round(total_time / 60, 1),
            "best_score": best_score,
            "current_level": user.current_level,
            "total_points": user.total_points,
            "streak_days": user.streak_days
        },
        "topic_performance": topic_data,
        "difficulty_performance": difficulty_data,
        "progress_over_time": progress_data
    }

# ========== LİDERLİK TABLOSU ==========

@app.get("/leaderboard")
def get_leaderboard(limit: int = Query(default=20), db: Session = Depends(get_db)):
    """Genel liderlik tablosunu döner."""
    users = db.query(User).order_by(desc(User.total_points)).limit(limit).all()
    
    leaderboard = []
    for rank, user in enumerate(users, 1):
        quiz_count = db.query(QuizHistory).filter(QuizHistory.user_id == user.id).count()
        avg_score = db.query(func.avg(QuizHistory.score)).filter(QuizHistory.user_id == user.id).scalar() or 0
        badge_count = db.query(UserBadge).filter(UserBadge.user_id == user.id).count()
        
        leaderboard.append({
            "rank": rank,
            "user_id": user.id,
            "username": user.username,
            "total_points": user.total_points,
            "current_level": user.current_level,
            "quiz_count": quiz_count,
            "average_score": round(avg_score, 1),
            "badge_count": badge_count,
            "streak_days": user.streak_days
        })
    
    return leaderboard

# ========== ROZET İŞLEMLERİ ==========

@app.get("/badges")
def get_all_badges(db: Session = Depends(get_db)):
    """Tüm mevcut rozetleri döner."""
    badges = db.query(Badge).all()
    return [{
        "id": b.id,
        "name": b.name,
        "description": b.description,
        "icon": b.icon,
        "category": b.category,
        "requirement_type": b.requirement_type,
        "requirement_value": b.requirement_value
    } for b in badges]

@app.get("/badges/{user_id}")
def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    """Kullanıcının kazandığı rozetleri döner."""
    all_badges = db.query(Badge).all()
    earned_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()}
    
    result = []
    for badge in all_badges:
        result.append({
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon": badge.icon,
            "category": badge.category,
            "earned": badge.id in earned_ids
        })
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)