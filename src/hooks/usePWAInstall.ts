/**
 * PWA Installation & Service Worker Lifecycle Hook
 * Captures beforeinstallprompt event for 1-tap reinstallation, detects standalone mode,
 * and provides manual update checking against Vercel/CDN.
 */

import { useState, useEffect, useCallback } from 'react';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // Check standalone display mode
  useEffect(() => {
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(Boolean(isStandalone));
    };

    checkStandalone();
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Capture beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall as EventListener);
  }, []);

  // 1-tap install trigger
  const installPWA = useCallback(async () => {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.warn('[PWA] Installation prompt failed:', err);
    }
  }, [installPrompt]);

  // Manually check for service worker updates
  const checkForUpdate = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setUpdateStatus('Service workers unsupported.');
      return;
    }

    setIsCheckingUpdate(true);
    setUpdateStatus(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setUpdateStatus('App is up to date.');
        setIsCheckingUpdate(false);
        return;
      }

      await registration.update();
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        setUpdateStatus('New update applied! Reloading...');
        setTimeout(() => window.location.reload(), 800);
      } else {
        setUpdateStatus('You are on the latest version.');
        setTimeout(() => setUpdateStatus(null), 3000);
      }
    } catch {
      setUpdateStatus('Could not verify updates.');
      setTimeout(() => setUpdateStatus(null), 3000);
    } finally {
      setIsCheckingUpdate(false);
    }
  }, []);

  return {
    isInstallable: Boolean(installPrompt),
    isInstalled,
    installPWA,
    checkForUpdate,
    isCheckingUpdate,
    updateStatus,
  };
}
