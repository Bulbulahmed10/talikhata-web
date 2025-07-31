import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  showInstalledStatus?: boolean;
}

const PWAInstallButton = ({ 
  variant = "default", 
  size = "sm", 
  className = "",
  showText = true,
  showInstalledStatus = true
}: PWAInstallButtonProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Check if app is already installed
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
      setIsInstalled(isStandalone);
    };

    checkIfInstalled();
    window.addEventListener('appinstalled', checkIfInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', checkIfInstalled);
    };
  }, []);

  // PWA install prompt logic
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === "accepted") {
          toast({
            title: "ইন্সটল সফল",
            description: "তালিখাতা সফলভাবে ইন্সটল হয়েছে!",
          });
          setShowInstall(false);
          setIsInstalled(true);
        } else {
          toast({
            title: "ইন্সটল বাতিল",
            description: "আপনি ইন্সটল বাতিল করেছেন।",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Install prompt failed:', error);
        toast({
          title: "ইন্সটল ত্রুটি",
          description: "ইন্সটল করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
          variant: "destructive",
        });
      }
      setDeferredPrompt(null);
    }
  };

  // Don't render if not mobile or already installed
  if (!isMobile || (isInstalled && !showInstalledStatus)) {
    return null;
  }

  // Show installed status
  if (isInstalled && showInstalledStatus) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
        <CheckCircle className="w-3 h-3" />
        <span className="hidden sm:inline">ইন্সটলড</span>
      </div>
    );
  }

  // Show install button
  if (showInstall) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleInstallClick}
        className={`gap-1 ${className}`}
        title="অ্যাপ ইন্সটল করুন"
      >
        <Download className="h-4 w-4" />
        {showText && <span className="hidden sm:inline">ইন্সটল</span>}
      </Button>
    );
  }

  return null;
};

export default PWAInstallButton; 