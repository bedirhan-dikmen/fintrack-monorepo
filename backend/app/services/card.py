# backend/app/services/card.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.card import CardRepository
from app.schemas.card import CardCreate

class CardService:
    def __init__(self, db: AsyncSession):
        self.repo = CardRepository(db)

    async def create_card(self, card_data: CardCreate):
        # Mühendislik Notu: İleride "Aynı karttan zaten var mı?" 
        # gibi tüm business kontrollerini buraya yazacağız.
        return await self.repo.create(card_data)

    async def list_cards(self):
        return await self.repo.get_all()