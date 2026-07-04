// frontend/src/app/providers.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }: { children: React.ReactNode }) {
    // Her istekte sıfırdan oluşmaması için state içinde tutuyoruz
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false, // Tarayıcı sekmesi değiştiğinde gereksiz istek atma
                staleTime: 1000 * 60 * 5,    // Veriyi 5 dakika taze kabul et
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}