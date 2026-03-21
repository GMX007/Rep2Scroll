import React, { useContext } from 'react';
import EffortBar from '../components/EffortBar';
import ExerciseCard from '../components/ExerciseCard';
import FormIndicator from '../components/FormIndicator';
import LevelBadge from '../components/LevelBadge';
import Button from '../components/Button';
import { AppContext } from '../AppContext';
import { getLevelForXP } from '../data/levels';

export default function EarnScreen() {
  const { state, dispatch } = useContext(AppContext);
  const { earnedMinutes, currentExercise, repsCompleted, formStatus, streak, totalReps, leaderboardRank, xp } = state;
  const level = getLevelForXP(xp);
  const progress = earnedMinutes / 60; // 60 min daily cap

  const handleStartExercise = () => {
    dispatch({ type: 'START_EXERCISE' });
  };

  const handleStartScrolling = () => {
    dispatch({ type: 'START_SCROLLING' });
  };

  return (
    <div style={styles.screen}>
      {/* Background glow */}
      <div style={styles.bgGlow} />

      {/* Header */}
      <div style={styles.header}>
        <span style={styles.logo}>SWEATNSCROLL</span>
        <LevelBadge level={level} />
      </div>

      {/* Effort Bar */}
      <div style={styles.barContainer}>
        <div style={styles.barLabel}>Scroll Time Earned {'🎉'}</div>
        <EffortBar progress={progress} minutes={Math.floor(earnedMinutes)} />
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <ExerciseCard
          exercise={currentExercise}
          reps={repsCompleted}
          onStart={handleStartExercise}
        />
      )}

      {/* Form Indicator */}
      <FormIndicator status={formStatus?.level || 'green'} message={formStatus?.message || 'Ready to go'} />

      {/* CTA Buttons */}
      {earnedMinutes > 0 ? (
        <div style={{ marginTop: 18 }}>
          <Button onClick={handleStartScrolling}>
            Time to Scroll! {'✨'}
          </Button>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <Button onClick={handleStartExercise}>
            Let's Sweat! {'💪'}
          </Button>
        </div>
      )}

      {/* Choose Exercise button for standard tier */}
      {state.tier === 'standard' && (
        <div style={{ marginTop: 10 }}>
          <Button variant="secondary" onClick={() => dispatch({ type: 'SHOW_BODY_PART_PICKER' })}>
            {'🎯'} Choose Exercise
          </Button>
        </div>
      )}

      {/* Mini Stats */}
      <div style={styles.miniStats}>
        <div style={styles.miniStat}>
          <div style={styles.miniStatVal}>{'🔥'} {streak}</div>
          <div style={styles.miniStatKey}>Day Streak</div>
        </div>
        <div style={styles.miniStat}>
          <div style={styles.miniStatVal}>{totalReps}</div>
          <div style={styles.miniStatKey}>Total Reps</div>
        </div>
        <div style={styles.miniStat}>
          <div style={styles.miniStatVal}>#{leaderboardRank}</div>
          <div style={styles.miniStatKey}>Leaderboard</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    background: 'linear-gradient(165deg, #0F1647 0%, #152058 50%, #0F1647 100%)',
    minHeight: '100%',
    padding: '16px 0 100px',
    position: 'relative',
  },
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(232,83,58,0.35) 0%, transparent 70%)',
    top: '35%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  header: {
    padding: '8px 24px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 2,
    color: '#E8533A',
  },
  barContainer: {
    padding: '28px 24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    zIndex: 1,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#9AA0B8',
  },
  miniStats: {
    margin: '14px 20px 0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10,
    position: 'relative',
    zIndex: 1,
  },
  miniStat: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '12px 8px',
    textAlign: 'center',
  },
  miniStatVal: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    color: '#F4F1EB',
    lineHeight: 1,
  },
  miniStatKey: {
    fontSize: 9,
    color: '#9AA0B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 3,
  },
};
