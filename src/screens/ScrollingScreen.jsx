import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../components/Button';
import { scheduleScrollEndNotification, cancelScrollEndNotification } from '../services/notificationService';

/**
 * Shown while the user is "scrolling" — using their earned screen time.
 * Timer uses wall-clock time (Date.now) so it keeps counting even when
 * the user switches to another app or the browser tab is backgrounded.
 *
 * Features a Picture-in-Picture floating timer that stays visible over other apps.
 */
export default function ScrollingScreen({ onStop, minutes = 0, scrollEndTime = null }) {
  const totalSeconds = Math.floor(minutes * 60);

  // Use persisted end time if available (survives app restarts), otherwise compute fresh
  const endTimeRef = useRef(scrollEndTime || Date.now() + totalSeconds * 1000);
  const computedRemaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
  const [remaining, setRemaining] = useState(computedRemaining);
  const [timeUp, setTimeUp] = useState(computedRemaining <= 0);
  const [pipActive, setPipActive] = useState(false);

  // PiP refs
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const pipAnimRef = useRef(null);
  const remainingRef = useRef(remaining); // ref so PiP draw loop stays current

  // Keep remainingRef in sync
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

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

  // ─── Picture-in-Picture floating timer ───
  const drawPipCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const sec = remainingRef.current;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const pct = totalSeconds > 0 ? sec / totalSeconds : 0;

    // Background
    ctx.fillStyle = '#0F1647';
    ctx.fillRect(0, 0, 300, 180);

    // Progress bar background
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(20, 140, 260, 16, 8);
    ctx.fill();

    // Progress bar fill
    const grad = ctx.createLinearGradient(20, 0, 280, 0);
    grad.addColorStop(0, '#2ECC71');
    grad.addColorStop(1, '#27AE60');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(20, 140, Math.max(0, 260 * pct), 16, 8);
    ctx.fill();

    // Label
    ctx.fillStyle = '#2ECC71';
    ctx.font = '600 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCROLL TIME LEFT', 150, 35);

    // Timer
    ctx.fillStyle = '#F4F1EB';
    ctx.font = '700 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, 150, 115);

    if (sec <= 0) {
      // Show "TIME'S UP" overlay
      ctx.fillStyle = 'rgba(15,22,71,0.85)';
      ctx.fillRect(0, 0, 300, 180);
      ctx.fillStyle = '#E8533A';
      ctx.font = '700 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("TIME'S UP!", 150, 100);
    }

    pipAnimRef.current = requestAnimationFrame(drawPipCanvas);
  }, [totalSeconds]);

  const startPip = useCallback(async () => {
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      // Draw initial frame
      drawPipCanvas();

      // Stream canvas to video
      const stream = canvas.captureStream(10); // 10fps is fine for a countdown
      video.srcObject = stream;
      await video.play();

      // Request PiP
      if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        setPipActive(true);
      }
    } catch (err) {
      console.warn('[SweatNScroll] PiP not supported:', err.message);
      // Fallback: just minimize the browser — the notification will still work
    }
  }, [drawPipCanvas]);

  // Clean up PiP on unmount
  useEffect(() => {
    return () => {
      if (pipAnimRef.current) cancelAnimationFrame(pipAnimRef.current);
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
    };
  }, []);

  // Listen for PiP close
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLeave = () => {
      setPipActive(false);
      if (pipAnimRef.current) cancelAnimationFrame(pipAnimRef.current);
    };
    video.addEventListener('leavepictureinpicture', onLeave);
    return () => video.removeEventListener('leavepictureinpicture', onLeave);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const originalDuration = totalSeconds > 0 ? totalSeconds : Math.max(1, Math.round((endTimeRef.current - (Date.now() - remaining * 1000)) / 1000));
  const progress = originalDuration > 0 ? remaining / originalDuration : 0;

  const pipSupported = typeof document !== 'undefined' && 'pictureInPictureEnabled' in document;

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

      {/* Hidden PiP canvas and video */}
      <canvas ref={canvasRef} width={300} height={180} style={{ display: 'none' }} />
      <video ref={videoRef} playsInline muted style={{ width: 0, height: 0, position: 'absolute' }} />

      <div style={styles.content}>
        <div style={styles.label}>Scroll Time Left</div>
        <div style={styles.timer}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div style={styles.sub}>
          Go use your phone! When the timer runs out, come back and earn more.
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

        {/* Go Scroll / Floating Timer button */}
        {pipSupported && !pipActive && (
          <div style={{ marginTop: 24 }}>
            <Button onClick={startPip}>
              {'🚀'} Go Scroll — Floating Timer
            </Button>
            <div style={styles.pipHint}>
              Opens a mini timer that stays on your screen while you use other apps
            </div>
          </div>
        )}

        {pipActive && (
          <div style={styles.pipActiveCard}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{'✅'}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#2ECC71' }}>
              Floating timer active!
            </div>
            <div style={{ fontSize: 12, color: '#9AA0B8', marginTop: 4 }}>
              Go use your phone — the timer will stay on screen
            </div>
          </div>
        )}

        <div style={{ marginTop: pipActive || !pipSupported ? 24 : 12 }}>
          <Button variant="secondary" onClick={onStop}>
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
  pipHint: {
    fontSize: 11,
    color: '#9AA0B8',
    marginTop: 8,
    lineHeight: 1.4,
  },
  pipActiveCard: {
    margin: '24px auto 0',
    maxWidth: 280,
    background: 'rgba(46,204,113,0.08)',
    border: '1px solid rgba(46,204,113,0.25)',
    borderRadius: 16,
    padding: '16px',
    textAlign: 'center',
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
