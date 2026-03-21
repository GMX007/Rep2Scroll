import React, { useState, useEffect } from 'react';

/**
 * PWA Install Banner — shows right after onboarding completes.
 * Orange install button with blue sweatdrop icon.
 * Never shows again if dismissed twice.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissCount = parseInt(localStorage.getItem('sweatnscroll_install_dismiss') || '0', 10);
    if (dismissCount >= 2) {
      setDismissed(true);
      return;
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setDismissed(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !navigator.standalone) {
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

  // Blue sweatdrop SVG icon
  const SweatDrop = () => (
    <svg width="20" height="24" viewBox="0 0 20 24" style={{ marginRight: 6, verticalAlign: 'middle' }}>
      <path
        d="M10 0 C10 0 0 12 0 16 C0 20.4 4.5 24 10 24 C15.5 24 20 20.4 20 16 C20 12 10 0 10 0Z"
        fill="#64B5F6"
      />
      <ellipse cx="7" cy="15" rx="2.5" ry="3" fill="rgba(255,255,255,0.3)" />
    </svg>
  );

  return (
    <div style={styles.banner}>
      <div style={styles.topRow}>
        <div style={styles.iconWrap}>{'📱'}</div>
        <div style={styles.text}>
          <div style={styles.title}>Add to your home screen!</div>
          <div style={styles.sub}>Quick access to your workouts ✨</div>
        </div>
      </div>
      <div style={styles.actions}>
        <button onClick={handleInstall} style={styles.installBtn}>
          <SweatDrop /> Add to Home Screen
        </button>
        <button onClick={handleDismiss} style={styles.laterBtn}>Maybe later</button>
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
    background: '#1A2060',
    border: '1px solid rgba(232,83,58,0.3)',
    borderRadius: 24,
    padding: '18px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    zIndex: 90,
    boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
    animation: 'slide-up 0.3s ease',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    fontSize: 28,
    width: 48,
    height: 48,
    borderRadius: 16,
    background: 'rgba(232,83,58,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 15,
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
    flexDirection: 'column',
    gap: 8,
  },
  installBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #E8533A, #D4432A)',
    border: 'none',
    borderRadius: 20,
    padding: '14px 20px',
    color: 'white',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(232,83,58,0.35)',
  },
  laterBtn: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderRadius: 16,
    padding: '10px 16px',
    color: '#9AA0B8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
};
