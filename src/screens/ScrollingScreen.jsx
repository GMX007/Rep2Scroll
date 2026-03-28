import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from '../components/Button';
import { scheduleScrollEndNotification, cancelScrollEndNotification } from '../services/notificationService';

function drawScrollPipFrame(ctx, width, height, sec, totalSec) {
  ctx.fillStyle = '#0F1647';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(20, 140, 260, 16);

  const pct = totalSec > 0 ? Math.min(1, sec / totalSec) : 0;
  const grad = ctx.createLinearGradient(20, 0, 280, 0);
  grad.addColorStop(0, '#2ECC71');
  grad.addColorStop(1, '#27AE60');
  ctx.fillStyle = grad;
  ctx.fillRect(20, 140, Math.max(0, 260 * pct), 16);

  ctx.fillStyle = '#2ECC71';
  ctx.font = '600 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCROLL TIME LEFT', width / 2, 35);

  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  ctx.fillStyle = '#F4F1EB';
  ctx.font = '700 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, width / 2, 115);

  if (sec <= 0) {
    ctx.fillStyle = 'rgba(15,22,71,0.85)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#E8533A';
    ctx.font = '700 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("TIME'S UP!", width / 2, 100);
  }
}

export default function ScrollingScreen({ onStop, minutes = 0, scrollEndTime = null, forceTimeUp = false }) {
  const totalSeconds = Math.floor(minutes * 60);
  const endTimeRef = useRef(scrollEndTime || Date.now() + totalSeconds * 1000);
  const computedRemaining = forceTimeUp ? 0 : Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
  const [remaining, setRemaining] = useState(computedRemaining);
  const [timeUp, setTimeUp] = useState(forceTimeUp || computedRemaining <= 0);
  const [pipActive, setPipActive] = useState(false);
  const [pipError, setPipError] = useState(null);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const pipAnimRef = useRef(null);
  const remainingRef = useRef(remaining);

  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  useEffect(() => {
    if (scrollEndTime != null) {
      endTimeRef.current = scrollEndTime;
    }
  }, [scrollEndTime]);

  useEffect(() => {
    scheduleScrollEndNotification(endTimeRef.current);
    return () => cancelScrollEndNotification();
  }, []);

  useEffect(() => {
    // If forceTimeUp is set from outside (global timer fired), go straight to time's up
    if (forceTimeUp) {
      setTimeUp(true);
      cancelScrollEndNotification();
      return;
    }

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

    tick();
    const interval = setInterval(tick, 1000);
    const handleVisibilityChange = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceTimeUp]);

  const startPip = useCallback(async () => {
    setPipError(null);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    if (typeof canvas.captureStream !== 'function') {
      setPipError('Floating timer needs a browser that supports canvas video (try Chrome on desktop).');
      return;
    }
    if (typeof video.requestPictureInPicture !== 'function') {
      setPipError('Picture-in-picture is not supported on this device (common on iPhone). Keep the app open or use another browser.');
      return;
    }

    try {
      if (pipAnimRef.current) {
        cancelAnimationFrame(pipAnimRef.current);
        pipAnimRef.current = null;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setPipError('Could not draw timer.');
        return;
      }
      drawScrollPipFrame(ctx, canvas.width, canvas.height, remainingRef.current, totalSeconds);

      const stream = canvas.captureStream(30);
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('width', String(canvas.width));
      video.setAttribute('height', String(canvas.height));
      // Start play without awaiting first — PiP must be requested in the same user-gesture turn as the button click.
      const playPromise = video.play();
      await video.requestPictureInPicture();
      setPipActive(true);
      await playPromise;

      const loop = () => {
        const c = canvasRef.current;
        const cctx = c?.getContext('2d');
        if (c && cctx) {
          drawScrollPipFrame(cctx, c.width, c.height, remainingRef.current, totalSeconds);
        }
        pipAnimRef.current = requestAnimationFrame(loop);
      };
      pipAnimRef.current = requestAnimationFrame(loop);
    } catch (err) {
      console.warn('[SweatNScroll] PiP failed:', err);
      setPipError(err?.message || 'Could not open floating timer. Try Chrome/Edge on desktop, or keep this tab visible.');
      setPipActive(false);
      if (pipAnimRef.current) {
        cancelAnimationFrame(pipAnimRef.current);
        pipAnimRef.current = null;
      }
    }
  }, [totalSeconds]);

  useEffect(() => {
    return () => {
      if (pipAnimRef.current) cancelAnimationFrame(pipAnimRef.current);
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
    };
  }, []);

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
  const pipSupported =
    typeof document !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof HTMLCanvasElement.prototype.captureStream === 'function' &&
    typeof HTMLVideoElement !== 'undefined' &&
    typeof HTMLVideoElement.prototype.requestPictureInPicture === 'function';

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
      <canvas ref={canvasRef} width={300} height={180} style={{ display: 'none' }} aria-hidden />
      <video
        ref={videoRef}
        playsInline
        muted
        width={300}
        height={180}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: 0, top: 0 }}
      />

      <div style={styles.content}>
        <div style={styles.label}>Scroll Time Left</div>
        <div style={styles.timer}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
        <div style={styles.sub}>
          Go use your phone! When the timer runs out, come back and earn more.
        </div>

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

        {pipSupported && !pipActive && (
          <div style={{ marginTop: 24 }}>
            <Button onClick={startPip}>
              {'🚀'} Go Scroll — Floating Timer
            </Button>
            <div style={styles.pipHint}>
              Works best in Chrome or Edge on desktop. Tap the button, then allow picture-in-picture if asked.
            </div>
            {pipError && (
              <div style={styles.pipError} role="alert">
                {pipError}
              </div>
            )}
          </div>
        )}

        {!pipSupported && (
          <div style={{ ...styles.pipHint, marginTop: 24, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
            Floating timer (picture-in-picture) is not available in this browser — especially on many phones. Keep this tab open; you&apos;ll still get a notification and alert when time is up.
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

        <div style={{ marginTop: pipActive || !pipSupported || pipError ? 24 : 12 }}>
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
  pipError: {
    marginTop: 12,
    padding: '10px 12px',
    fontSize: 12,
    color: '#F4F1EB',
    background: 'rgba(232,83,58,0.2)',
    border: '1px solid rgba(232,83,58,0.4)',
    borderRadius: 12,
    lineHeight: 1.45,
    textAlign: 'left',
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
  timeUpEmoji: { fontSize: 72, marginBottom: 12 },
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

