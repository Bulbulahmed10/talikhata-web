import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';

const PWAStatus = () => {
  const [status, setStatus] = useState<'checking' | 'ready' | 'installed' | 'not-supported'>('checking');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkPWAStatus = () => {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        setStatus('not-supported');
        return;
      }

      // Check if app is already installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      
      if (isStandalone) {
        setStatus('installed');
      } else {
        setStatus('ready');
      }
    };

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    checkPWAStatus();

    // Check periodically
    const interval = setInterval(checkPWAStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getStatusInfo = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'চেক হচ্ছে...',
          variant: 'secondary' as const,
          color: 'text-yellow-600'
        };
      case 'ready':
        return {
          icon: <Download className="h-3 w-3" />,
          text: 'ইনস্টল প্রস্তুত',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'installed':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'ইনস্টল করা হয়েছে',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'not-supported':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'PWA সমর্থিত নয়',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'অজানা অবস্থা',
          variant: 'secondary' as const,
          color: 'text-gray-600'
        };
    }
  };

  const statusInfo = getStatusInfo();

  // Only show in development or if there's an issue
  if (status === 'ready' && isOnline && !import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Badge 
        variant={statusInfo.variant}
        className={`flex items-center gap-1 text-xs ${statusInfo.color}`}
      >
        {statusInfo.icon}
        {statusInfo.text}
      </Badge>
      
      {!isOnline && (
        <Badge 
          variant="destructive"
          className="flex items-center gap-1 text-xs mt-1"
        >
          <AlertCircle className="h-3 w-3" />
          অফলাইন
        </Badge>
      )}
    </div>
  );
};

export default PWAStatus; 