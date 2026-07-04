// frontend/src/services/cardService.ts
import api from './api';

// Backend'deki CardResponse şemamızın TypeScript karşılığı
export interface Card {
    id: number;
    card_name: string;
    card_holder_name: string;
    card_provider: string;
    last_four_digits: string;
    balance: number;
    created_at: string;
}

// Backend'deki CardCreate şemamızın TypeScript karşılığı
export interface CardCreateInput {
    card_name: string;
    card_holder_name: string;
    card_provider: string;
    last_four_digits: string;
    balance: number;
}

export const cardService = {
    // GET /api/v1/cards/ -> Tüm kartları getir
    getAllCards: async (): Promise<Card[]> => {
        const response = await api.get<Card[]>('/cards/');
        return response.data;
    },

    // POST /api/v1/cards/ -> Yeni kart ekle
    createCard: async (cardData: CardCreateInput): Promise<Card> => {
        const response = await api.post<Card>('/cards/', cardData);
        return response.data;
    },
};