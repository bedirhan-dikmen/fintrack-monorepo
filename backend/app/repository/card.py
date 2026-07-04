# backend/app/repository/card.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.card import Card
from app.schemas.card import CardCreate

class CardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    # Asenkron kart oluşturma sorgusu
    async def create(self, card_data: CardCreate) -> Card:
        db_card = Card(**card_data.model_dump())
        self.db.add(db_card)
        await self.db.commit()          # İşlemi DB'ye commit et
        await self.db.refresh(db_card)  # Atanan ID ve created_at bilgisini geri yükle
        return db_card

# Asenkron tüm kartları listeleme sorgusu
    async def get_all(self) -> list[Card]:
        query = select(Card).order_by(Card.created_at.desc())
        result = await self.db.execute(query)
        # result.scalars().all() yerine bunu kullanıyoruz:
        return list(result.scalars())