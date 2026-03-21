import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { getExercisesByCategory, bodyPartCategories } from '../data/exercises';

export default function ExercisePickerScreen() {
  const { state, dispatch } = useContext(AppContext);
  const categoryId = state.selectedBodyPart;
  const category = bodyPartCategories.find(c => c.id === categoryId);
  const exerciseList = getExercisesByCategory(categoryId, state.tier, state.userEquipment);

  const handleSelect = (exercise) => {
    dispatch({ type: 'PICK_EXERCISE', payload: exercise });
  };

  const handleBack = () => {
    dispatch({ type: 'SHOW_BODY_PART_PICKER' });
  };

  const difficultyColor = {
    Beginner: '#2ECC71',
    Intermediate: '#F0A500',
    Advanced: '#E8533A',
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
        <div style={{ ...styles.categoryBadge, background: `${category?.color}22`, color: category?.color }}>
          {category?.emoji} {category?.name}
        </div>
        <div style={styles.title}>PICK YOUR EXERCISE</div>
        <div style={styles.subtitle}>{exerciseList.length} exercises available</div>

        <div style={styles.list}>
          {exerciseList.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleSelect(ex)}
              style={styles.exerciseCard}
            >
              <div style={styles.exerciseLeft}>
                <span style={styles.exerciseEmoji}>{ex.emoji}</span>
                <div>
                  <div style={styles.exerciseName}>{ex.name}</div>
                  <div style={styles.exerciseMeta}>
                    <span style={{ color: difficultyColor[ex.difficulty] || '#9AA0B8' }}>
                      {ex.difficulty}
                    </span>
                    {' · '}
                    {ex.type === 'hold' ? `${ex.defaultTarget}s hold` : `${ex.defaultTarget} reps`}
                  </div>
                </div>
              </div>
              <div style={styles.exerciseArrow}>{'→'}</div>
            </button>
          ))}
        </div>
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
    background: 'radial-gradient(circle, rgba(232,83,58,0.15) 0%, transparent 70%)',
    top: '25%',
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
    padding: '24px 20px 0',
    position: 'relative',
    zIndex: 1,
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    letterSpacing: 2,
    color: '#F4F1EB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9AA0B8',
    marginBottom: 20,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  exerciseCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '14px 16px',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
    width: '100%',
    textAlign: 'left',
  },
  exerciseLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  exerciseEmoji: {
    fontSize: 28,
    width: 40,
    textAlign: 'center',
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: 600,
    color: '#F4F1EB',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 11,
    color: '#9AA0B8',
    letterSpacing: 0.5,
  },
  exerciseArrow: {
    color: '#E8533A',
    fontSize: 18,
    opacity: 0.7,
  },
};
