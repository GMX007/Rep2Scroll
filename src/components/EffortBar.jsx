import React from 'react';

/**
 * Circular SVG progress ring — the central UI element of Rep2Scroll.
 * @param {number} progress - 0 to 1
 * @param {number} minutes - earned minutes to display
 * @param {string} label - text below the number
 * @param {number} size - diameter in px (default 160)
 */
export default function EffortBar({ progress = 0, minutes = 0, label = 'min earned', size = 160 }) {
  const strokeWidth = 10;
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(progress, 1));

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="effortGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8533A" />
            <stop offset="100%" stopColor="#F0A500" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#effortGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
            filter: 'drop-shadow(0 0 8px #E8533A)',
          }}
        />
      </svg>
      {/* Center text */}
      <div style={styles.center}>
        <div style={styles.time}>{minutes}</div>
        <div style={styles.unit}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  center: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  time: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 44,
    lineHeight: 1,
    color: '#F4F1EB',
    letterSpacing: 1,
  },
  unit: {
    fontSize: 11,
    fontWeight: 500,
    color: '#9AA0B8',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};
