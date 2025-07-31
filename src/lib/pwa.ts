// PWA Service Registration and Management

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installButton: HTMLElement | null = null;
  private isInstalled: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupOfflineDetection();
    this.checkInstallStatus();
  }

  // Check if app is already installed
  private checkInstallStatus() {
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  // Register Service Worker
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        console.log('Service Worker registered successfully:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker updated, reloading...');
          window.location.reload();
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker not supported');
    }
  }

  // Setup Install Prompt
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('Install prompt triggered');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
      this.showInstallSuccessNotification();
    });

    // Check for standalone mode on load
    window.addEventListener('load', () => {
      this.checkInstallStatus();
    });
  }

  // Setup Offline Detection
  private setupOfflineDetection() {
    window.addEventListener('online', () => {
      console.log('App is online');
      this.showOnlineNotification();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.showOfflineNotification();
    });
  }

  // Show Install Button
  public showInstallButton() {
    // Don't show if already installed
    if (this.isInstalled) {
      return;
    }

    // Create install button if it doesn't exist
    if (!this.installButton) {
      this.installButton = document.createElement('div');
      this.installButton.id = 'pwa-install-button';
      this.installButton.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 12px 20px;
          border-radius: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          z-index: 1000;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          animation: slideIn 0.3s ease;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          অ্যাপ ইনস্টল করুন
        </div>
        <style>
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;
      
      this.installButton.addEventListener('click', () => {
        this.installApp();
      });
      
      document.body.appendChild(this.installButton);
    }
  }

  // Hide Install Button
  public hideInstallButton() {
    if (this.installButton) {
      this.installButton.remove();
      this.installButton = null;
    }
  }

  // Install App
  public async installApp() {
    if (this.deferredPrompt) {
      try {
        await this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        
        if (outcome === 'accepted') {
          console.log('App installation accepted');
          this.isInstalled = true;
        } else {
          console.log('App installation dismissed');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
      } catch (error) {
        console.error('Install prompt failed:', error);
        this.showToast('ইন্সটল ত্রুটি', 'ইন্সটল করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
      }
    }
  }

  // Show Install Success Notification
  private showInstallSuccessNotification() {
    this.showToast('ইন্সটল সফল', 'তালিখাতা সফলভাবে ইন্সটল হয়েছে!', 'success');
  }

  // Show Update Notification
  private showUpdateNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 300px;
        animation: slideIn 0.3s ease;
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <strong>নতুন আপডেট</strong>
        </div>
        <p style="margin: 0 0 12px 0; font-size: 14px;">
          নতুন সংস্করণ পাওয়া গেছে। আপডেট করতে রিফ্রেশ করুন।
        </p>
        <button onclick="this.parentElement.remove(); window.location.reload();" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">
          আপডেট করুন
        </button>
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Show Online Notification
  private showOnlineNotification() {
    this.showToast('অনলাইন', 'আপনার ইন্টারনেট সংযোগ পুনরুদ্ধার হয়েছে।', 'success');
  }

  // Show Offline Notification
  private showOfflineNotification() {
    this.showToast('অফলাইন', 'আপনার ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে।', 'warning');
  }

  // Show Toast Notification
  private showToast(title: string, message: string, type: 'success' | 'warning' | 'error') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#F44336';
    
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 300px;
        text-align: center;
        animation: slideIn 0.3s ease;
      ">
        <strong>${title}</strong><br>
        ${message}
      </div>
      <style>
        @keyframes slideIn {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 3000);
  }

  // Check if app is installed
  public isAppInstalled(): boolean {
    return this.isInstalled || 
           window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  // Get PWA status
  public getPWAStatus() {
    return {
      isInstalled: this.isAppInstalled(),
      isOnline: navigator.onLine,
      hasServiceWorker: 'serviceWorker' in navigator,
      hasInstallPrompt: this.deferredPrompt !== null
    };
  }

  // Force check install status
  public refreshInstallStatus() {
    this.checkInstallStatus();
  }
}

// Create and export PWA service instance
export const pwaService = new PWAService();

// Export for use in components
export default pwaService; 