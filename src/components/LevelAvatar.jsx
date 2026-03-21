import React from 'react';

/**
 * LevelAvatar — SVG avatar that gets progressively fitter across 10 levels.
 * Props:
 *   level: 1-10
 *   gender: 'male' | 'female'
 *   size: pixel width/height (default 120)
 */

// Body proportions per level — shoulders, waist, arms, legs get fitter
const bodyData = [
  // Level 1 — Couch Potato: round, soft
  { shoulderW: 22, waistW: 26, armW: 7, legW: 9, chestH: 28, armCurve: 0, headR: 16 },
  // Level 2 — Slow Starter: slightly less round
  { shoulderW: 23, waistW: 24, armW: 7, legW: 9, chestH: 27, armCurve: 0, headR: 15 },
  // Level 3 — Mover: starting to shape up
  { shoulderW: 24, waistW: 22, armW: 6, legW: 8, chestH: 26, armCurve: 1, headR: 15 },
  // Level 4 — Sweaty Mess: noticeable change
  { shoulderW: 26, waistW: 20, armW: 6, legW: 8, chestH: 26, armCurve: 2, headR: 14 },
  // Level 5 — Getting Spicy: toned
  { shoulderW: 27, waistW: 19, armW: 7, legW: 8, chestH: 25, armCurve: 3, headR: 14 },
  // Level 6 — Warrior: athletic
  { shoulderW: 29, waistW: 18, armW: 7, legW: 8, chestH: 25, armCurve: 4, headR: 14 },
  // Level 7 — Titan: strong
  { shoulderW: 30, waistW: 17, armW: 8, legW: 8, chestH: 24, armCurve: 5, headR: 13 },
  // Level 8 — Legend: very fit
  { shoulderW: 32, waistW: 16, armW: 8, legW: 7, chestH: 24, armCurve: 6, headR: 13 },
  // Level 9 — Immortal: shredded
  { shoulderW: 33, waistW: 15, armW: 9, legW: 7, chestH: 23, armCurve: 7, headR: 13 },
  // Level 10 — Machine: peak
  { shoulderW: 35, waistW: 15, armW: 10, legW: 7, chestH: 22, armCurve: 8, headR: 12 },
];

// Color gradient: starts gray/pale, ends vibrant orange/bronze
const skinTones = [
  '#C4B8A8', '#C8BBA9', '#CCBFAB', '#D4C3A0',
  '#DABB8A', '#E0B67A', '#E5A86A', '#E89B5A',
  '#EB8E4A', '#F0823A',
];

export default function LevelAvatar({ level = 1, gender = 'male', size = 120 }) {
  const idx = Math.max(0, Math.min(9, level - 1));
  const d = bodyData[idx];
  const skin = skinTones[idx];
  const isFemale = gender === 'female';

  const cx = 50; // center x
  const headY = 18;
  const neckY = headY + d.headR + 2;
  const shoulderY = neckY + 4;
  const waistY = shoulderY + d.chestH;
  const hipY = waistY + 4;
  const legEndY = 92;

  // Female adjustments: narrower shoulders, wider hips, ponytail
  const sW = isFemale ? d.shoulderW - 3 : d.shoulderW;
  const wW = isFemale ? d.waistW + 1 : d.waistW;
  const hipW = isFemale ? d.waistW + 4 : d.waistW;

  // Arm endpoints (slight flex based on armCurve)
  const armOutX = d.armCurve > 3 ? sW + 5 : sW + 2;
  const armEndY = waistY + 6;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      {/* Glow behind at higher levels */}
      {level >= 6 && (
        <circle cx={cx} cy={50} r={42} fill="none" stroke="rgba(232,83,58,0.15)" strokeWidth={level >= 8 ? 4 : 2} />
      )}
      {level >= 9 && (
        <circle cx={cx} cy={50} r={46} fill="none" stroke="rgba(232,83,58,0.08)" strokeWidth={2} />
      )}

      {/* Hair / ponytail for female */}
      {isFemale && (
        <>
          <ellipse cx={cx} cy={headY - 2} rx={d.headR + 2} ry={d.headR + 2} fill="#3D2B1F" />
          <path
            d={`M${cx + d.headR - 2},${headY - 4} Q${cx + d.headR + 8},${headY + 10} ${cx + d.headR + 3},${headY + 22}`}
            stroke="#3D2B1F" strokeWidth={3} fill="none" strokeLinecap="round"
          />
        </>
      )}
      {!isFemale && level >= 7 && (
        /* Short styled hair for high-level males */
        <ellipse cx={cx} cy={headY - 3} rx={d.headR + 1} ry={d.headR + 1} fill="#2A1F14" />
      )}

      {/* Head */}
      <circle cx={cx} cy={headY} r={d.headR} fill={skin} />

      {/* Smile — gets bigger/happier with level */}
      <path
        d={`M${cx - 4},${headY + 3} Q${cx},${headY + 4 + Math.min(idx, 5)} ${cx + 4},${headY + 3}`}
        stroke="#5A3A2A" strokeWidth={1.2} fill="none" strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx={cx - 4} cy={headY - 2} r={1.2} fill="#2A1A0A" />
      <circle cx={cx + 4} cy={headY - 2} r={1.2} fill="#2A1A0A" />

      {/* Neck */}
      <rect x={cx - 3} y={neckY} width={6} height={4} rx={2} fill={skin} />

      {/* Torso — trapezoid from shoulders to waist */}
      <path
        d={`M${cx - sW},${shoulderY} L${cx + sW},${shoulderY} L${cx + wW},${waistY} L${cx - wW},${waistY} Z`}
        fill={skin}
      />

      {/* Tank top / sports bra for female */}
      {isFemale ? (
        <path
          d={`M${cx - sW + 2},${shoulderY + 2} L${cx + sW - 2},${shoulderY + 2} L${cx + wW - 1},${shoulderY + 12} L${cx - wW + 1},${shoulderY + 12} Z`}
          fill="#E8533A" opacity={0.9}
        />
      ) : (
        /* Tank for male */
        <path
          d={`M${cx - sW + 4},${shoulderY} L${cx + sW - 4},${shoulderY} L${cx + wW - 2},${waistY} L${cx - wW + 2},${waistY} Z`}
          fill="#E8533A" opacity={0.8}
        />
      )}

      {/* Arms — left */}
      <line
        x1={cx - sW} y1={shoulderY + 2}
        x2={cx - armOutX - d.armCurve} y2={armEndY}
        stroke={skin} strokeWidth={d.armW} strokeLinecap="round"
      />
      {/* Bicep bump for higher levels */}
      {d.armCurve >= 3 && (
        <circle cx={cx - sW - (d.armCurve / 2)} cy={shoulderY + 10} r={d.armCurve * 0.6} fill={skin} />
      )}

      {/* Arms — right */}
      <line
        x1={cx + sW} y1={shoulderY + 2}
        x2={cx + armOutX + d.armCurve} y2={armEndY}
        stroke={skin} strokeWidth={d.armW} strokeLinecap="round"
      />
      {d.armCurve >= 3 && (
        <circle cx={cx + sW + (d.armCurve / 2)} cy={shoulderY + 10} r={d.armCurve * 0.6} fill={skin} />
      )}

      {/* Hips/shorts */}
      <path
        d={`M${cx - wW},${waistY} L${cx + wW},${waistY} L${cx + hipW},${hipY + 6} L${cx - hipW},${hipY + 6} Z`}
        fill="#1E2460"
      />

      {/* Legs — left */}
      <line
        x1={cx - hipW + 3} y1={hipY + 6}
        x2={cx - hipW + 5} y2={legEndY}
        stroke={skin} strokeWidth={d.legW} strokeLinecap="round"
      />

      {/* Legs — right */}
      <line
        x1={cx + hipW - 3} y1={hipY + 6}
        x2={cx + hipW - 5} y2={legEndY}
        stroke={skin} strokeWidth={d.legW} strokeLinecap="round"
      />

      {/* Shoes */}
      <ellipse cx={cx - hipW + 5} cy={legEndY + 2} rx={4} ry={2.5} fill="#E8533A" />
      <ellipse cx={cx + hipW - 5} cy={legEndY + 2} rx={4} ry={2.5} fill="#E8533A" />

      {/* Level 10 crown */}
      {level === 10 && (
        <text x={cx} y={headY - d.headR - 4} textAnchor="middle" fontSize="10">👑</text>
      )}
    </svg>
  );
}
