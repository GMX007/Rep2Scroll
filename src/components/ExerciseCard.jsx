import React, { useState, useContext } from 'react';
import InstructionPopup from './InstructionPopup';
import { AppContext } from '../AppContext';
import { getScaledTarget } from '../data/exercises';

/**
 * Exercise card showing current exercise, progress, and info button.
 */
export default function ExerciseCard({ exercise, reps = 0, onStart }) {
  const [showInfo, setShowInfo] = useState(false);
  const { state } = useContext(AppContext);
  const target = exercise ? getScaledTarget(exercise, state.gender, state.activityLevel) : 14;
  const isHold = exercise?.type === 'hold';

  return (
    <>
      <div style={styles.card}>
        <div style={styles.icon}>{exercise?.emoji || '💪'}</div>
        <div style={styles.info}>
          <div style={styles.name}>
            {exercise?.name || 'Exercise'}
            <button onClick={() => setShowInfo(true)} style={styles.infoBtn}>i</button>
          </div>
          <div style={styles.target}>
            Target: {target} {isHold ? 'sec' : 'reps'} · {exercise?.difficulty || 'Standard'}
          </div>
        </div>
        <div style={styles.progress}>
          <div style={styles.repsDone}>{reps}</div>
          <div style={styles.repsLabel}>/ {target} {isHold ? 'sec' : 'reps'}</div>
        </div>
      </div>
      {showInfo && (
        <InstructionPopup exercise={exercise} onClose={() => setShowInfo(false)} onStart={onStart} />
      )}
    </>
  );
}

const styles = {
  card: {
    margin: '0 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '18px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 48,
    height: 48,
    background: 'linear-gradient(135deg, #E8533A, #C0392B)',
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    flexShrink: 0,
  },
  info: { flex: 1 },
  name: {
    fontWeight: 700,
    fontSize: 16,
    color: '#F4F1EB',
    marginBottom: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  infoBtn: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#9AA0B8',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontStyle: 'italic',
    fontFamily: "'DM Sans', sans-serif",
  },
  target: {
    fontSize: 12,
    color: '#9AA0B8',
  },
  progress: {
    textAlign: 'right',
  },
  repsDone: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    lineHeight: 1,
    color: '#E8533A',
  },
  repsLabel: {
    fontSize: 10,
    color: '#9AA0B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};
