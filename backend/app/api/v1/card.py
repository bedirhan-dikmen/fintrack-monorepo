# backend/app/api/v1/card.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.base import get_db
from app.schemas.card import CardCreate, CardResponse
from app.services.card import CardService

router = APIRouter(prefix="/cards", tags=["Cards"])

@router.post("/", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def add_card(card_data: CardCreate, db: AsyncSession = Depends(get_db)):
    service = CardService(db)
    return await service.create_card(card_data)

@router.get("/", response_model=list[CardResponse])
async def list_all_cards(db: AsyncSession = Depends(get_db)):
    service = CardService(db)
    return await service.list_cards()