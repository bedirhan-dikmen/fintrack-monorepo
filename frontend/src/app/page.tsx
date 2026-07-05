// frontend/src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardService, CardCreateInput, Card } from '@/services/cardService';
import { CreditCard, Plus, X, Loader2, User, PieChart as ChartIcon, Trash2, Pencil } from 'lucide-react';
// Recharts Bileşenlerini Dahil Ediyoruz
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Grafik renk paleti (Kurumsal Koyu Tema)
const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CardCreateInput>({
    card_name: '',
    card_holder_name: '',
    card_provider: 'Visa',
    last_four_digits: '',
    balance: 0,
  });

  // 1. VERİ ÇEKME: Kartları Getir
  const { data: cards, isLoading, isError } = useQuery({
    queryKey: ['cards'],
    queryFn: cardService.getAllCards,
  });

  // 2. VERİ GÖNDERME: Kart Ekle Mutation
  const createCardMutation = useMutation({
    mutationFn: cardService.createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      closeModal();
    },
    onError: (error) => {
      alert('Kart eklenirken bir mühendislik hatası oluştu!');
      console.error(error);
    },
  });

  // 3. VERİ GÜNCELLEME: Kart Düzenle Mutation
  const updateCardMutation = useMutation({
    mutationFn: cardService.updateCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      closeModal();
    },
    onError: (error) => {
      alert('Kart güncellenirken bir mühendislik hatası oluştu!');
      console.error(error);
    },
  });

  // 4. VERİ SİLME: Kart Sil Mutation
  const deleteCardMutation = useMutation({
    mutationFn: cardService.deleteCard,
    onSuccess: () => {
      // TanStack Query Cache'ini uçurarak ekranın anlık re-render olmasını sağlar
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
    onError: (error) => {
      alert('Kart silinirken backend hatası oluştu!');
      console.error(error);
    },
  });

  // Düzenleme Modunu Açan Yardımcı Fonksiyon
  const handleEditClick = (card: Card) => {
    setEditingCardId(card.id);
    setFormData({
      card_name: card.card_name,
      card_holder_name: card.card_holder_name,
      card_provider: card.card_provider,
      last_four_digits: card.last_four_digits,
      balance: card.balance,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCardId(null);
    setFormData({ card_name: '', card_holder_name: '', card_provider: 'Visa', last_four_digits: '', balance: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.last_four_digits.length !== 4) {
      alert('Son 4 hane tam olarak 4 karakter olmalıdır!');
      return;
    }

    if (editingCardId !== null) {
      // Eğer düzenleme modundaysak update tetikle
      updateCardMutation.mutate({ id: editingCardId, data: formData });
    } else {
      // Yoksa yeni kart ekle
      createCardMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (id: number, cardName: string) => {
    if (confirm(`"${cardName}" isimli kartı silmek istediğinize emin misiniz?`)) {
      deleteCardMutation.mutate(id);
    }
  };

  // 📊 GRAFİK İÇİN VERİ DÖNÜŞTÜRME (Data Transformation)
  const chartData = cards?.map(card => ({
    name: card.card_name,
    value: card.balance
  })) || [];

  // Toplam varlık hesaplaması
  const totalBalance = cards?.reduce((sum, card) => sum + card.balance, 0) || 0;

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Üst Bar / Header */}
      <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            FinTrack Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Kartlarınızı ve finansal analitiğinizi uçtan uca yönetin.</p>
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
          <p className="text-sm">Asenkron veriler yükleniyor...</p>
        </div>
      )}

      {isError && (
        <div className="bg-red-950/30 border border-red-500/50 rounded-xl p-5 text-red-400 text-center">
          Backend API bağlantısı başarısız. Docker konteynerlerini kontrol edin!
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-10">
          {/* 📊 ANALİTİK PANELİ: Recharts Grafik Alanı */}
          {cards && cards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
              <div className="lg:col-span-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <ChartIcon className="w-5 h-5 text-teal-400" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Varlık Dağılımı</span>
                </div>
                <h2 className="text-4xl font-black text-slate-100 font-mono">
                  ₺{totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-xs text-slate-500 mt-1">Sisteme kayıtlı tüm kartların toplam net bakiyesi.</p>
              </div>

              {/* Recharts Pasta Grafiği */}
              <div className="lg:col-span-2 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                      formatter={(value: unknown) => [`₺${Number(value).toLocaleString('tr-TR')}`, 'Bakiye']}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Kartlar Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards?.length === 0 ? (
              <div className="col-span-full text-center py-16 border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                Sisteme kayıtlı kart bulunamadı. İlk kartınızı ekleyerek başlayın!
              </div>
            ) : (
              cards?.map((card) => (
                <div
                  key={card.id}
                  className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 shadow-xl transition-all duration-300 hover:border-slate-700 relative group"
                >
                  {/* Aksiyon Butonları (Sağ Üst Köşe) */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditClick(card)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-amber-400 transition-colors"
                      title="Düzenle"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(card.id, card.card_name)}
                      disabled={deleteCardMutation.isPending}
                      className="p-1.5 bg-slate-800 hover:bg-red-950 border border-slate-700 hover:border-red-900 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-8">
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-emerald-400">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold tracking-widest bg-slate-800 px-2.5 py-1 rounded-md text-slate-400 uppercase mr-14 group-hover:mr-0 transition-all">
                      {card.card_provider}
                    </span>
                  </div>

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
                        <p className="text-sm font-mono font-bold text-slate-300">•••• {card.last_four_digits}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: Kart Ekleme / Düzenleme Formu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={closeModal} className="absolute right-4 top-4 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              {editingCardId !== null ? (
                <>
                  <Pencil className="text-amber-500 w-5 h-5" /> Kart Bilgilerini Güncelle
                </>
              ) : (
                <>
                  <Plus className="text-emerald-500 w-5 h-5" /> Yeni Kart Tanımla
                </>
              )}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kart Takma Adı</label>
                <input
                  type="text" required placeholder="Örn: Maaş Kartı"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                  value={formData.card_name}
                  onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kart Sahibi Adı Soyadı</label>
                <input
                  type="text" required placeholder="Ahmet Yılmaz"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                  value={formData.card_holder_name}
                  onChange={(e) => setFormData({ ...formData, card_holder_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kart Sağlayıcı</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none"
                    value={formData.card_provider}
                    onChange={(e) => setFormData({ ...formData, card_provider: e.target.value })}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Troy">Troy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Son 4 Hanesi</label>
                  <input
                    type="text" required maxLength={4} placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none font-mono"
                    value={formData.last_four_digits}
                    onChange={(e) => setFormData({ ...formData, last_four_digits: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Güncel Bakiye (TL)</label>
                <input
                  type="number" step="0.01" required placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none font-mono"
                  value={formData.balance || ''}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <button
                type="submit" disabled={createCardMutation.isPending || updateCardMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 font-bold py-2.5 px-4 rounded-xl text-white shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                {createCardMutation.isPending || updateCardMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingCardId !== null ? (
                  'Değişiklikleri Kaydet'
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