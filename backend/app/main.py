# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# FastAPI Uygulama Nesnesinin Başlatılması
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS (Cross-Origin Resource Sharing) Güvenlik Ayarları
# Frontend (3020) ile Backend (8020) konteynerlerinin birbiriyle sorunsuz
# konuşabilmesi için tarayıcı engellerini bu kurumsal protokol ile aşıyoruz.
origins = [
    "http://localhost:3020",      # Lokal frontend erişimi
    "http://127.0.0.1:3020",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# İlk "Router / API Layer" Endpoint'imiz (Health Check)
@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "healthy",
        "message": f"Welcome to {settings.PROJECT_NAME} Infrastructure",
        "version": "v1.0.0"
    }

@app.get(f"{settings.API_V1_STR}/health", tags=["Health Check"])
async def health_check():
    return {"status": "success", "database": "connected (async)"}