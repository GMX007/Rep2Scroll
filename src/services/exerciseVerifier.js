/**
 * SweatNScroll Exercise Verifier
 * Applies exercise-specific form rules to MoveNet keypoints.
 * Returns form status (green/amber/red) and rep counting.
 *
 * Covers all 17 exercises:
 *   Free:     push-up, squat, plank
 *   Standard: knee-push-up, wide-push-up, diamond-push-up, decline-push-up,
 *             pike-push-up, wall-sit, glute-bridge, glute-bridge-hold, lunge,
 *             burpee, mountain-climber, bicycle-crunch, superman, calf-raise
 */

import { getKeypoint, calculateAngle, calculateAlignment } from './poseDetection';

/**
 * Form feedback result
 * @typedef {Object} FormResult
 * @property {'green'|'amber'|'red'|'pause'} level
 * @property {string} message
 * @property {boolean} repCompleted - true if a full rep was just completed
 * @property {number} effortScore - 0 to 1 (1 = perfect form)
 * @property {boolean} [holdValid] - for hold exercises, whether hold counts
 */

// State trackers for rep counting
const repState = {
  phase: 'up', // 'up' or 'down'
  lastAngle: 180,
  formBreakStart: null,
};

export function resetRepState() {
  repState.phase = 'up';
  repState.lastAngle = 180;
  repState.formBreakStart = null;
}

// ─── HELPERS ───

const CANT_SEE = { level: 'amber', message: "Adjust camera — can't see full body", repCompleted: false, effortScore: 0 };

function visible(...points) {
  return points.every(p => p != null);
}

// ─── FORM BREAK DETECTION ───
function checkFormBreak(result) {
  const now = Date.now();
  if (!repState.formBreakStart) {
    repState.formBreakStart = now;
  }
  const breakDuration = (now - repState.formBreakStart) / 1000;

  if (breakDuration > 5) {
    return {
      ...result,
      level: 'pause',
      message: 'Form breaking down — take a breath',
    };
  }

  return result;
}

function clearFormBreak() {
  repState.formBreakStart = null;
}

// ─────────────────────────────────────────────
// PUSH-UP FAMILY (push-up, knee, wide, diamond, decline, pike)
// All share the same elbow-angle rep counting and hip-alignment check.
// ─────────────────────────────────────────────

function verifyPushUpFamily(pose, { downAngle = 95, upAngle = 160, hipTolerance = 15, useKnee = false, pikeMode = false } = {}) {
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const elbow = getKeypoint(pose, 'left_elbow');
  const wrist = getKeypoint(pose, 'left_wrist');
  const hip = getKeypoint(pose, 'left_hip');
  const lowerRef = useKnee ? getKeypoint(pose, 'left_knee') : getKeypoint(pose, 'left_ankle');

  if (!visible(shoulder, elbow, wrist, hip, lowerRef)) {
    return CANT_SEE;
  }

  const elbowAngle = calculateAngle(shoulder, elbow, wrist);
  const hipDeviation = calculateAlignment(shoulder, hip, lowerRef);

  // Pike push-ups expect elevated hips — invert the check
  const maxHipDev = pikeMode ? hipTolerance + 15 : hipTolerance;
  const hipBadThreshold = maxHipDev + 10;

  // Check hip alignment
  if (!pikeMode && hipDeviation > hipBadThreshold) {
    return checkFormBreak({
      level: 'red',
      message: hipDeviation > hipBadThreshold + 10 ? 'Hips dropping — squeeze your core' : 'Keep hips level',
      repCompleted: false,
      effortScore: 0,
    });
  }

  // Rep counting: detect down phase then up phase
  let repCompleted = false;
  if (elbowAngle < downAngle && repState.phase === 'up') {
    repState.phase = 'down';
  }
  if (elbowAngle > upAngle && repState.phase === 'down') {
    repState.phase = 'up';
    repCompleted = true;
  }

  // Amber form check
  if (!pikeMode && hipDeviation > hipTolerance) {
    return {
      level: 'amber',
      message: useKnee ? 'Keep body straight from head to knees' : 'Keep your body aligned',
      repCompleted,
      effortScore: 0.8,
    };
  }

  clearFormBreak();
  return {
    level: 'green',
    message: 'Good form — keep it up',
    repCompleted,
    effortScore: 1,
  };
}

export function verifyPushUp(pose) {
  return verifyPushUpFamily(pose, { downAngle: 80, upAngle: 145, hipTolerance: 25 });
}

export function verifyKneePushUp(pose) {
  return verifyPushUpFamily(pose, { downAngle: 80, upAngle: 145, hipTolerance: 25, useKnee: true });
}

export function verifyWidePushUp(pose) {
  return verifyPushUpFamily(pose, { downAngle: 80, upAngle: 145, hipTolerance: 25 });
}

export function verifyDiamondPushUp(pose) {
  return verifyPushUpFamily(pose, { downAngle: 85, upAngle: 145, hipTolerance: 25 });
}

export function verifyDeclinePushUp(pose) {
  return verifyPushUpFamily(pose, { downAngle: 80, upAngle: 145, hipTolerance: 25 });
}

export function verifyPikePushUp(pose) {
  return verifyPushUpFamily(pose, { downAngle: 90, upAngle: 155, hipTolerance: 30, pikeMode: true });
}

// ─────────────────────────────────────────────
// SQUAT VERIFIER
// ─────────────────────────────────────────────

export function verifySquat(pose) {
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  const ankle = getKeypoint(pose, 'left_ankle');
  const shoulder = getKeypoint(pose, 'left_shoulder');

  if (!visible(hip, knee, ankle, shoulder)) return CANT_SEE;

  const kneeAngle = calculateAngle(hip, knee, ankle);
  const torsoAngle = calculateAngle({ x: shoulder.x, y: shoulder.y - 100 }, shoulder, hip);

  let repCompleted = false;
  if (kneeAngle < 115 && repState.phase === 'up') {
    repState.phase = 'down';
  }
  if (kneeAngle > 150 && repState.phase === 'down') {
    repState.phase = 'up';
    repCompleted = true;
  }

  if (kneeAngle > 125 && repState.phase === 'down') {
    return { level: 'amber', message: 'Go deeper — thighs parallel', repCompleted: false, effortScore: 0.8 };
  }

  if (torsoAngle > 50) {
    return checkFormBreak({ level: 'red', message: "Chest up — don't lean forward", repCompleted: false, effortScore: 0 });
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — keep it up', repCompleted, effortScore: 1 };
}

// ─────────────────────────────────────────────
// LUNGE VERIFIER
// ─────────────────────────────────────────────

export function verifyLunge(pose) {
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  const ankle = getKeypoint(pose, 'left_ankle');
  const shoulder = getKeypoint(pose, 'left_shoulder');

  if (!visible(hip, knee, ankle, shoulder)) return CANT_SEE;

  const kneeAngle = calculateAngle(hip, knee, ankle);
  const torsoDeviation = calculateAlignment({ x: shoulder.x, y: shoulder.y - 50 }, shoulder, hip);

  let repCompleted = false;
  if (kneeAngle < 115 && repState.phase === 'up') {
    repState.phase = 'down';
  }
  if (kneeAngle > 150 && repState.phase === 'down') {
    repState.phase = 'up';
    repCompleted = true;
  }

  // Knee going past toes check (approximate: knee.x far ahead of ankle.x)
  if (Math.abs(knee.x - ankle.x) > 80) {
    return checkFormBreak({ level: 'red', message: 'Knee over toes — step wider', repCompleted: false, effortScore: 0 });
  }

  if (torsoDeviation > 20) {
    return { level: 'amber', message: 'Keep torso upright', repCompleted, effortScore: 0.8 };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — keep it up', repCompleted, effortScore: 1 };
}

// ─────────────────────────────────────────────
// HOLD EXERCISES (plank, wall-sit, glute-bridge-hold, superman)
// ─────────────────────────────────────────────

export function verifyPlank(pose) {
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const ankle = getKeypoint(pose, 'left_ankle');

  if (!visible(shoulder, hip, ankle)) {
    return { ...CANT_SEE, holdValid: false };
  }

  const hipDeviation = calculateAlignment(shoulder, hip, ankle);

  if (hipDeviation > 20) {
    return checkFormBreak({
      level: 'red',
      message: hip.y > shoulder.y + 30 ? 'Hips sagging — engage your core' : 'Hips too high — flatten out',
      repCompleted: false, effortScore: 0, holdValid: false,
    });
  }

  if (hipDeviation > 10) {
    return { level: 'amber', message: 'Straighten your body line', repCompleted: false, effortScore: 0.8, holdValid: true };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — hold steady', repCompleted: false, effortScore: 1, holdValid: true };
}

export function verifyWallSit(pose) {
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  const ankle = getKeypoint(pose, 'left_ankle');
  const shoulder = getKeypoint(pose, 'left_shoulder');

  if (!visible(hip, knee, ankle, shoulder)) {
    return { ...CANT_SEE, holdValid: false };
  }

  const kneeAngle = calculateAngle(hip, knee, ankle);
  const backAlignment = calculateAlignment(shoulder, hip, { x: hip.x, y: hip.y + 100 }); // vertical check

  // Knees should be around 90 degrees
  if (kneeAngle > 120) {
    return checkFormBreak({
      level: 'red', message: 'Slide lower — 90° knee bend', repCompleted: false, effortScore: 0, holdValid: false,
    });
  }

  if (kneeAngle > 105) {
    return { level: 'amber', message: 'Go a bit lower', repCompleted: false, effortScore: 0.8, holdValid: true };
  }

  // Back should be fairly upright (against imaginary wall)
  if (backAlignment > 25) {
    return { level: 'amber', message: 'Press back flat against the wall', repCompleted: false, effortScore: 0.8, holdValid: true };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — hold it', repCompleted: false, effortScore: 1, holdValid: true };
}

export function verifyGluteBridgeHold(pose) {
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  const ankle = getKeypoint(pose, 'left_ankle');
  const shoulder = getKeypoint(pose, 'left_shoulder');

  if (!visible(hip, knee, ankle, shoulder)) {
    return { ...CANT_SEE, holdValid: false };
  }

  // Hip should be elevated — shoulder-hip-knee roughly aligned
  const alignment = calculateAlignment(shoulder, hip, knee);

  if (alignment > 20) {
    return checkFormBreak({
      level: 'red', message: 'Push hips higher — squeeze glutes', repCompleted: false, effortScore: 0, holdValid: false,
    });
  }

  if (alignment > 10) {
    return { level: 'amber', message: 'Lift hips a bit higher', repCompleted: false, effortScore: 0.8, holdValid: true };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good hold — squeeze glutes', repCompleted: false, effortScore: 1, holdValid: true };
}

export function verifySuperman(pose) {
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const ankle = getKeypoint(pose, 'left_ankle');
  const elbow = getKeypoint(pose, 'left_elbow');

  if (!visible(shoulder, hip, ankle)) {
    return { ...CANT_SEE, holdValid: false };
  }

  // Arms and legs should be elevated — shoulder and ankle above hip level
  const shoulderLift = hip.y - shoulder.y; // positive = shoulder is above hip
  const ankleLift = hip.y - ankle.y;

  // Need at least some lift
  if (shoulderLift < 5 && ankleLift < 5) {
    return checkFormBreak({
      level: 'red', message: 'Lift arms and legs off the ground', repCompleted: false, effortScore: 0, holdValid: false,
    });
  }

  if (shoulderLift < 10 || ankleLift < 10) {
    return { level: 'amber', message: 'Reach higher with arms and legs', repCompleted: false, effortScore: 0.8, holdValid: true };
  }

  clearFormBreak();
  return { level: 'green', message: 'Great hold — keep extending', repCompleted: false, effortScore: 1, holdValid: true };
}

// ─────────────────────────────────────────────
// REP EXERCISES (glute-bridge, burpee, mountain-climber, bicycle-crunch, calf-raise)
// ─────────────────────────────────────────────

export function verifyGluteBridge(pose) {
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  const ankle = getKeypoint(pose, 'left_ankle');
  const shoulder = getKeypoint(pose, 'left_shoulder');

  if (!visible(hip, knee, ankle, shoulder)) return CANT_SEE;

  // Rep counting based on hip height relative to shoulder
  const hipHeight = shoulder.y - hip.y; // positive when hip is above shoulder (lying on back, hips raised)
  const alignment = calculateAlignment(shoulder, hip, knee);

  let repCompleted = false;
  // "up" = hips lowered; "down" = hips raised (naming follows rep convention)
  if (alignment < 12 && repState.phase === 'up') {
    repState.phase = 'down'; // hips are raised
  }
  if (alignment > 20 && repState.phase === 'down') {
    repState.phase = 'up'; // hips lowered back
    repCompleted = true;
  }

  if (alignment > 25) {
    return checkFormBreak({ level: 'red', message: 'Push hips higher', repCompleted: false, effortScore: 0 });
  }

  if (alignment > 15) {
    return { level: 'amber', message: 'Squeeze glutes at the top', repCompleted, effortScore: 0.8 };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — keep it up', repCompleted, effortScore: 1 };
}

export function verifyBurpee(pose) {
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const ankle = getKeypoint(pose, 'left_ankle');
  const elbow = getKeypoint(pose, 'left_elbow');

  if (!visible(shoulder, hip, ankle)) return CANT_SEE;

  // Burpee detection: track vertical range of shoulder position
  // "down" = plank/push-up position (shoulder low), "up" = standing/jump (shoulder high)
  const shoulderHeight = ankle.y - shoulder.y; // bigger = standing taller

  let repCompleted = false;
  if (shoulderHeight < 80 && repState.phase === 'up') {
    repState.phase = 'down'; // went to ground
  }
  if (shoulderHeight > 200 && repState.phase === 'down') {
    repState.phase = 'up'; // stood back up
    repCompleted = true;
  }

  // Hip alignment in plank portion
  const hipDev = calculateAlignment(shoulder, hip, ankle);
  if (repState.phase === 'down' && hipDev > 30) {
    return { level: 'amber', message: 'Keep body tight in plank', repCompleted: false, effortScore: 0.8 };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good pace — keep moving', repCompleted, effortScore: 1 };
}

export function verifyMountainClimber(pose) {
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const ankle = getKeypoint(pose, 'left_ankle');
  const knee = getKeypoint(pose, 'left_knee');

  if (!visible(shoulder, hip, ankle, knee)) return CANT_SEE;

  // Rep counting: knee drive toward chest. Track knee-hip vertical distance
  const kneeDrive = hip.y - knee.y; // positive = knee is above hip (driven up)

  let repCompleted = false;
  if (kneeDrive > 10 && repState.phase === 'up') {
    repState.phase = 'down'; // knee driven forward
  }
  if (kneeDrive < -10 && repState.phase === 'down') {
    repState.phase = 'up'; // knee returned
    repCompleted = true;
  }

  // Hip alignment — should stay in plank position
  const hipDev = calculateAlignment(shoulder, hip, ankle);
  if (hipDev > 25) {
    return checkFormBreak({ level: 'red', message: 'Hips too high — stay in plank', repCompleted: false, effortScore: 0 });
  }
  if (hipDev > 15) {
    return { level: 'amber', message: 'Keep hips level', repCompleted, effortScore: 0.8 };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — keep it up', repCompleted, effortScore: 1 };
}

export function verifyBicycleCrunch(pose) {
  const shoulder = getKeypoint(pose, 'left_shoulder');
  const hip = getKeypoint(pose, 'left_hip');
  const knee = getKeypoint(pose, 'left_knee');
  const elbow = getKeypoint(pose, 'left_elbow');

  if (!visible(shoulder, hip, knee, elbow)) return CANT_SEE;

  // Track rotation: elbow moving toward opposite knee
  const elbowKneeDist = Math.sqrt(
    Math.pow(elbow.x - knee.x, 2) + Math.pow(elbow.y - knee.y, 2)
  );

  let repCompleted = false;
  if (elbowKneeDist < 80 && repState.phase === 'up') {
    repState.phase = 'down'; // elbow close to knee
  }
  if (elbowKneeDist > 150 && repState.phase === 'down') {
    repState.phase = 'up';
    repCompleted = true;
  }

  // Shoulder should stay lifted (not lying flat)
  const shoulderLift = hip.y - shoulder.y;
  if (shoulderLift < 15) {
    return { level: 'amber', message: 'Lift shoulders off the ground', repCompleted, effortScore: 0.8 };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — keep rotating', repCompleted, effortScore: 1 };
}

export function verifyCalfRaise(pose) {
  const ankle = getKeypoint(pose, 'left_ankle');
  const knee = getKeypoint(pose, 'left_knee');
  const hip = getKeypoint(pose, 'left_hip');
  const shoulder = getKeypoint(pose, 'left_shoulder');

  if (!visible(ankle, knee, hip, shoulder)) return CANT_SEE;

  // Calf raise: track ankle vertical position (rises when on tiptoes)
  // Use ankle-to-knee distance change as proxy
  const ankleKneeDist = Math.abs(knee.y - ankle.y);

  let repCompleted = false;
  // Shorter distance = calf raised (ankle comes up toward knee)
  if (ankleKneeDist < repState.lastAngle * 0.85 && repState.phase === 'up') {
    repState.phase = 'down'; // raised up
  }
  if (ankleKneeDist > repState.lastAngle * 0.95 && repState.phase === 'down') {
    repState.phase = 'up'; // lowered
    repCompleted = true;
  }
  repState.lastAngle = ankleKneeDist || repState.lastAngle;

  // Posture check — should be standing upright
  const bodyAlignment = calculateAlignment(shoulder, hip, ankle);
  if (bodyAlignment > 15) {
    return { level: 'amber', message: 'Stand tall — don\'t lean', repCompleted, effortScore: 0.8 };
  }

  clearFormBreak();
  return { level: 'green', message: 'Good form — full range of motion', repCompleted, effortScore: 1 };
}

// ─────────────────────────────────────────────
// MAIN DISPATCHER
// ─────────────────────────────────────────────

/**
 * Main verification dispatcher — routes to the correct exercise verifier.
 * @param {string} exerciseId
 * @param {Object} pose
 * @returns {FormResult}
 */
export function verifyExercise(exerciseId, pose) {
  switch (exerciseId) {
    // Free tier
    case 'push-up':           return verifyPushUp(pose);
    case 'squat':             return verifySquat(pose);
    case 'plank':             return verifyPlank(pose);

    // Push-up variants
    case 'knee-push-up':      return verifyKneePushUp(pose);
    case 'wide-push-up':      return verifyWidePushUp(pose);
    case 'diamond-push-up':   return verifyDiamondPushUp(pose);
    case 'decline-push-up':   return verifyDeclinePushUp(pose);
    case 'pike-push-up':      return verifyPikePushUp(pose);

    // Hold exercises
    case 'wall-sit':          return verifyWallSit(pose);
    case 'glute-bridge-hold': return verifyGluteBridgeHold(pose);
    case 'superman':          return verifySuperman(pose);

    // Rep exercises
    case 'glute-bridge':      return verifyGluteBridge(pose);
    case 'lunge':             return verifyLunge(pose);
    case 'burpee':            return verifyBurpee(pose);
    case 'mountain-climber':  return verifyMountainClimber(pose);
    case 'bicycle-crunch':    return verifyBicycleCrunch(pose);
    case 'calf-raise':        return verifyCalfRaise(pose);

    default:
      return { level: 'green', message: 'Exercise not yet supported by AI', repCompleted: false, effortScore: 1 };
  }
}
