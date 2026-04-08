import os
import json
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_xai import ChatXAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
CHROMA_PATH = "../data/db"



def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def ingest_pdf(pdf_path: str):
    """PDF dosyasını yükler, parçalara ayırır ve vektör veritabanına kaydeder."""
    loader = PyPDFLoader(pdf_path)
    data = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(data)
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH
    )
    return {
        "message": "PDF başarıyla işlendi ve vektör veritabanına kaydedildi.",
        "chunks": len(chunks),
        "pages": len(data)
    }

def generate_quiz_from_db(topic: str, difficulty: str = "Başlangıç", num_questions: int = 5):
    """Vektör veritabanından konu ile ilgili içerik alarak quiz oluşturur."""
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vector_db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
    retriever = vector_db.as_retriever(search_kwargs={"k": 5})
    
    # Use Grok for text generation
    llm = ChatXAI(model="grok-4-fast-reasoning", temperature=0.7)
    
    difficulty_map = {
        "Başlangıç": "kolay ve temel kavramları ölçen",
        "Orta Seviye": "orta düzey, analiz ve uygulama gerektiren",
        "İleri Seviye": "ileri düzey, sentez ve değerlendirme gerektiren"
    }
    diff_desc = difficulty_map.get(difficulty, "orta düzey")

    type_instruction = "Tüm sorular çoktan seçmeli olmalı ve 5 şıklı (A, B, C, D, E) olmalıdır."

    template = """
    Sen profesyonel bir eğitimcisin. Aşağıdaki döküman içeriğini kullanarak, {difficulty} seviyesinde 
    {num_questions} adet soru hazırla. {type_instruction}
    
    Yanıtı mutlaka aşağıdaki JSON formatında ver. Başka hiçbir şey ekleme:
    
    {{
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
    }}
    
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
            "type_instruction": lambda x: type_instruction
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
