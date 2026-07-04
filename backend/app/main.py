# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.card import router as card_router  # <-- Yeni Import!

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Ayarları
origins = ["http://localhost:3020", "http://127.0.0.1:3020"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root Endpoint'ler
@app.get("/", tags=["Health Check"])
async def root():
    return {"status": "healthy", "message": f"Welcome to {settings.PROJECT_NAME} Infrastructure"}

# KART ROUTER'INI ENTEGRE EDİYORUZ
app.include_router(card_router, prefix=settings.API_V1_STR)  # <-- Yeni Eklenen Satır!