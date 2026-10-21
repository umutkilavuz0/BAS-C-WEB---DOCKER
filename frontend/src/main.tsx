import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Global QueryClient Konfigürasyonu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Kullanıcı başka bir sekmeden geri döndüğünde veya pencereye odaklandığında
      // gereksiz yere tekrar fetch atmasını engeller (performans için kritik)
      refetchOnWindowFocus: false, 
      
      // İnternet kopup geri geldiğinde otomatik tekrar dene
      refetchOnReconnect: true, 
      
      // Hata durumunda kaç kez tekrar deneneceği
      retry: 1, 
      
      // Verinin "bayat" (stale) kabul edilme süresi (örn: 5 dakika boyunca tekrar fetch atmaz)
      staleTime: 1000 * 60 * 5, 
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);