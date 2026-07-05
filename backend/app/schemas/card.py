# backend/app/schemas/card.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# API'ye kart eklenirken dışarıdan istenecek veriler (Request Body)
class CardCreate(BaseModel):
    card_name: str = Field(..., max_length=50, description="Kartın adı, örn: Maaş Kartı")
    card_holder_name: str = Field(..., max_length=100, description="Kart üzerindeki isim")
    card_provider: str = Field(..., max_length=20, description="Visa, Mastercard, Troy vb.")
    last_four_digits: str = Field(..., min_length=4, max_length=4, description="Kartın son 4 hanesi")
    balance: Optional[float] = Field(default=0.00, ge=0, description="Kartın başlangıç bakiyesi")

# API'den dışarıya dönecek veri formatı (Response Body)
class CardResponse(BaseModel):
    id: int
    card_name: str
    card_holder_name: str
    card_provider: str
    last_four_digits: str
    balance: float
    created_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy objesini otomatik Pydantic'e mapler


# API'ye kart güncellenirken gönderilebilecek esnek veri yapısı
class CardUpdate(BaseModel):
    card_name: Optional[str] = Field(None, max_length=50, description="Kartın yeni adı")
    card_holder_name: Optional[str] = Field(None, max_length=100, description="Yeni kart sahibi")
    card_provider: Optional[str] = Field(None, max_length=20, description="Visa, Mastercard vb.")
    last_four_digits: Optional[str] = Field(None, min_length=4, max_length=4, description="Yeni son 4 hane")
    balance: Optional[float] = Field(None, ge=0, description="Güncel bakiye")

