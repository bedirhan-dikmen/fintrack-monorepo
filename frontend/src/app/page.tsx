'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardService, CardCreateInput } from '@/services/cardService';
import { CreditCard, Plus, X, Loader2, DollarSign, User, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State Yönetimi
  const [formData, setFormData] = useState<CardCreateInput>({
    card_name: '',
    card_holder_name: '',
    card_provider: 'Visa',
    last_four_digits: '',
    balance: 0,
  });

  // 1. VERİ ÇEKME: TanStack Query ile Kartları Listeleme
  const { data: cards, isLoading, isError } = useQuery({
    queryKey: ['cards'],
    queryFn: cardService.getAllCards,
  });

  // 2. VERİ GÖNDERME: Mutation ile Yeni Kart Ekleme (Asenkron)
  const createCardMutation = useMutation({
    mutationFn: cardService.createCard,
    onSuccess: () => {
      // Başarılı olunca 'cards' cache'ini geçersiz kıl ve anlık güncelle!
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setIsModalOpen(false); // Modalı kapat
      setFormData({ card_name: '', card_holder_name: '', card_provider: 'Visa', last_four_digits: '', balance: 0 }); // Formu sıfırla
    },
    onError: (error) => {
      alert('Kart eklenirken bir mühendislik hatası oluştu!');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.last_four_digits.length !== 4) {
      alert('Son 4 hane tam olarak 4 karakter olmalıdır!');
      return;
    }
    createCardMutation.mutate(formData);
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Üst Bar / Header */}
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            FinTrack Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Kartlarınızı ve finansal akışınızı uçtan uca yönetin.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-5 h-5" />
          Kart Ekle
        </button>
      </header>

      {/* Yükleniyor / Hata Durumları */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-sm">Kartlar güvenli asenkron hattan çekiliyor...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-5 text-red-400 text-center">
          Backend API bağlantısı başarısız. Docker container&apos;larının açık olduğundan emin olun!
        </div>
      )}

      {/* Kartlar Listesi (Grid Yapı) */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards?.length === 0 ? (
            <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
              Sisteme kayıtlı kart bulunamadı. İlk kartınızı ekleyerek başlayın!
            </div>
          ) : (
            cards?.map((card) => (
              <div
                key={card.id}
                className="relative overflow-hidden p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700"
              >
                {/* Kart Tasarımı Üst Kısım */}
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-emerald-400">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest bg-slate-800 px-2.5 py-1 rounded-md text-slate-400 uppercase">
                    {card.card_provider}
                  </span>
                </div>

                {/* Kart Bilgileri Orta Bölüm */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">{card.card_name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{card.card_holder_name}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Bakiye</p>
                      <p className="text-xl font-black text-emerald-400 font-mono">
                        ₺{card.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Numara</p>
                      <p className="text-sm font-mono font-bold text-slate-300">•••• •••• •••• {card.last_four_digits}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: Kart Ekleme Açılır Formu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="text-emerald-500 w-5 h-5" /> Yeni Kart Tanımla
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kart Takma Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Maaş Kartı, Ticari Kart"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-all"
                  value={formData.card_name}
                  onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kart Sahibi Adı Soyadı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-all"
                  value={formData.card_holder_name}
                  onChange={(e) => setFormData({ ...formData, card_holder_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kart Sağlayıcı</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-all"
                    value={formData.card_provider}
                    onChange={(e) => setFormData({ ...formData, card_provider: e.target.value })}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Troy">Troy</option>
                    <option value="Amex">Amex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Son 4 Hanesi</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-all font-mono"
                    value={formData.last_four_digits}
                    onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Başlangıç Bakiyesi (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none transition-all font-mono"
                  value={formData.balance || ''}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <button
                type="submit"
                disabled={createCardMutation.isPending}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 font-bold py-2.5 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                {createCardMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                  </>
                ) : (
                  'Sisteme Kaydet'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}