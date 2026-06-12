from database import SessionLocal, Badge, UserBadge

def reset_badges():
    db = SessionLocal()
    try:
        # Önce kullanıcı-rozet ilişkilerini sil
        deleted_ub = db.query(UserBadge).delete()
        print(f"{deleted_ub} kullanıcı-rozet ilişkisi silindi.")
        
        # Sonra tüm rozetleri sil
        deleted_b = db.query(Badge).delete()
        print(f"{deleted_b} rozet silindi.")
        
        db.commit()
        print("Eski rozetler temizlendi. Sunucu yeniden başlatıldığında yeni rozetler otomatik oluşturulacak.")
    except Exception as e:
        print(f"Hata: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_badges()
