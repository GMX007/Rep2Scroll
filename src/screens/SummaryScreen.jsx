import React, { useContext } from 'react';
import Button from '../components/Button';
import { AppContext } from '../AppContext';

export default function SummaryScreen() {
  const { state, dispatch } = useContext(AppContext);
  const { lastSession } = state;

  const session = lastSession || {
    exercise: 'Push-up',
    cleanReps: 12,
    flaggedReps: 2,
    formScore: 86,
    personalBest: true,
    topNote: 'Hips dropping',
    minutesEarned: 4,
    totalPossible: 20,
  };

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.checkCircle}>{'✓'}</div>
        <div style={styles.title}>Session Done</div>
        <div style={styles.sub}>{session.exercise} {'·'} Standard form {'·'} Chest workout</div>
      </div>

      {/* Stat Grid */}
      <div style={styles.statGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statVal, color: '#2ECC71' }}>{session.cleanReps}</div>
          <div style={styles.statKey}>Clean Reps</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statVal, color: '#E8533A' }}>{session.flaggedReps}</div>
          <div style={styles.statKey}>Flagged Reps</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statVal}>{session.formScore}%</div>
          <div style={styles.statKey}>Form Score</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statVal}>{session.personalBest ? '\uD83C\uDFC6' : '\u2014'}</div>
          <div style={styles.statKey}>{session.personalBest ? 'Personal Best!' : 'Keep Going'}</div>
        </div>
        {session.topNote && (
          <div style={styles.highlightCard}>
            <div style={{ flex: 1 }}>
              <div style={{ ...styles.statVal, fontSize: 20, color: '#F39C12' }}>{session.topNote}</div>
              <div style={{ ...styles.statKey, marginTop: 6 }}>Most common form note</div>
            </div>
            <span style={{ fontSize: 28 }}>{'⚠️'}</span>
          </div>
        )}
      </div>

      {/* Scroll time bar */}
      <div style={{ margin: '16px 20px 0' }}>
        <div style={{ fontSize: 11, color: '#9AA0B8', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
          Scroll time earned
        </div>
      </div>
      <div style={styles.barEarned}>
        <div style={{ ...styles.barFill, width: `${(session.minutesEarned / session.totalPossible) * 100}%` }} />
      </div>
      <div style={styles.barLabel}>
        <span>0 min</span>
        <span style={{ color: '#E8533A', fontWeight: 600 }}>+{session.minutesEarned} min earned</span>
        <span>{session.totalPossible} min</span>
      </div>

      {/* Form tip */}
      <div style={styles.formTip}>
        {'💡'} Form tip: Engage your core to keep hips level at the bottom
      </div>

      {/* CTAs */}
      <div style={{ marginTop: 4 }}>
        <Button onClick={() => dispatch({ type: 'START_SCROLLING' })}>
          Start Scrolling {'→'}
        </Button>
      </div>
      <div style={{ marginTop: 8 }}>
        <Button variant="secondary" onClick={() => dispatch({ type: 'NEW_SET' })}>
          Do Another Set
        </Button>
      </div>
      {state.tier === 'standard' && (
        <div style={{ marginTop: 8 }}>
          <Button variant="secondary" onClick={() => dispatch({ type: 'SHOW_BODY_PART_PICKER' })}>
            {'🎯'} Choose Exercise
          </Button>
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: {
    background: 'linear-gradient(170deg, #152058 0%, #0F1647 100%)',
    minHeight: '100%',
    padding: '16px 0 100px',
  },
  header: {
    padding: '12px 24px 0',
    textAlign: 'center',
  },
  checkCircle: {
    width: 56,
    height: 56,
    background: 'rgba(46,204,113,0.15)',
    border: '2px solid rgba(46,204,113,0.4)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    margin: '0 auto 12px',
    boxShadow: '0 0 24px rgba(46,204,113,0.2)',
    color: '#2ECC71',
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 1,
    color: '#F4F1EB',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: '#9AA0B8',
    marginBottom: 20,
  },
  statGrid: {
    margin: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  statVal: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    lineHeight: 1,
    color: '#F4F1EB',
  },
  statKey: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#9AA0B8',
    marginTop: 4,
  },
  highlightCard: {
    background: 'rgba(232,83,58,0.08)',
    border: '1px solid rgba(232,83,58,0.2)',
    borderRadius: 16,
    padding: 16,
    gridColumn: 'span 2',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  barEarned: {
    height: 8,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    margin: '0 20px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #E8533A, #F0A500)',
    borderRadius: 4,
    boxShadow: '0 0 12px rgba(232,83,58,0.5)',
    transition: 'width 0.5s ease',
  },
  barLabel: {
    margin: '8px 20px 0',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#9AA0B8',
  },
  formTip: {
    margin: '12px 20px',
    background: 'rgba(46,204,113,0.07)',
    border: '1px solid rgba(46,204,113,0.2)',
    borderRadius: 12,
    padding: '10px 14px',
    fontSize: 12,
    color: 'rgba(46,204,113,0.9)',
  },
};
