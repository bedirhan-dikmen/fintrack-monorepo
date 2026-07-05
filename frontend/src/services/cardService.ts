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

// Güncelleme için tüm alanları isteğe bağlı (Optional) yapıyoruz
export type CardUpdateInput = Partial<CardCreateInput>;

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

    // PATCH /cards/{id} -> Kart güncelle
    updateCard: async ({ id, data }: { id: number; data: CardUpdateInput }): Promise<Card> => {
        const response = await api.patch<Card>(`/cards/${id}`, data);
        return response.data;
    },

    // DELETE /cards/{id} -> Kart sil
    deleteCard: async (id: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/cards/${id}`);
        return response.data;
    },
};