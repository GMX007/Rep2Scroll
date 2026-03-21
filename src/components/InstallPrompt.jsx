import React, { useState, useEffect } from 'react';
import Button from './Button';

/**
 * PWA Install Banner — shows after the user completes their first exercise session.
 * "Add SweatNScroll to your home screen for the full experience"
 * Never shows again if dismissed twice.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check how many times user has dismissed
    const dismissCount = parseInt(localStorage.getItem('sweatnscroll_install_dismiss') || '0', 10);
    if (dismissCount >= 2) {
      setDismissed(true);
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS (no beforeinstallprompt), show manual instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !navigator.standalone) {
      // Delay a bit so it doesn't appear immediately
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS — show manual instructions
      alert('Tap the Share button in Safari, then tap "Add to Home Screen"');
    }
  };

  const handleDismiss = () => {
    const current = parseInt(localStorage.getItem('sweatnscroll_install_dismiss') || '0', 10);
    localStorage.setItem('sweatnscroll_install_dismiss', String(current + 1));
    setShowBanner(false);
    if (current + 1 >= 2) setDismissed(true);
  };

  if (!showBanner || dismissed) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.icon}>{'📲'}</div>
      <div style={styles.text}>
        <div style={styles.title}>Add SweatNScroll to your home screen</div>
        <div style={styles.sub}>Get the full experience with quick access</div>
      </div>
      <div style={styles.actions}>
        <button onClick={handleInstall} style={styles.installBtn}>Install</button>
        <button onClick={handleDismiss} style={styles.laterBtn}>Maybe Later</button>
      </div>
    </div>
  );
}

const styles = {
  banner: {
    position: 'fixed',
    bottom: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 32px)',
    maxWidth: 400,
    background: '#1A1A28',
    border: '1px solid rgba(232,83,58,0.3)',
    borderRadius: 16,
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    zIndex: 90,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    animation: 'slide-up 0.3s ease',
  },
  icon: {
    fontSize: 28,
  },
  text: {},
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#F4F1EB',
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: '#9AA0B8',
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  installBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #E8533A, #C0392B)',
    border: 'none',
    borderRadius: 10,
    padding: '10px 16px',
    color: 'white',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  laterBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 16px',
    color: '#9AA0B8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
};
