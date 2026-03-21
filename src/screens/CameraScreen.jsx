import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { AppContext } from '../AppContext';
import { initPoseDetector, estimatePose } from '../services/poseDetection';
import { verifyExercise, resetRepState } from '../services/exerciseVerifier';
import FormIndicator from '../components/FormIndicator';
import Button from '../components/Button';

/**
 * Live camera exercise screen with real-time pose detection.
 * Camera feed as background, overlay with rep counter & form indicator.
 */
export default function CameraScreen({ exercise, onComplete, onSwitchExercise }) {
  const { state, dispatch } = useContext(AppContext);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const frameCount = useRef(0);

  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [reps, setReps] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [formStatus, setFormStatus] = useState({ level: 'green', message: 'Get ready...' });
  const [paused, setPaused] = useState(false);

  const isHold = exercise?.type === 'hold';
  const target = exercise?.defaultTarget || 14;

  // Start camera
  useEffect(() => {
    let stream;
    async function startCamera() {
      try {
        const facingMode = state.settings?.camera === 'Rear' ? 'environment' : 'user';
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error('[SweatNScroll] Camera access denied:', err);
        setFormStatus({ level: 'red', message: 'Camera access denied — check browser settings' });
      }
    }
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Init pose detector
  useEffect(() => {
    initPoseDetector()
      .then(() => setModelReady(true))
      .catch(() => setFormStatus({ level: 'amber', message: 'AI model loading failed — try refreshing' }));
    resetRepState();
  }, []);

  // Detection loop — process every 3rd frame for battery life
  const detectLoop = useCallback(async () => {
    if (!videoRef.current || !cameraReady || !modelReady || paused) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    frameCount.current++;
    if (frameCount.current % 3 !== 0) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    try {
      const poses = await estimatePose(videoRef.current);
      if (poses.length > 0) {
        const result = verifyExercise(exercise.id, poses[0]);
        setFormStatus({ level: result.level, message: result.message });

        if (result.level === 'pause') {
          setPaused(true);
        }

        if (isHold && result.holdValid) {
          setHoldTime(prev => {
            const newTime = prev + (1 / 10); // ~10 fps effective rate
            if (newTime >= target) {
              onComplete?.({ holdTime: target, formScore: 100 });
            }
            return newTime;
          });
        }

        if (!isHold && result.repCompleted) {
          setReps(prev => {
            const newReps = prev + 1;
            if (newReps >= target) {
              onComplete?.({ reps: target, formScore: result.effortScore * 100 });
            }
            return newReps;
          });

          // Haptic feedback on rep completion
          if (state.settings?.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(50);
          }

          // Red form = vibrate warning
          if (result.level === 'red' && navigator.vibrate) {
            navigator.vibrate([200]);
          }
        }
      }
    } catch (err) {
      console.error('[SweatNScroll] Pose detection error:', err);
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, [cameraReady, modelReady, paused, exercise, isHold, target, onComplete, state.settings]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(detectLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [detectLoop]);

  return (
    <div style={styles.screen}>
      {/* Camera feed */}
      <video
        ref={videoRef}
        style={styles.video}
        playsInline
        muted
      />

      {/* Overlay */}
      <div style={styles.overlay}>
        {/* Exercise info */}
        <div style={styles.topBar}>
          <div style={styles.exerciseName}>{exercise?.name}</div>
          <div style={styles.exerciseTarget}>
            Target: {target} {isHold ? 'sec' : 'reps'}
          </div>
        </div>

        {/* Rep / Hold counter */}
        <div style={styles.counter}>
          <div style={styles.counterVal}>
            {isHold ? Math.floor(holdTime) : reps}
          </div>
          <div style={styles.counterLabel}>
            {isHold ? `/ ${target} sec` : `/ ${target} reps`}
          </div>
        </div>

        {/* Mini effort bar */}
        <div style={styles.miniBar}>
          <div style={{
            ...styles.miniBarFill,
            width: `${((isHold ? holdTime : reps) / target) * 100}%`,
          }} />
        </div>

        {/* Form indicator */}
        <div style={styles.bottom}>
          <FormIndicator status={formStatus.level === 'pause' ? 'red' : formStatus.level} message={formStatus.message} />

          {/* Loading indicator */}
          {!modelReady && (
            <div style={styles.loading}>Loading AI model...</div>
          )}
        </div>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div style={styles.pauseOverlay}>
          <div style={styles.pauseContent}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#E8533A', letterSpacing: 2 }}>SWEATNSCROLL</div>
              <div style={{ background: 'rgba(240,165,0,0.15)', border: '1px solid rgba(240,165,0,0.3)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#F0A500', display: 'flex', alignItems: 'center', gap: 4 }}>
                {'⚡'} GRINDER
              </div>
            </div>

            {/* Form Alert label */}
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#9AA0B8', marginBottom: 8 }}>Form Alert</div>
            <div style={styles.pauseTitle}>Form Breaking Down</div>

            {/* Alert card */}
            <div style={styles.alertCard}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#F4F1EB', marginBottom: 6 }}>
                Your form is breaking down — that means you're working hard.
              </div>
              <div style={{ fontSize: 12, color: '#9AA0B8' }}>
                Hips detected dropping below safe range on last 3 reps
              </div>
            </div>

            {/* Easier variation */}
            {exercise?.easierVariation && (
              <>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#9AA0B8', marginBottom: 12, marginTop: 20 }}>
                  Want to switch to an easier variation?
                </div>
                <div style={styles.variationCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#F4F1EB' }}>{exercise.easierVariation}</div>
                    <div style={{ fontSize: 11, color: '#9AA0B8', marginTop: 2 }}>Same chest activation, reduced load</div>
                  </div>
                  <div style={{ background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 12, padding: '4px 10px', fontSize: 10, fontWeight: 700, color: '#2ECC71', letterSpacing: 1 }}>
                    EASIER
                  </div>
                </div>
                <Button onClick={() => {
                  setPaused(false);
                  resetRepState();
                  onSwitchExercise?.(exercise.easierVariation);
                }}>
                  Switch to {exercise.easierVariation}
                </Button>
              </>
            )}

            <div style={{ marginTop: 8 }}>
              <Button variant="secondary" onClick={() => { setPaused(false); resetRepState(); }}>
                Try Again
              </Button>
            </div>
            <button onClick={() => onComplete?.({ reps, holdTime, formScore: 0 })} style={styles.endSetBtn}>
              End Set
            </button>
          </div>
        </div>
      )}

      {/* End session button */}
      <button onClick={() => onComplete?.({ reps, holdTime, formScore: 80 })} style={styles.endBtn}>
        End Session
      </button>
    </div>
  );
}

const styles = {
  screen: {
    position: 'fixed',
    inset: 0,
    background: '#000',
    zIndex: 150,
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)', // mirror
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '60px 0 100px',
  },
  topBar: {
    textAlign: 'center',
    padding: '0 24px',
  },
  exerciseName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 24,
    letterSpacing: 1,
    color: '#F4F1EB',
  },
  exerciseTarget: {
    fontSize: 12,
    color: '#9AA0B8',
  },
  counter: {
    textAlign: 'center',
  },
  counterVal: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 80,
    lineHeight: 1,
    color: '#F4F1EB',
    textShadow: '0 0 40px rgba(232,83,58,0.5)',
  },
  counterLabel: {
    fontSize: 14,
    color: '#9AA0B8',
    marginTop: 4,
  },
  miniBar: {
    margin: '0 40px',
    height: 6,
    background: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #E8533A, #F0A500)',
    borderRadius: 3,
    transition: 'width 0.3s ease',
  },
  bottom: {
    padding: '0 0 20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: 12,
    color: '#F0A500',
    marginTop: 8,
  },
  endBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: '8px 16px',
    color: '#F4F1EB',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    zIndex: 10,
  },
  pauseOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(13,13,20,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  pauseContent: {
    padding: '40px 24px 0',
    textAlign: 'left',
    width: '100%',
    maxWidth: 400,
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  pauseTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    color: '#E8533A',
    marginBottom: 12,
  },
  alertCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  variationCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  endSetBtn: {
    marginTop: 12,
    background: 'transparent',
    border: 'none',
    color: '#9AA0B8',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textDecoration: 'underline',
  },
};
