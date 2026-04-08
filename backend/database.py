from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import DeclarativeBase, sessionmaker, relationship
import datetime

import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL veritabanı dosyası yolu - .env dosyasından okunur veya varsayılan postgres veritabanına bağlanır
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:mangan@localhost:5432/festLearnAI")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

# Kullanıcı Tablosu
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False, default="")
    first_name = Column(String, default="")
    last_name = Column(String, default="")
    birth_date = Column(String, default="")  # YYYY-MM-DD formatında
    gender = Column(String, default="")  # erkek, kadın, diger, belirtmek_istemiyorum
    avatar_url = Column(String, default="")
    terms_accepted = Column(Boolean, default=False)
    kvkk_accepted = Column(Boolean, default=False)
    total_points = Column(Integer, default=0)
    current_level = Column(String, default="Başlangıç")
    streak_days = Column(Integer, default=0)
    last_active = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    quizzes = relationship("QuizHistory", back_populates="owner")
    badges = relationship("UserBadge", back_populates="owner")

# Quiz Geçmişi Tablosu
class QuizHistory(Base):
    __tablename__ = "quiz_history"
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String)
    score = Column(Float)
    total_questions = Column(Integer, default=5)
    correct_answers = Column(Integer, default=0)
    difficulty = Column(String)
    time_spent = Column(Integer, default=0)  # saniye cinsinden
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="quizzes")

# Rozet Tanımları
class Badge(Base):
    __tablename__ = "badges"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    icon = Column(String)  # emoji veya icon adı
    category = Column(String)  # quiz, streak, upload, level
    requirement_type = Column(String)  # points, quizzes, streak, level
    requirement_value = Column(Integer)

# Kullanıcı-Rozet İlişkisi
class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    badge_id = Column(Integer, ForeignKey("badges.id"))
    earned_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner = relationship("User", back_populates="badges")
    badge = relationship("Badge")

# Yüklenen Dokümanlar
class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    file_size = Column(Integer, default=0)
    page_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="processing")  # processing, ready, error

# Veritabanı oturumu yönetimi
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_badges(db):
    """Varsayılan rozetleri oluşturur."""
    existing = db.query(Badge).count()
    if existing > 0:
        return
    
    badges = [
        Badge(name="İlk Adım", description="İlk quizini tamamla", icon="🎯", category="quiz", requirement_type="quizzes", requirement_value=1),
        Badge(name="Quiz Ustası", description="10 quiz tamamla", icon="🏆", category="quiz", requirement_type="quizzes", requirement_value=10),
        Badge(name="Bilgi Avcısı", description="25 quiz tamamla", icon="🎓", category="quiz", requirement_type="quizzes", requirement_value=25),
        Badge(name="100 Puan", description="100 puan topla", icon="💯", category="points", requirement_type="points", requirement_value=100),
        Badge(name="500 Puan", description="500 puan topla", icon="⭐", category="points", requirement_type="points", requirement_value=500),
        Badge(name="1000 Puan", description="1000 puan topla", icon="🌟", category="points", requirement_type="points", requirement_value=1000),
        Badge(name="Çaylak", description="Başlangıç seviyesini tamamla", icon="🌱", category="level", requirement_type="level", requirement_value=1),
        Badge(name="Orta Seviye", description="Orta Seviye seviyesine ulaş", icon="🌿", category="level", requirement_type="level", requirement_value=2),
        Badge(name="Uzman", description="İleri Seviye seviyesine ulaş", icon="🌳", category="level", requirement_type="level", requirement_value=3),
        Badge(name="3 Gün Seri", description="3 gün üst üste çalış", icon="🔥", category="streak", requirement_type="streak", requirement_value=3),
        Badge(name="7 Gün Seri", description="7 gün üst üste çalış", icon="💪", category="streak", requirement_type="streak", requirement_value=7),
        Badge(name="Mükemmel Skor", description="Bir quizden %100 al", icon="💎", category="quiz", requirement_type="perfect", requirement_value=1),
    ]
    
    for badge in badges:
        db.add(badge)
    db.commit()