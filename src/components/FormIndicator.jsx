import React from 'react';

/**
 * Form quality indicator pill — green/amber/red with text cue.
 * @param {'green'|'amber'|'red'} status
 * @param {string} message
 */
export default function FormIndicator({ status = 'green', message = 'Good form — keep it up' }) {
  const colorMap = {
    green: { dot: '#2ECC71', text: 'rgba(46,204,113,0.9)', bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.2)' },
    amber: { dot: '#F39C12', text: 'rgba(243,156,18,0.9)', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.2)' },
    red:   { dot: '#E74C3C', text: 'rgba(231,76,60,0.9)', bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.2)' },
  };

  const c = colorMap[status] || colorMap.green;

  return (
    <div style={{
      margin: '14px 20px 0',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '10px 16px',
    }}>
      <div style={{
        width: 10,
        height: 10,
        background: c.dot,
        borderRadius: '50%',
        boxShadow: `0 0 8px ${c.dot}`,
        animation: 'pulse-green 2s ease infinite',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 12,
        fontWeight: 500,
        color: c.text,
      }}>
        {message}
      </span>
    </div>
  );
}
