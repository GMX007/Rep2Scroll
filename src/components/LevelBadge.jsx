import React from 'react';

/**
 * Small gold pill showing current level name.
 */
export default function LevelBadge({ level }) {
  return (
    <div style={styles.badge}>
      <span>{level?.emoji || '⚡'}</span>
      <span>{level?.name || 'ROOKIE'}</span>
    </div>
  );
}

const styles = {
  badge: {
    background: 'rgba(240,165,0,0.15)',
    border: '1px solid rgba(240,165,0,0.3)',
    borderRadius: 20,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: '#F0A500',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
};
