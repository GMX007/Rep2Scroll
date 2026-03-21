import React from 'react';
import Button from './Button';

/**
 * Bottom-sheet style instruction popup for each exercise.
 * Auto-opens on first encounter, always available via info button.
 */
export default function InstructionPopup({ exercise, onClose, onStart }) {
  if (!exercise) return null;

  const Section = ({ title, color, items }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color, marginBottom: 8 }}>
        {title}
      </div>
      {items?.map((item, i) => (
        <div key={i} style={{ fontSize: 12, color: 'rgba(244,241,235,0.8)', lineHeight: 1.6, paddingLeft: 16, position: 'relative', marginBottom: 4 }}>
          <span style={{ position: 'absolute', left: 0, color }}>{'>'}</span>
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.handle} />
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 1, color: '#F4F1EB', marginBottom: 4 }}>
          {exercise.name}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span style={styles.tag}>{exercise.difficulty}</span>
          {exercise.bodyArea?.map(area => (
            <span key={area} style={{ ...styles.tag, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9AA0B8' }}>
              {area}
            </span>
          ))}
        </div>

        {/* Content sections */}
        <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4 }}>
          {exercise.formPoints && <Section title="Key Form Points" color="#2ECC71" items={exercise.formPoints} />}
          {exercise.aiChecks && <Section title="What the AI Checks" color="#3498DB" items={exercise.aiChecks} />}
          {exercise.commonMistakes && <Section title="Common Mistakes" color="#E74C3C" items={exercise.commonMistakes} />}
          {exercise.cameraPlacement && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#F0A500', marginBottom: 8 }}>
                Camera Placement
              </div>
              <div style={{ fontSize: 12, color: 'rgba(244,241,235,0.8)', lineHeight: 1.6 }}>
                {exercise.cameraPlacement}
              </div>
            </div>
          )}
          {exercise.easierVariation && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#9AA0B8' }}>
              Easier variation: <span style={{ color: '#F4F1EB', fontWeight: 600 }}>{exercise.easierVariation}</span>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          <Button onClick={() => { onClose(); onStart?.(); }} style={{ margin: 0, width: '100%' }}>
            Start {exercise.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    animation: 'fade-in 0.2s ease',
  },
  sheet: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '85vh',
    background: '#111118',
    borderRadius: '24px 24px 0 0',
    padding: '12px 24px 32px',
    animation: 'slide-up 0.3s ease',
  },
  handle: {
    width: 40,
    height: 4,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    margin: '0 auto 16px',
  },
  tag: {
    background: 'rgba(232,83,58,0.12)',
    border: '1px solid rgba(232,83,58,0.25)',
    color: '#E8533A',
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    padding: '3px 10px',
    borderRadius: 20,
  },
};
