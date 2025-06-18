import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Tablet, X } from 'lucide-react';

const PWAInstallPrompt = ({ showOnActivity }) => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      
      const hasBeenDismissed = sessionStorage.getItem('pwaInstallDismissed');
      if (!hasBeenDismissed) {
        setInstallPromptEvent(e);
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA installation');
      } else {
        console.log('User dismissed the PWA installation');
      }
      setInstallPromptEvent(null);
      setIsVisible(false);
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('pwaInstallDismissed', 'true');
  };

  if (!isVisible || !showOnActivity) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-slide-in-up">
      <Tablet className="h-8 w-8" />
      <div>
        <h3 className="font-bold text-lg">Install on Tablet</h3>
        <p className="text-sm">Add this app to your home screen for easy access.</p>
        <p className="text-xs mt-1">Look for "Add to Home Screen" in your browser menu.</p>
        <Button onClick={handleInstallClick} className="mt-2 bg-white text-blue-500 hover:bg-gray-100">
          Install
        </Button>
      </div>
      <button onClick={handleDismiss} className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PWAInstallPrompt;

