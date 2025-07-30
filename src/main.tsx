import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'
import App from './App.tsx'
import './index.css'

// Initialize PWA
import './lib/pwa'

// Add PWA debug utility in development
if (import.meta.env.DEV) {
  import('./lib/pwa-debug').then(({ debugPWA }) => {
    (window as any).debugPWA = debugPWA;
    console.log('🔧 PWA Debug available: Type debugPWA() in console');
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
