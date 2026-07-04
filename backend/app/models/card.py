# backend/app/models/card.py
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Numeric, DateTime
from datetime import datetime
from app.models.base import Base

class Card(Base):
    __tablename__ = "cards"

    # UUID veya standart Integer ID kullanabiliriz. Şimdilik hızlı ve kararlı olması için Integer
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    
    # Kart Bilgileri
    card_name: Mapped[str] = mapped_column(String(50), nullable=False)  # Örn: "Maaş Kartı"
    card_holder_name: Mapped[str] = mapped_column(String(100), nullable=False)
    card_provider: Mapped[str] = mapped_column(String(20), nullable=False)  # Visa, Mastercard vb.
    last_four_digits: Mapped[str] = mapped_column(String(4), nullable=False)
    
    # Dinamik finansal alanlar (İleride kolayca değiştirebiliriz)
    balance: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    
    # Sistem Log Alanları
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)