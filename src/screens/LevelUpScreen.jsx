import React, { useContext } from 'react';
import Button from '../components/Button';
import { AppContext } from '../AppContext';
import { getLevelForXP } from '../data/levels';

export default function LevelUpScreen() {
  const { state, dispatch } = useContext(AppContext);
  const level = getLevelForXP(state.xp);

  return (
    <div style={styles.screen}>
      {/* Stars */}
      <div style={styles.starsRow}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{ ...styles.star, animationDelay: `${(i + 1) * 0.1}s` }}>{'⭐'}</span>
        ))}
      </div>

      {/* Avatar */}
      <div style={styles.avatar}>
        {level.emoji}
        <div style={styles.avatarRing} />
      </div>

      {/* Level info */}
      <div style={styles.levelNumber}>Level {level.level} Unlocked</div>
      <div style={styles.levelName}>{level.name}</div>

      {/* Lore card */}
      <div style={styles.loreCard}>
        "{level.lore}"
      </div>

      {/* Unlocks */}
      <div style={{ marginBottom: 16 }}>
        <div style={styles.unlocksLabel}>Unlocked this level</div>
        <div style={styles.unlocksRow}>
          {level.unlocks?.map((unlock, i) => {
            const colors = ['#2ECC71', '#3498DB', '#E8533A', '#F0A500'];
            return (
              <div key={i} style={styles.unlockPill}>
                <span style={{ color: colors[i % colors.length], fontSize: 10 }}>{'●'}</span>
                {unlock}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <Button onClick={() => dispatch({ type: 'DISMISS_LEVEL_UP' })}>
        Let's Go →
      </Button>
    </div>
  );
}

const styles = {
  screen: {
    background: 'radial-gradient(ellipse at 50% 30%, rgba(240,165,0,0.2) 0%, #0D0D14 60%)',
    minHeight: '100%',
    padding: '40px 24px 100px',
    textAlign: 'center',
  },
  starsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  star: {
    fontSize: 18,
    animation: 'star-pop 0.5s ease both',
  },
  avatar: {
    margin: '10px auto 16px',
    width: 120,
    height: 120,
    background: 'linear-gradient(135deg, rgba(240,165,0,0.15), rgba(240,165,0,0.05))',
    border: '2px solid rgba(240,165,0,0.4)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 64,
    boxShadow: '0 0 40px rgba(240,165,0,0.25), 0 0 80px rgba(240,165,0,0.1)',
    position: 'relative',
  },
  avatarRing: {
    position: 'absolute',
    inset: -8,
    borderRadius: '50%',
    border: '1px solid rgba(240,165,0,0.15)',
    animation: 'spin-slow 8s linear infinite',
  },
  levelNumber: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#F0A500',
    marginBottom: 6,
  },
  levelName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 42,
    letterSpacing: 2,
    color: '#F4F1EB',
    lineHeight: 1,
    marginBottom: 16,
  },
  loreCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderLeft: '3px solid #F0A500',
    borderRadius: '0 12px 12px 0',
    padding: '14px 16px',
    textAlign: 'left',
    marginBottom: 20,
    fontSize: 13,
    lineHeight: 1.7,
    color: 'rgba(244,241,235,0.8)',
    fontStyle: 'italic',
  },
  unlocksLabel: {
    fontSize: 11,
    color: '#9AA0B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  unlocksRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  unlockPill: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: '6px 14px',
    fontSize: 12,
    color: '#F4F1EB',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
};
