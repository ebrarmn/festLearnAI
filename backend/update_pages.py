from database import SessionLocal, Document
import fitz
import os

db = SessionLocal()
docs = db.query(Document).all()
for doc in docs:
    if doc.page_count == 0 and doc.file_path and os.path.exists(doc.file_path):
        try:
            pdf = fitz.open(doc.file_path)
            doc.page_count = len(pdf)
            pdf.close()
            print(f"Updated {doc.filename} to {doc.page_count} pages.")
        except Exception as e:
            print(f"Error reading {doc.filename}: {e}")
db.commit()
print("Done.")
