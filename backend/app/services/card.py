# backend/app/services/card.py
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.card import CardRepository
from app.schemas.card import CardCreate, CardUpdate

class CardService:
    def __init__(self, db: AsyncSession):
        self.repo = CardRepository(db)

    async def create_card(self, card_data: CardCreate):
        # Mühendislik Notu: İleride "Aynı karttan zaten var mı?" 
        # gibi tüm business kontrollerini buraya yazacağız.
        return await self.repo.create(card_data)

    async def list_cards(self):
        return await self.repo.get_all()
    
    # En üstteki importlara HTTPException ve CardUpdate ekleyelim:
# from fastapi import HTTPException, status
# from app.schemas.card import CardCreate, CardUpdate

    async def update_card(self, card_id: int, update_data: CardUpdate):
        # 1. Önce kart veritabanında var mı bak
        db_card = await self.repo.get_by_id(card_id)
        if not db_card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Güncellenmek istenen kart sistemde bulunamadı."
            )
        # 2. Varsa güncelleyip dön
        return await self.repo.update(db_card, update_data)

    async def delete_card(self, card_id: int):
        # 1. Önce kart veritabanında var mı bak
        db_card = await self.repo.get_by_id(card_id)
        if not db_card:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Silinmek istenen kart sistemde bulunamadı."
            )
        # 2. Varsa sil
        await self.repo.delete(db_card)
        return {"message": "Kart başarıyla silindi."}