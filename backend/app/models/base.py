# backend/app/models/base.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Asenkron Motor (Engine) Tanımlaması
engine = create_async_engine(settings.DATABASE_URL, future=True, echo=True)

# İstek başına açılacak olan Session Fabrikası
SessionLocal = async_sessionmaker(
    bind=engine, 
    autocommit=False, 
    autoflush=False, 
    expire_on_commit=False, 
    class_=AsyncSession
)

# Tüm DB modellerimizin miras alacağı Base Sınıfı
class Base(DeclarativeBase):
    pass

# HTTP istekleri sırasında DB session'ı güvenli açıp kapatmak için Dependency Injection fonksiyonu
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()