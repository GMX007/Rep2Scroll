import React from 'react';

/**
 * LevelAvatar — Cartoon weightlifter avatar that gets progressively fitter.
 * Inspired by chunky, rounded cartoon style with barbell overhead pose.
 * Props:
 *   level: 1-10
 *   gender: 'male' | 'female'
 *   size: pixel width/height (default 120)
 */

// Body shape per level: belly shrinks, shoulders grow, arms get defined
const shapes = [
  // Lv1 Couch Potato — very round belly, tiny arms, no barbell
  { belly: 24, shoulder: 18, armT: 5, bicep: 0, legT: 7, neckW: 8, headR: 14, barbell: false },
  // Lv2 Slow Starter — still chubby but standing
  { belly: 22, shoulder: 19, armT: 5.5, bicep: 0, legT: 7, neckW: 7.5, headR: 13.5, barbell: false },
  // Lv3 Mover — slight taper, holding light barbell
  { belly: 20, shoulder: 20, armT: 6, bicep: 1, legT: 7, neckW: 7, headR: 13, barbell: true },
  // Lv4 Sweaty Mess — visible effort
  { belly: 18, shoulder: 22, armT: 6.5, bicep: 2, legT: 7, neckW: 7, headR: 13, barbell: true },
  // Lv5 Getting Spicy — toned
  { belly: 16, shoulder: 24, armT: 7, bicep: 3, legT: 6.5, neckW: 6.5, headR: 12.5, barbell: true },
  // Lv6 Warrior — athletic
  { belly: 15, shoulder: 26, armT: 7.5, bicep: 4, legT: 6.5, neckW: 6.5, headR: 12.5, barbell: true },
  // Lv7 Titan — strong
  { belly: 14, shoulder: 28, armT: 8, bicep: 5, legT: 6, neckW: 7, headR: 12, barbell: true },
  // Lv8 Legend — very fit
  { belly: 13, shoulder: 30, armT: 8.5, bicep: 6, legT: 6, neckW: 7.5, headR: 12, barbell: true },
  // Lv9 Immortal — shredded
  { belly: 12, shoulder: 32, armT: 9, bicep: 7, legT: 6, neckW: 8, headR: 11.5, barbell: true },
  // Lv10 Machine — peak cartoon beast
  { belly: 12, shoulder: 34, armT: 10, bicep: 8, legT: 6, neckW: 8.5, headR: 11, barbell: true },
];

const SKIN = '#FFCC80'; // warm cartoon skin
const SKIN_SHADOW = '#F0B060';
const TANK_COLOR = '#E8533A'; // orange tank top
const SHORTS_COLOR = '#1E3A6E'; // blue shorts
const HAIR_DARK = '#3D2518';
const HAIR_FEMALE = '#5C2D0E';
const BAR_COLOR = '#9E9E9E';
const PLATE_COLOR = '#E8533A';

export default function LevelAvatar({ level = 1, gender = 'male', size = 120 }) {
  const idx = Math.max(0, Math.min(9, level - 1));
  const s = shapes[idx];
  const isFemale = gender === 'female';

  const cx = 50;
  const headY = 16;
  const neckY = headY + s.headR;
  const shoulderY = neckY + 4;
  const torsoH = 22;
  const waistY = shoulderY + torsoH;
  const hipY = waistY + 2;
  const legEndY = 90;

  // Female: slightly narrower shoulders, wider hips
  const shW = isFemale ? s.shoulder - 3 : s.shoulder;
  const bellyW = isFemale ? s.belly + 1 : s.belly;
  const hipW = isFemale ? bellyW + 3 : bellyW;

  // Arm raise angle — higher levels lift barbell higher
  const armRaise = s.barbell ? Math.min(30 + idx * 5, 75) : 0;
  const armRad = (armRaise * Math.PI) / 180;

  // Arm endpoints (raised overhead for barbell pose)
  const upperArmLen = 14;
  const forearmLen = 12;
  // Shoulder to elbow
  const elbowLX = cx - shW - Math.sin(armRad) * upperArmLen;
  const elbowLY = shoulderY - Math.cos(armRad) * upperArmLen + 4;
  const elbowRX = cx + shW + Math.sin(armRad) * upperArmLen;
  const elbowRY = elbowLY;
  // Elbow to hand (goes more upward)
  const handLX = elbowLX - Math.sin(armRad * 0.7) * forearmLen;
  const handLY = elbowLY - forearmLen * 0.8;
  const handRX = elbowRX + Math.sin(armRad * 0.7) * forearmLen;
  const handRY = handLY;

  // Barbell position
  const barY = Math.min(handLY, handRY) - 1;
  const barLeft = handLX - 6;
  const barRight = handRX + 6;

  // Sweat drops at higher levels
  const showSweat = level >= 3;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block' }}>
      {/* Glow ring at high levels */}
      {level >= 7 && (
        <circle cx={cx} cy={52} r={44} fill="none" stroke="rgba(232,83,58,0.12)" strokeWidth={level >= 9 ? 3 : 2} />
      )}

      {/* === BARBELL === */}
      {s.barbell && (
        <>
          {/* Bar */}
          <line x1={barLeft} y1={barY} x2={barRight} y2={barY}
            stroke={BAR_COLOR} strokeWidth={2} strokeLinecap="round" />
          {/* Left plate */}
          <rect x={barLeft - 4} y={barY - 5} width={4} height={10} rx={1.5} fill={PLATE_COLOR} />
          {level >= 6 && <rect x={barLeft - 9} y={barY - 4} width={4} height={8} rx={1.5} fill={PLATE_COLOR} opacity={0.7} />}
          {/* Right plate */}
          <rect x={barRight} y={barY - 5} width={4} height={10} rx={1.5} fill={PLATE_COLOR} />
          {level >= 6 && <rect x={barRight + 5} y={barY - 4} width={4} height={8} rx={1.5} fill={PLATE_COLOR} opacity={0.7} />}
        </>
      )}

      {/* === ARMS (behind body) === */}
      {s.barbell ? (
        <>
          {/* Left arm */}
          <line x1={cx - shW} y1={shoulderY + 2} x2={elbowLX} y2={elbowLY}
            stroke={SKIN} strokeWidth={s.armT} strokeLinecap="round" />
          <line x1={elbowLX} y1={elbowLY} x2={handLX} y2={handLY}
            stroke={SKIN} strokeWidth={s.armT - 1} strokeLinecap="round" />
          {/* Bicep bulge */}
          {s.bicep >= 2 && (
            <circle cx={elbowLX + 2} cy={elbowLY - 2} r={s.bicep * 0.7} fill={SKIN_SHADOW} />
          )}
          {/* Right arm */}
          <line x1={cx + shW} y1={shoulderY + 2} x2={elbowRX} y2={elbowRY}
            stroke={SKIN} strokeWidth={s.armT} strokeLinecap="round" />
          <line x1={elbowRX} y1={elbowRY} x2={handRX} y2={handRY}
            stroke={SKIN} strokeWidth={s.armT - 1} strokeLinecap="round" />
          {s.bicep >= 2 && (
            <circle cx={elbowRX - 2} cy={elbowRY - 2} r={s.bicep * 0.7} fill={SKIN_SHADOW} />
          )}
        </>
      ) : (
        <>
          {/* Arms down for levels 1-2 */}
          <line x1={cx - shW} y1={shoulderY + 2} x2={cx - shW - 4} y2={waistY + 8}
            stroke={SKIN} strokeWidth={s.armT} strokeLinecap="round" />
          <line x1={cx + shW} y1={shoulderY + 2} x2={cx + shW + 4} y2={waistY + 8}
            stroke={SKIN} strokeWidth={s.armT} strokeLinecap="round" />
        </>
      )}

      {/* === BODY === */}
      {/* Torso — rounded rectangle shape */}
      <path
        d={`M${cx - shW},${shoulderY}
            Q${cx - shW - 1},${shoulderY + torsoH * 0.3} ${cx - bellyW},${waistY}
            L${cx + bellyW},${waistY}
            Q${cx + shW + 1},${shoulderY + torsoH * 0.3} ${cx + shW},${shoulderY}
            Z`}
        fill={SKIN}
      />

      {/* Tank top */}
      {isFemale ? (
        /* Sports bra style */
        <path
          d={`M${cx - shW + 2},${shoulderY + 1}
              L${cx + shW - 2},${shoulderY + 1}
              L${cx + shW - 4},${shoulderY + 13}
              L${cx - shW + 4},${shoulderY + 13} Z`}
          fill={TANK_COLOR} rx={3}
        />
      ) : (
        /* Tank top */
        <path
          d={`M${cx - shW + 3},${shoulderY}
              L${cx + shW - 3},${shoulderY}
              Q${cx + shW - 2},${shoulderY + torsoH * 0.3} ${cx + bellyW - 1},${waistY}
              L${cx - bellyW + 1},${waistY}
              Q${cx - shW + 2},${shoulderY + torsoH * 0.3} ${cx - shW + 3},${shoulderY}
              Z`}
          fill={TANK_COLOR}
        />
      )}

      {/* Belly bulge for early levels */}
      {s.belly >= 20 && (
        <ellipse cx={cx} cy={waistY - 4}
          rx={bellyW - 2} ry={(s.belly - 12) * 0.5}
          fill={SKIN_SHADOW} opacity={0.3}
        />
      )}

      {/* === SHORTS === */}
      <path
        d={`M${cx - bellyW},${waistY}
            L${cx + bellyW},${waistY}
            L${cx + hipW},${hipY + 10}
            L${cx + 3},${hipY + 10}
            L${cx + 3},${hipY + 12}
            L${cx - 3},${hipY + 12}
            L${cx - 3},${hipY + 10}
            L${cx - hipW},${hipY + 10}
            Z`}
        fill={SHORTS_COLOR}
      />

      {/* === LEGS === */}
      <line x1={cx - hipW + 5} y1={hipY + 10} x2={cx - hipW + 7} y2={legEndY}
        stroke={SKIN} strokeWidth={s.legT} strokeLinecap="round" />
      <line x1={cx + hipW - 5} y1={hipY + 10} x2={cx + hipW - 7} y2={legEndY}
        stroke={SKIN} strokeWidth={s.legT} strokeLinecap="round" />

      {/* Sneakers */}
      <ellipse cx={cx - hipW + 7} cy={legEndY + 2} rx={5} ry={3} fill={TANK_COLOR} />
      <ellipse cx={cx + hipW - 7} cy={legEndY + 2} rx={5} ry={3} fill={TANK_COLOR} />
      {/* Shoe stripe */}
      <line x1={cx - hipW + 4} y1={legEndY + 2} x2={cx - hipW + 10} y2={legEndY + 2}
        stroke="white" strokeWidth={0.8} />
      <line x1={cx + hipW - 10} y1={legEndY + 2} x2={cx + hipW - 4} y2={legEndY + 2}
        stroke="white" strokeWidth={0.8} />

      {/* === NECK === */}
      <rect x={cx - s.neckW / 2} y={neckY - 1} width={s.neckW} height={5} rx={s.neckW / 2} fill={SKIN} />

      {/* === HEAD === */}
      {/* Hair behind head */}
      {isFemale ? (
        <>
          <ellipse cx={cx} cy={headY - 1} rx={s.headR + 2.5} ry={s.headR + 2.5} fill={HAIR_FEMALE} />
          {/* Ponytail */}
          <path
            d={`M${cx + s.headR},${headY - 3}
                Q${cx + s.headR + 10},${headY + 6} ${cx + s.headR + 5},${headY + 20}`}
            stroke={HAIR_FEMALE} strokeWidth={4} fill="none" strokeLinecap="round"
          />
        </>
      ) : (
        <ellipse cx={cx} cy={headY - 2} rx={s.headR + 1} ry={s.headR + 1.5} fill={HAIR_DARK} />
      )}

      {/* Face */}
      <circle cx={cx} cy={headY} r={s.headR} fill={SKIN} />

      {/* Eyes — simple dots */}
      <circle cx={cx - 4} cy={headY - 1} r={1.5} fill="#2A1A0A" />
      <circle cx={cx + 4} cy={headY - 1} r={1.5} fill="#2A1A0A" />
      {/* Eye shine */}
      <circle cx={cx - 3.5} cy={headY - 1.5} r={0.5} fill="white" />
      <circle cx={cx + 4.5} cy={headY - 1.5} r={0.5} fill="white" />

      {/* Mouth — smile gets bigger */}
      <path
        d={`M${cx - 3.5},${headY + 3.5} Q${cx},${headY + 4.5 + Math.min(idx * 0.6, 4)} ${cx + 3.5},${headY + 3.5}`}
        stroke="#C0593A" strokeWidth={1.2} fill="none" strokeLinecap="round"
      />

      {/* Blush cheeks */}
      <ellipse cx={cx - 7} cy={headY + 3} rx={2.5} ry={1.5} fill="#FFB0A0" opacity={0.5} />
      <ellipse cx={cx + 7} cy={headY + 3} rx={2.5} ry={1.5} fill="#FFB0A0" opacity={0.5} />

      {/* Headband at higher levels */}
      {level >= 5 && (
        <path
          d={`M${cx - s.headR + 1},${headY - 4} Q${cx},${headY - 6} ${cx + s.headR - 1},${headY - 4}`}
          stroke={TANK_COLOR} strokeWidth={2} fill="none" strokeLinecap="round"
        />
      )}

      {/* === SWEAT DROPS === */}
      {showSweat && (
        <>
          <path d={`M${cx + s.headR + 3},${headY - 2} Q${cx + s.headR + 5},${headY + 1} ${cx + s.headR + 3},${headY + 3}`}
            fill="#64B5F6" opacity={0.7} />
          {level >= 5 && (
            <path d={`M${cx - s.headR - 2},${headY + 1} Q${cx - s.headR - 4},${headY + 3} ${cx - s.headR - 2},${headY + 5}`}
              fill="#64B5F6" opacity={0.5} />
          )}
        </>
      )}

      {/* Level 10 crown */}
      {level === 10 && (
        <text x={cx} y={headY - s.headR - 5} textAnchor="middle" fontSize="8">👑</text>
      )}
    </svg>
  );
}
