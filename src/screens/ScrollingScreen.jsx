import React, { useState, useEffect, useRef } from 'react';
import Button from '../components/Button';
import { scheduleScrollEndNotification, cancelScrollEndNotification } from '../services/notificationService';

/**
 * Shown while the user is "scrolling" — using their earned screen time.
 * Timer uses wall-clock time (Date.now) so it keeps counting even when
 * the user switches to another app or the browser tab is backgrounded.
 */
export default function ScrollingScreen({ onStop, minutes = 0, scrollEndTime = null }) {
  const totalSeconds = Math.floor(minutes * 60);

  // Use persisted end time if available (survives app restarts), otherwise compute fresh
  const endTimeRef = useRef(scrollEndTime || Date.now() + totalSeconds * 1000);
  const computedRemaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
  const [remaining, setRemaining] = useState(computedRemaining);
  const [timeUp, setTimeUp] = useState(computedRemaining <= 0);

  // Schedule SW notification on mount, cancel on unmount
  useEffect(() => {
    scheduleScrollEndNotification(endTimeRef.current);
    return () => cancelScrollEndNotification();
  }, []);

  useEffect(() => {
    // Already expired when screen mounted (e.g. returned after long absence)
    if (computedRemaining <= 0) {
      setTimeUp(true);
      cancelScrollEndNotification();
      return;
    }

    const tick = () => {
      const secondsLeft = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        cancelScrollEndNotification();
        setTimeUp(true);
      }
    };

    // Tick immediately on mount and when tab becomes visible again
    tick();
    const interval = setInterval(tick, 1000);

    // Page Visibility API — recalculate when user comes back to the app
    const handleVisibilityChange = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  // Calculate original duration from end time for accurate progress ring
  const originalDuration = totalSeconds > 0 ? totalSeconds : Math.max(1, Math.round((endTimeRef.current - (Date.now() - remaining * 1000)) / 1000));
  const progress = originalDuration > 0 ? remaining / originalDuration : 0;

  // Time's Up overlay — shown when timer hits zero
  if (timeUp) {
    return (
      <div style={styles.timeUpScreen}>
        <div style={styles.timeUpGlow} />
        <div style={styles.timeUpContent}>
          <div style={styles.timeUpEmoji}>⏰</div>
          <div style={styles.timeUpTitle}>TIME'S UP!</div>
          <div style={styles.timeUpSub}>
            Your scroll time has run out. Ready to earn more? 💪
          </div>
          <div style={styles.timeUpCard}>
            <div style={{ fontSize: 13, color: '#9AA0B8', lineHeight: 1.6 }}>
              You earned your scroll time — great work! Come back, do another set, and unlock even more.
            </div>
          </div>
          <Button onClick={onStop}>
            Let's Earn More! 🔥
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.screen}>
      <div style={styles.glow} />

      <div style={styles.content}>
        <div style={styles.label}>Scroll Time Active</div>
        <div style={styles.timer}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div style={styles.sub}>
          Enjoy your earned screen time. When the timer runs out, come back and earn more.
        </div>

        {/* Progress ring */}
        <div style={styles.ringContainer}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="80" cy="80" r="70"
              fill="none"
              stroke="url(#scrollGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progress)}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <defs>
              <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2ECC71" />
                <stop offset="100%" stopColor="#27AE60" />
              </linearGradient>
            </defs>
          </svg>
          <div style={styles.ringText}>{'📱'}</div>
        </div>

        <div style={{ marginTop: 32 }}>
          <Button onClick={onStop}>
            Back to Exercise →
          </Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    background: '#0F1647',
    minHeight: '100%',
    padding: '40px 0 100px',
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(46,204,113,0.2) 0%, transparent 70%)',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  content: {
    textAlign: 'center',
    padding: '20px 24px',
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#2ECC71',
    marginBottom: 12,
  },
  timer: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 64,
    color: '#F4F1EB',
    letterSpacing: 4,
    lineHeight: 1,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    color: '#9AA0B8',
    lineHeight: 1.6,
    maxWidth: 280,
    margin: '0 auto 24px',
  },
  ringContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    margin: '0 auto',
  },
  ringText: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
  },
  timeUpScreen: {
    background: 'linear-gradient(165deg, #0F1647 0%, #1a0a2e 50%, #0F1647 100%)',
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  timeUpGlow: {
    position: 'absolute',
    width: 350,
    height: 350,
    background: 'radial-gradient(circle, rgba(232,83,58,0.3) 0%, transparent 70%)',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  timeUpContent: {
    textAlign: 'center',
    padding: '40px 28px',
    position: 'relative',
    zIndex: 1,
  },
  timeUpEmoji: {
    fontSize: 72,
    marginBottom: 12,
    animation: 'pulse 1s ease-in-out infinite alternate',
  },
  timeUpTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 56,
    letterSpacing: 4,
    color: '#E8533A',
    lineHeight: 1,
    marginBottom: 12,
    textShadow: '0 0 40px rgba(232,83,58,0.5)',
  },
  timeUpSub: {
    fontSize: 16,
    color: '#F4F1EB',
    marginBottom: 24,
    lineHeight: 1.5,
  },
  timeUpCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '16px',
    marginBottom: 28,
    textAlign: 'left',
  },
};
