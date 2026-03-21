import React from 'react';

/**
 * LevelAvatar — Bright yellow cartoon character (matching app icon style).
 * Simple, bold, rounded. Gets fitter from chubby to muscular across 10 levels.
 * All levels lift a barbell overhead (reference style).
 */

const shapes = [
  // Lv1 Couch Potato — round, chubby, small barbell
  { belly: 26, shoulder: 16, armT: 6, bicep: 0, legT: 8, neckW: 9, headR: 15, plates: 1 },
  // Lv2 Slow Starter — slightly less round
  { belly: 24, shoulder: 17, armT: 6, bicep: 0, legT: 8, neckW: 8, headR: 14.5, plates: 1 },
  // Lv3 Mover — starting to shape up
  { belly: 21, shoulder: 19, armT: 6.5, bicep: 1, legT: 7.5, neckW: 7.5, headR: 14, plates: 1 },
  // Lv4 Sweaty Mess — noticeable change
  { belly: 19, shoulder: 21, armT: 7, bicep: 2, legT: 7, neckW: 7, headR: 13.5, plates: 1 },
  // Lv5 Getting Spicy — toned
  { belly: 17, shoulder: 23, armT: 7.5, bicep: 3, legT: 7, neckW: 7, headR: 13, plates: 2 },
  // Lv6 Warrior — athletic
  { belly: 15, shoulder: 25, armT: 8, bicep: 4, legT: 6.5, neckW: 7, headR: 13, plates: 2 },
  // Lv7 Titan — strong
  { belly: 14, shoulder: 27, armT: 8.5, bicep: 5, legT: 6.5, neckW: 7.5, headR: 12.5, plates: 2 },
  // Lv8 Legend — very fit
  { belly: 13, shoulder: 29, armT: 9, bicep: 6, legT: 6, neckW: 8, headR: 12, plates: 3 },
  // Lv9 Immortal — shredded
  { belly: 12, shoulder: 31, armT: 9.5, bicep: 7, legT: 6, neckW: 8.5, headR: 12, plates: 3 },
  // Lv10 Machine — peak
  { belly: 12, shoulder: 33, armT: 10, bicep: 8, legT: 6, neckW: 9, headR: 11.5, plates: 3 },
];

// Bright yellow body — matches the app icon character
const BODY_COLOR = '#F5C542';
const BODY_SHADOW = '#D4A52A';
const TANK_COLOR = '#E8533A';
const SHORTS_COLOR = '#1E3A6E';
const HAIR_MALE = '#3D2518';
const HAIR_FEMALE = '#5C2D0E';
const BAR_COLOR = '#B0B0B0';
const PLATE_COLOR = '#E8533A';

export default function LevelAvatar({ level = 1, gender = 'male', size = 120 }) {
  const idx = Math.max(0, Math.min(9, level - 1));
  const s = shapes[idx];
  const isFemale = gender === 'female';

  const cx = 50;
  const headY = 18;
  const neckY = headY + s.headR;
  const shoulderY = neckY + 3;
  const torsoH = 20;
  const waistY = shoulderY + torsoH;
  const hipY = waistY + 2;
  const legEndY = 90;

  // Female adjustments
  const shW = isFemale ? s.shoulder - 2 : s.shoulder;
  const bellyW = isFemale ? s.belly + 1 : s.belly;
  const hipW = isFemale ? bellyW + 3 : bellyW;

  // Arms go straight up overhead (like reference image)
  const handY = 4;
  const elbowY = shoulderY - 6;
  const handLX = cx - shW - 4;
  const handRX = cx + shW + 4;

  // Barbell across top
  const barY = handY;
  const barSpan = Math.max(handRX - handLX + 16, 50);
  const barLeft = cx - barSpan / 2;
  const barRight = cx + barSpan / 2;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      {/* Glow at high levels */}
      {level >= 7 && (
        <circle cx={cx} cy={52} r={44} fill="none" stroke="rgba(245,197,66,0.15)" strokeWidth={level >= 9 ? 3 : 2} />
      )}

      {/* === BARBELL (behind arms) === */}
      <line x1={barLeft} y1={barY} x2={barRight} y2={barY}
        stroke={BAR_COLOR} strokeWidth={2.5} strokeLinecap="round" />
      {/* Plates */}
      {Array.from({ length: s.plates }).map((_, i) => (
        <React.Fragment key={i}>
          <rect x={barLeft - 3 - i * 6} y={barY - 6 + i} width={5} height={12 - i * 2} rx={2} fill={PLATE_COLOR} opacity={1 - i * 0.2} />
          <rect x={barRight - 2 + i * 6} y={barY - 6 + i} width={5} height={12 - i * 2} rx={2} fill={PLATE_COLOR} opacity={1 - i * 0.2} />
        </React.Fragment>
      ))}

      {/* === ARMS (straight up) === */}
      {/* Left arm */}
      <line x1={cx - shW} y1={shoulderY} x2={handLX} y2={elbowY}
        stroke={BODY_COLOR} strokeWidth={s.armT} strokeLinecap="round" />
      <line x1={handLX} y1={elbowY} x2={handLX} y2={handY + 2}
        stroke={BODY_COLOR} strokeWidth={s.armT - 1} strokeLinecap="round" />
      {/* Bicep bulge */}
      {s.bicep >= 2 && (
        <ellipse cx={handLX + 1} cy={elbowY + 2} rx={s.bicep * 0.6} ry={s.bicep * 0.8} fill={BODY_SHADOW} opacity={0.5} />
      )}
      {/* Right arm */}
      <line x1={cx + shW} y1={shoulderY} x2={handRX} y2={elbowY}
        stroke={BODY_COLOR} strokeWidth={s.armT} strokeLinecap="round" />
      <line x1={handRX} y1={elbowY} x2={handRX} y2={handY + 2}
        stroke={BODY_COLOR} strokeWidth={s.armT - 1} strokeLinecap="round" />
      {s.bicep >= 2 && (
        <ellipse cx={handRX - 1} cy={elbowY + 2} rx={s.bicep * 0.6} ry={s.bicep * 0.8} fill={BODY_SHADOW} opacity={0.5} />
      )}

      {/* === TORSO === */}
      <path
        d={`M${cx - shW},${shoulderY}
            Q${cx - bellyW - 2},${shoulderY + torsoH * 0.5} ${cx - bellyW},${waistY}
            L${cx + bellyW},${waistY}
            Q${cx + bellyW + 2},${shoulderY + torsoH * 0.5} ${cx + shW},${shoulderY}
            Z`}
        fill={BODY_COLOR}
      />

      {/* Tank top / sports bra */}
      {isFemale ? (
        <path
          d={`M${cx - shW + 2},${shoulderY + 1}
              L${cx + shW - 2},${shoulderY + 1}
              L${cx + shW - 3},${shoulderY + 12}
              L${cx - shW + 3},${shoulderY + 12} Z`}
          fill={TANK_COLOR} />
      ) : (
        <path
          d={`M${cx - shW + 3},${shoulderY + 1}
              Q${cx - bellyW},${shoulderY + torsoH * 0.5} ${cx - bellyW + 1},${waistY}
              L${cx + bellyW - 1},${waistY}
              Q${cx + bellyW},${shoulderY + torsoH * 0.5} ${cx + shW - 3},${shoulderY + 1}
              Z`}
          fill={TANK_COLOR} />
      )}

      {/* Belly roundness for chubby levels */}
      {s.belly >= 20 && (
        <ellipse cx={cx} cy={waistY - 2} rx={bellyW - 1} ry={(s.belly - 14) * 0.5}
          fill={BODY_SHADOW} opacity={0.25} />
      )}

      {/* === SHORTS === */}
      <rect x={cx - bellyW} y={waistY} width={bellyW * 2} height={12} rx={4} fill={SHORTS_COLOR} />

      {/* === LEGS === */}
      <line x1={cx - bellyW + 6} y1={hipY + 10} x2={cx - bellyW + 7} y2={legEndY}
        stroke={BODY_COLOR} strokeWidth={s.legT} strokeLinecap="round" />
      <line x1={cx + bellyW - 6} y1={hipY + 10} x2={cx + bellyW - 7} y2={legEndY}
        stroke={BODY_COLOR} strokeWidth={s.legT} strokeLinecap="round" />

      {/* Sneakers */}
      <ellipse cx={cx - bellyW + 7} cy={legEndY + 2} rx={5} ry={3} fill={TANK_COLOR} />
      <ellipse cx={cx + bellyW - 7} cy={legEndY + 2} rx={5} ry={3} fill={TANK_COLOR} />

      {/* === NECK === */}
      <rect x={cx - s.neckW / 2} y={neckY - 1} width={s.neckW} height={5} rx={s.neckW / 2} fill={BODY_COLOR} />

      {/* === HEAD === */}
      {/* Hair */}
      {isFemale ? (
        <>
          <ellipse cx={cx} cy={headY - 1} rx={s.headR + 2} ry={s.headR + 2} fill={HAIR_FEMALE} />
          <path
            d={`M${cx + s.headR},${headY - 2} Q${cx + s.headR + 10},${headY + 8} ${cx + s.headR + 4},${headY + 22}`}
            stroke={HAIR_FEMALE} strokeWidth={4} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <ellipse cx={cx} cy={headY - 2} rx={s.headR + 1} ry={s.headR + 1.5} fill={HAIR_MALE} />
      )}

      {/* Face — bright yellow circle */}
      <circle cx={cx} cy={headY} r={s.headR} fill={BODY_COLOR} />

      {/* Eyes — bold black dots */}
      <circle cx={cx - 4.5} cy={headY - 1} r={2} fill="#1A1A1A" />
      <circle cx={cx + 4.5} cy={headY - 1} r={2} fill="#1A1A1A" />
      {/* Eye highlights */}
      <circle cx={cx - 4} cy={headY - 1.8} r={0.7} fill="white" />
      <circle cx={cx + 5} cy={headY - 1.8} r={0.7} fill="white" />

      {/* Mouth — wide smile, gets bigger with level */}
      <path
        d={`M${cx - 4},${headY + 4} Q${cx},${headY + 5 + Math.min(idx * 0.7, 5)} ${cx + 4},${headY + 4}`}
        stroke="#B8860B" strokeWidth={1.5} fill="none" strokeLinecap="round" />

      {/* Cheek blush */}
      <ellipse cx={cx - 8} cy={headY + 3} rx={2.5} ry={1.5} fill="#FFB088" opacity={0.4} />
      <ellipse cx={cx + 8} cy={headY + 3} rx={2.5} ry={1.5} fill="#FFB088" opacity={0.4} />

      {/* Headband for level 5+ */}
      {level >= 5 && (
        <path
          d={`M${cx - s.headR + 1},${headY - 5} Q${cx},${headY - 7} ${cx + s.headR - 1},${headY - 5}`}
          stroke={TANK_COLOR} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      )}

      {/* Sweat drops */}
      {level >= 3 && (
        <>
          <ellipse cx={cx + s.headR + 4} cy={headY} rx={1.5} ry={2.5} fill="#64B5F6" opacity={0.7} />
          {level >= 6 && (
            <ellipse cx={cx - s.headR - 3} cy={headY + 3} rx={1.2} ry={2} fill="#64B5F6" opacity={0.5} />
          )}
        </>
      )}

      {/* Level 10 crown */}
      {level === 10 && (
        <text x={cx} y={headY - s.headR - 4} textAnchor="middle" fontSize="9">👑</text>
      )}
    </svg>
  );
}
