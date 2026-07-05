# backend/app/repository/card.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.card import Card
from app.schemas.card import CardCreate, CardUpdate
from typing import Optional

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
    

    # Dosyanın en üstündeki importlara CardUpdate şemasını eklemeyi unutma:
# from app.schemas.card import CardCreate, CardUpdate

    # ID'ye göre tek bir kart bulma (Güvenlik ve doğrulama kontrolü için)
    async def get_by_id(self, card_id: int) -> Optional[Card]:
        query = select(Card).where(Card.id == card_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    # Kart Güncelleme Sorgusu
    async def update(self, db_card: Card, update_data: CardUpdate) -> Card:
        # model_dump(exclude_unset=True) sayesinde sadece ön yüzden Gelen (boş bırakılmayan) alanları döngüye sokarız
        for key, value in update_data.model_dump(exclude_unset=True).items():
            setattr(db_card, key, value)
        
        await self.db.commit()
        await self.db.refresh(db_card)
        return db_card

    # Kart Silme Sorgusu
    async def delete(self, db_card: Card) -> None:
        await self.db.delete(db_card)
        await self.db.commit()  # Veritabanından kalıcı olarak temizle