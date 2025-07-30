import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    // Listen for display mode changes
    const handleDisplayModeChange = () => {
      checkIfInstalled();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    // Show install button if PWA is supported but not installed
    if ('serviceWorker' in navigator && !isInstalled) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        
        if (outcome === 'accepted') {
          console.log('App installation accepted');
          setShowInstallButton(false);
          setDeferredPrompt(null);
        } else {
          console.log('App installation dismissed');
        }
      } catch (error) {
        console.error('Install prompt failed:', error);
        // Fallback: show manual installation instructions
        showManualInstallInstructions();
      }
    } else {
      // No prompt available, show manual instructions
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = '';
    let title = '';

    if (isMobile) {
      if (isIOS) {
        title = 'iOS এ অ্যাপ ইনস্টল করুন';
        instructions = `
          <div style="text-align: left; line-height: 1.6;">
            <p><strong>iOS এ অ্যাপ ইনস্টল করার নিয়ম:</strong></p>
            <ol>
              <li>Safari ব্রাউজারে এই ওয়েবসাইট খুলুন</li>
              <li>নিচের দিকে Share বাটনে ট্যাপ করুন</li>
              <li>"Add to Home Screen" অপশন নির্বাচন করুন</li>
              <li>"Add" বাটনে ট্যাপ করুন</li>
              <li>আপনার হোম স্ক্রিনে অ্যাপ দেখা যাবে</li>
            </ol>
          </div>
        `;
      } else if (isAndroid) {
        title = 'Android এ অ্যাপ ইনস্টল করুন';
        instructions = `
          <div style="text-align: left; line-height: 1.6;">
            <p><strong>Android এ অ্যাপ ইনস্টল করার নিয়ম:</strong></p>
            <ol>
              <li>Chrome ব্রাউজারে এই ওয়েবসাইট খুলুন</li>
              <li>Address bar এ "Install" বাটন দেখুন</li>
              <li>অথবা Menu → "Add to Home screen" ক্লিক করুন</li>
              <li>"Add" বাটনে ট্যাপ করুন</li>
              <li>আপনার হোম স্ক্রিনে অ্যাপ দেখা যাবে</li>
            </ol>
          </div>
        `;
      }
    } else {
      title = 'Desktop এ অ্যাপ ইনস্টল করুন';
      instructions = `
        <div style="text-align: left; line-height: 1.6;">
          <p><strong>Desktop এ অ্যাপ ইনস্টল করার নিয়ম:</strong></p>
          <ol>
            <li>Chrome বা Edge ব্রাউজার ব্যবহার করুন</li>
            <li>Address bar এ "+" আইকন দেখুন</li>
            <li>"Install" বাটনে ক্লিক করুন</li>
            <li>অথবা Ctrl+Shift+I → Application → Manifest → Install</li>
            <li>আপনার ডেস্কটপে অ্যাপ দেখা যাবে</li>
          </ol>
        </div>
      `;
    }

    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #4CAF50;">${title}</h2>
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
              background: none;
              border: none;
              font-size: 24px;
              cursor: pointer;
              color: #666;
            ">×</button>
          </div>
          ${instructions}
          <div style="margin-top: 20px; text-align: center;">
            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
            ">বুঝেছি</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  // Don't show if already installed or if PWA is not supported
  if (isInstalled || !('serviceWorker' in navigator)) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <Button
        onClick={handleInstallClick}
        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '25px',
          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <Download className="h-4 w-4" />
        অ্যাপ ইনস্টল করুন
      </Button>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default PWAInstallButton; 