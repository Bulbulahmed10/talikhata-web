import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Download, CheckCircle, AlertCircle } from "lucide-react";

interface PWAStatusProps {
  showDetails?: boolean;
  className?: string;
}

const PWAStatus = ({ showDetails = false, className = "" }: PWAStatusProps) => {
  const [status, setStatus] = useState({
    isInstalled: false,
    isOnline: true,
    hasServiceWorker: false,
    hasInstallPrompt: false
  });

  useEffect(() => {
    const checkStatus = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      
      setStatus({
        isInstalled,
        isOnline: navigator.onLine,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasInstallPrompt: false // This will be updated by the install button component
      });
    };

    checkStatus();
    
    // Listen for online/offline events
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {status.isInstalled && (
          <Badge variant="secondary" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            ইন্সটলড
          </Badge>
        )}
        {!status.isOnline && (
          <Badge variant="destructive" className="text-xs">
            <WifiOff className="w-3 h-3 mr-1" />
            অফলাইন
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 p-3 bg-muted rounded-lg ${className}`}>
      <h4 className="text-sm font-medium">PWA স্ট্যাটাস</h4>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">ইন্সটলেশন:</span>
          <Badge variant={status.isInstalled ? "default" : "secondary"} className="text-xs">
            {status.isInstalled ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                ইন্সটলড
              </>
            ) : (
              <>
                <Download className="w-3 h-3 mr-1" />
                ইন্সটল নয়
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">সংযোগ:</span>
          <Badge variant={status.isOnline ? "default" : "destructive"} className="text-xs">
            {status.isOnline ? (
              <>
                <Wifi className="w-3 h-3 mr-1" />
                অনলাইন
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1" />
                অফলাইন
              </>
            )}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">সার্ভিস ওয়ার্কার:</span>
          <Badge variant={status.hasServiceWorker ? "default" : "secondary"} className="text-xs">
            {status.hasServiceWorker ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                সক্রিয়
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                অসমর্থিত
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PWAStatus; 