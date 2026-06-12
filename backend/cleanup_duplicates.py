from database import SessionLocal, Document
from sqlalchemy import func

def clean_duplicates():
    db = SessionLocal()
    try:
        # Group by user_id and filename to find duplicates
        docs = db.query(Document).all()
        
        # Dictionary to track the latest document for each (user_id, filename)
        latest_docs = {}
        to_delete = []
        
        for doc in docs:
            key = (doc.user_id, doc.filename)
            if key not in latest_docs:
                latest_docs[key] = doc
            else:
                existing = latest_docs[key]
                # Keep the one with the highest ID (most recently created) or most recently updated
                if doc.id > existing.id:
                    to_delete.append(existing)
                    latest_docs[key] = doc
                else:
                    to_delete.append(doc)
                    
        print(f"Found {len(to_delete)} duplicate documents to delete.")
        
        for doc in to_delete:
            db.delete(doc)
            
        db.commit()
        print("Duplicates successfully deleted.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_duplicates()
