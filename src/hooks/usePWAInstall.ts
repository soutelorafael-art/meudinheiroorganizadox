import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type DevicePlatform = 'android' | 'ios' | 'desktop';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<DevicePlatform>('desktop');
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [canWebShare, setCanWebShare] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed on Android or iPhone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect Android vs iOS (including iPadOS 13+ reporting as MacIntel with touch points)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);

    if (isIOSDevice) {
      setPlatform('ios');
      const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|opios/.test(ua);
      setIsIOSSafari(isSafari);
    } else if (isAndroidDevice) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    setCanWebShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (ev: MediaQueryListEvent) => {
      setIsInstalled(ev.matches);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const shareApp = useCallback(async () => {
    if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
      return false;
    }
    try {
      await navigator.share({
        title: 'Meu Dinheiro Organizado',
        text: 'Instale o app Meu Dinheiro Organizado no seu Android ou iPhone:',
        url: window.location.origin,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isIOSSafari,
    platform,
    canWebShare,
    install,
    shareApp,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
