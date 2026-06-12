import os
import json
import random
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_xai import ChatXAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage
import fitz
import base64

load_dotenv()
CHROMA_PATH = "../data/db"



def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def ingest_pdf(pdf_path: str, user_id: int):
    """PDF dosyasını yükler, sayfaları resme çevirir, Gemini Vision ile okur ve vektör veritabanına kaydeder."""
    vision_model = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0.0)
    
    doc = fitz.open(pdf_path)
    documents = []
    total_pages = len(doc)
    
    for page_num in range(total_pages):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("jpeg")
        
        image_data = base64.b64encode(img_bytes).decode('utf-8')
        
        message = HumanMessage(
            content=[
                {
                    "type": "text", 
                    "text": "Lütfen bu resimdeki tüm metni, el yazısı notlar dahil olmak üzere tam olarak olduğu gibi çıkar. Hiçbir ek yorum veya markdown formatı ekleme."
                },
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{image_data}"}
                }
            ]
        )
        
        try:
            response = vision_model.invoke([message])
            extracted_text = response.content.strip() if response.content else ""
        except Exception as e:
            print(f"Error processing page {page_num}: {e}")
            extracted_text = ""
            
        if extracted_text:
            documents.append(
                Document(
                    page_content=extracted_text, 
                    metadata={"source": pdf_path, "page": page_num, "user_id": user_id}
                )
            )
        
    doc.close()
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    if chunks:
        Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=CHROMA_PATH
        )
        
    return {
        "message": "Doküman başarıyla yüklendi! Quiz oluşturmaya hazır 🎉",
        "chunks": len(chunks),
        "pages": total_pages
    }

def generate_quiz_from_db(topic: str, difficulty: str = "Başlangıç", num_questions: int = 5, question_type: str = "mixed", user_id: int = None, source_filename: str = None):
    """Vektör veritabanından konu ile ilgili içerik alarak quiz oluşturur."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vector_db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    
    # Sadece kullanıcının kendi dokümanlarında ara
    search_kwargs = {"k": 5}
    if user_id is not None and source_filename is not None:
        # Dosya yolu formatı: ../data/uploads/{user_id}_{filename}
        expected_source = f"../data/uploads/{user_id}_{source_filename}"
        search_kwargs["filter"] = {"$and": [{"user_id": user_id}, {"source": expected_source}]}
    elif user_id is not None:
        search_kwargs["filter"] = {"user_id": user_id}
        
    retriever = vector_db.as_retriever(search_kwargs=search_kwargs)
    
    # Use Grok for text generation
    llm = ChatXAI(model="grok-4-fast-reasoning", temperature=0.7)
    
    difficulty_map = {
        "Başlangıç": "çok kolay ve temel kavramları ölçen",
        "Temel Seviye": "temel düzey, kavramların anlaşılıp anlaşılmadığını test eden",
        "Orta Seviye": "orta düzey, analiz ve uygulama gerektiren",
        "İleri Seviye": "ileri düzey, sentez ve değerlendirme gerektiren",
        "Uzman": "uzman düzey, çok zor ve detaylı bilgi ile derin analiz gerektiren"
    }
    diff_desc = difficulty_map.get(difficulty, "orta düzey")

    if question_type == "multiple_choice":
        type_instruction = "Tüm sorular çoktan seçmeli olmalı ve 5 şıklı (A, B, C, D, E) olmalıdır."
        json_example = """{{
        "questions": [
            {{
                "id": 1,
                "type": "multiple_choice",
                "question": "Soru metni",
                "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı", "E şıkkı"],
                "correct_answer": 0,
                "explanation": "Doğru cevabın kısa açıklaması"
            }}
        ]
    }}"""
    elif question_type == "open_ended":
        type_instruction = "Tüm sorular açık uçlu (klasik) olmalıdır. Şık koyma."
        json_example = """{{
        "questions": [
            {{
                "id": 1,
                "type": "open_ended",
                "question": "Açık uçlu soru metni",
                "ideal_answer": "Bu sorunun ideal, tam cevabı.",
                "keywords": ["anahtar kavram 1", "anahtar kavram 2"]
            }}
        ]
    }}"""
    else: # mixed
        type_instruction = "Soruların yarısı çoktan seçmeli (5 şıklı), yarısı açık uçlu (klasik) olmalıdır."
        json_example = """{{
        "questions": [
            {{
                "id": 1,
                "type": "multiple_choice",
                "question": "Soru metni",
                "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı", "E şıkkı"],
                "correct_answer": 0,
                "explanation": "Doğru cevabın kısa açıklaması"
            }},
            {{
                "id": 2,
                "type": "open_ended",
                "question": "Açık uçlu soru metni",
                "ideal_answer": "Bu sorunun ideal, tam cevabı.",
                "keywords": ["anahtar kavram 1", "anahtar kavram 2"]
            }}
        ]
    }}"""

    template = """
    Sen profesyonel bir eğitimcisin. Aşağıdaki döküman içeriğini kullanarak, {difficulty} seviyesinde 
    {num_questions} adet soru hazırla. {type_instruction}
    
    Yanıtı mutlaka aşağıdaki JSON formatında ver. Başka hiçbir şey ekleme:
    
    {json_example}
    
    Döküman İçeriği: {context}
    Konu: {topic}
    """
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {
            "context": retriever | format_docs, 
            "topic": RunnablePassthrough(), 
            "difficulty": lambda x: diff_desc,
            "num_questions": lambda x: str(num_questions),
            "type_instruction": lambda x: type_instruction,
            "json_example": lambda x: json_example
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    
    raw_result = rag_chain.invoke(topic)
    
    # JSON parse etmeye çalış
    try:
        # Markdown code block temizle
        cleaned = raw_result.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        
        parsed = json.loads(cleaned.strip())
        
        # Şıkları rastgele karıştır
        for q in parsed.get("questions", []):
            options = q.get("options", [])
            correct_idx = q.get("correct_answer", 0)
            if options and isinstance(correct_idx, int) and correct_idx < len(options):
                correct_text = options[correct_idx]
                random.shuffle(options)
                q["correct_answer"] = options.index(correct_text)
        
        return parsed
    except json.JSONDecodeError:
        # Parse edilemezse ham sonucu döndür
        return {
            "questions": [
                {
                    "id": 1,
                    "type": "multiple_choice",
                    "question": raw_result,
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": 0,
                    "explanation": ""
                }
            ]
        }

def evaluate_open_ended_answers(answers_data: list):
    """
    answers_data = [
      {
        "questionId": 1,
        "question": "...",
        "ideal_answer": "...",
        "student_answer": "..."
      }, ...
    ]
    Returns a list of evaluations.
    """
    if not answers_data:
        return []

    llm = ChatXAI(model="grok-4-fast-reasoning", temperature=0.2)
    
    template = """
    Sen adil ve yapıcı bir öğretmensin. Aşağıda sana verilen öğrenci cevaplarını değerlendireceksin.
    Her soru için 0 ile 100 arasında bir puan ver ve kısa bir geri bildirim (feedback) yaz.
    
    Yanıtı mutlaka JSON array formatında ver. Başka hiçbir şey ekleme:
    [
      {{
        "questionId": 1,
        "score": 85,
        "feedback": "Kavramı doğru anlamışsın ancak ..."
      }}
    ]
    
    Değerlendirilecek Cevaplar (JSON):
    {answers_json}
    """
    prompt = ChatPromptTemplate.from_template(template)
    
    chain = prompt | llm | StrOutputParser()
    
    import json
    raw_result = chain.invoke({"answers_json": json.dumps(answers_data, ensure_ascii=False)})
    
    try:
        cleaned = raw_result.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        
        parsed = json.loads(cleaned.strip())
        return parsed
    except json.JSONDecodeError:
        return []
