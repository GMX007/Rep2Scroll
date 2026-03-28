import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../AppContext';
import Button from './Button';

/**
 * When scroll time is active and the user opens Progress / Ranks / Settings,
 * shows a modal with a live countdown. Can minimize to a floating chip.
 * Timer syncs with scrollEndTime from AppContext (same source as global timer).
 */
export default function ScrollSessionAwayPopup() {
  const { state } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [minimized, setMinimized] = useState(false);
  const [remaining, setRemaining] = useState(0);

  const { isScrolling, scrollEndTime, scrollTimeUp } = state;
  const onEarnRoute = location.pathname === '/';
  const active = isScrolling && scrollEndTime && !scrollTimeUp && !onEarnRoute;

  const tick = useCallback(() => {
    if (!scrollEndTime) return;
    const sec = Math.max(0, Math.round((scrollEndTime - Date.now()) / 1000));
    setRemaining(sec);
  }, [scrollEndTime]);

  useEffect(() => {
    if (!active) {
      setMinimized(false);
      return;
    }
    tick();
    const id = setInterval(tick, 1000);
    const onVis = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active, tick]);

  useEffect(() => {
    if (active) setMinimized(false);
  }, [active, location.pathname]);

  if (!active) return null;

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        style={styles.chip}
        aria-label="Expand scroll time countdown"
      >
        <span style={styles.chipLabel}>Scroll time left</span>
        <span style={styles.chipTime}>{timeStr}</span>
      </button>
    );
  }

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="scroll-away-title">
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        <div style={styles.badge}>{'⏱️'}</div>
        <div id="scroll-away-title" style={styles.title}>
          Scroll time is running
        </div>
        <p style={styles.body}>
          Your earned time keeps counting down while you&apos;re here. When it hits zero, you&apos;ll get a heads-up.
        </p>
        <div style={styles.timer}>{timeStr}</div>
        <div style={styles.actions}>
          <Button onClick={() => navigate('/')} style={{ width: '100%', margin: 0 }}>
            Open full timer {'📱'}
          </Button>
          <button type="button" onClick={() => setMinimized(true)} style={styles.linkish}>
            Minimize — keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.72)',
    zIndex: 220,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    background: 'linear-gradient(165deg, #152058 0%, #0F1647 100%)',
    border: '1px solid rgba(46,204,113,0.25)',
    borderRadius: 20,
    padding: '28px 22px 22px',
    textAlign: 'center',
    boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
  },
  badge: { fontSize: 40, marginBottom: 8 },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26,
    letterSpacing: 1,
    color: '#F4F1EB',
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    color: '#9AA0B8',
    lineHeight: 1.55,
    margin: '0 0 20px',
  },
  timer: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 52,
    letterSpacing: 3,
    color: '#2ECC71',
    marginBottom: 22,
    lineHeight: 1,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  linkish: {
    background: 'none',
    border: 'none',
    color: '#9AA0B8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 8,
    fontFamily: "'DM Sans', sans-serif",
    WebkitTapHighlightColor: 'transparent',
  },
  chip: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 'calc(72px + max(12px, env(safe-area-inset-bottom)))',
    zIndex: 220,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 18px',
    borderRadius: 999,
    background: 'rgba(15,22,71,0.95)',
    border: '1px solid rgba(46,204,113,0.35)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 'min(360px, calc(100% - 32px))',
    WebkitTapHighlightColor: 'transparent',
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#9AA0B8',
  },
  chipTime: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    color: '#2ECC71',
    letterSpacing: 2,
  },
};
