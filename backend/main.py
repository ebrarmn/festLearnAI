from fastapi import FastAPI, UploadFile, File, Query, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
import shutil
import os
import uvicorn
import datetime
import hashlib
from typing import Optional, List

from database import engine, Base, get_db, User, QuizHistory, Badge, UserBadge, Document, seed_badges
from rag_service import ingest_pdf, generate_quiz_from_db

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
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

# ========== DÖKÜMAN İŞLEMLERİ ==========

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """PDF yükler ve RAG sistemine işler."""
    upload_dir = "../data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = os.path.getsize(file_path)
    
    # Dokümanı veritabanına kaydet
    doc = Document(
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        status="processing"
    )
    db.add(doc)
    db.commit()
    
    try:
        result = ingest_pdf(file_path)
        doc.status = "ready"
        doc.page_count = result.get("pages", 0)
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
def get_documents(db: Session = Depends(get_db)):
    """Yüklenen dokümanları listeler."""
    docs = db.query(Document).order_by(desc(Document.uploaded_at)).all()
    return [{
        "id": d.id,
        "filename": d.filename,
        "file_size": d.file_size,
        "page_count": d.page_count,
        "status": d.status,
        "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None
    } for d in docs]

# ========== QUIZ İŞLEMLERİ ==========

@app.get("/quiz")
async def get_quiz(
    user_id: int, 
    topic: str = Query(...), 
    num_questions: int = Query(default=5),
    db: Session = Depends(get_db)
):
    """Kullanıcının seviyesine ve daha önceki denemelerine uygun quiz üretir."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    try:
        # Daha önce bu PDF/konu için quiz çözmüş mü kontrol et
        previous_quiz = db.query(QuizHistory).filter(QuizHistory.user_id == user_id, QuizHistory.topic == topic).first()
        
        if previous_quiz:
            difficulty_level = user.current_level
        else:
            # İlk defa çözüyorsa Başlangıç dedik
            difficulty_level = "Başlangıç"

        quiz_content = generate_quiz_from_db(topic, difficulty_level, num_questions)
        return {
            "quiz": quiz_content,
            "difficulty_level": difficulty_level,
            "topic": topic
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/save-score")
def save_score(req: SaveScoreRequest, db: Session = Depends(get_db)):
    """Skoru kaydeder ve adaptif seviye güncellemesi yapar."""
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    # 1. Skor kaydını oluştur
    new_history = QuizHistory(
        user_id=req.user_id, 
        topic=req.topic, 
        score=req.score,
        total_questions=req.total_questions,
        correct_answers=req.correct_answers,
        difficulty=user.current_level,
        time_spent=req.time_spent
    )
    db.add(new_history)
    user.total_points += int(req.score)

    # 2. Streak güncelleme
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

    # 3. ADAPTİF ZORLUK MANTIĞI
    levels = ["Başlangıç", "Orta Seviye", "İleri Seviye"]
    current_idx = levels.index(user.current_level)

    if req.score >= 80:
        if current_idx < len(levels) - 1:
            user.current_level = levels[current_idx + 1]
            result_msg = f"Harika! {user.current_level} seviyesine yükseldin."
        else:
            result_msg = "Mükemmel! Advanced seviyesini başarıyla koruyorsun."
    elif req.score <= 40:
        if current_idx > 0:
            user.current_level = levels[current_idx - 1]
            result_msg = f"Seviyen {user.current_level} olarak güncellendi."
        else:
            result_msg = "Başlangıç seviyesindesin, denemeye devam et!"
    else:
        result_msg = "İyi gidiyorsun, mevcut seviyeni korudun."

    # 4. Rozet kontrolü
    new_badges = check_and_award_badges(user, db, req.score)
    
    db.commit()
    return {
        "message": result_msg,
        "new_total_points": user.total_points,
        "current_level": user.current_level,
        "streak_days": user.streak_days,
        "new_badges": new_badges
    }

def check_and_award_badges(user, db, latest_score):
    """Kullanıcının rozet kazanıp kazanmadığını kontrol eder."""
    new_badges = []
    quiz_count = db.query(QuizHistory).filter(QuizHistory.user_id == user.id).count()
    
    all_badges = db.query(Badge).all()
    existing_badge_ids = {ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user.id).all()}
    
    levels = {"Başlangıç": 1, "Orta Seviye": 2, "İleri Seviye": 3}
    
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