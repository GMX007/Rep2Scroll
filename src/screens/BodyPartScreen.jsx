import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { bodyPartCategories, getExercisesByCategory } from '../data/exercises';

export default function BodyPartScreen() {
  const { state, dispatch } = useContext(AppContext);

  const handleSelect = (categoryId) => {
    dispatch({ type: 'SELECT_BODY_PART', payload: categoryId });
  };

  const handleBack = () => {
    dispatch({ type: 'DISMISS_BODY_PART_PICKER' });
  };

  return (
    <div style={styles.screen}>
      <div style={styles.bgGlow} />

      {/* Header */}
      <div style={styles.header}>
        <button onClick={handleBack} style={styles.backBtn}>{'←'}</button>
        <span style={styles.logo}>SWEATNSCROLL</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={styles.content}>
        <div style={styles.title}>CHOOSE YOUR FOCUS</div>
        <div style={styles.subtitle}>What do you want to work on?</div>

        <div style={styles.grid}>
          {bodyPartCategories.map((cat) => {
            const exerciseCount = getExercisesByCategory(cat.id, state.tier, state.userEquipment).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                style={{
                  ...styles.card,
                  borderColor: `${cat.color}33`,
                  background: `linear-gradient(135deg, ${cat.color}12 0%, ${cat.color}06 100%)`,
                }}
              >
                <div style={styles.cardEmoji}>{cat.emoji}</div>
                <div style={{ ...styles.cardName, color: cat.color }}>{cat.name}</div>
                <div style={styles.cardCount}>{exerciseCount} exercises</div>
                <div style={{ ...styles.cardArrow, color: cat.color }}>{'→'}</div>
              </button>
            );
          })}
        </div>

        <button onClick={handleBack} style={styles.randomBtn}>
          {'🎲'} Pick a random exercise instead
        </button>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    background: 'linear-gradient(165deg, #080D2E 0%, #0D1545 50%, #080D2E 100%)',
    minHeight: '100%',
    padding: '16px 0 100px',
    position: 'relative',
  },
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    background: 'radial-gradient(circle, rgba(232,83,58,0.2) 0%, transparent 70%)',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  header: {
    padding: '8px 20px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    color: '#F4F1EB',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 22,
    letterSpacing: 2,
    color: '#E8533A',
  },
  content: {
    padding: '32px 20px 0',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 2,
    color: '#F4F1EB',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9AA0B8',
    textAlign: 'center',
    marginBottom: 28,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  card: {
    border: '1px solid',
    borderRadius: 20,
    padding: '24px 16px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
    position: 'relative',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardName: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 20,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 11,
    color: '#9AA0B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardArrow: {
    position: 'absolute',
    top: 12,
    right: 14,
    fontSize: 16,
    opacity: 0.6,
  },
  randomBtn: {
    display: 'block',
    margin: '24px auto 0',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 20px',
    color: '#9AA0B8',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
};
