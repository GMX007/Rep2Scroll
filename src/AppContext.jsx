import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { getRandomExercise, getRandomExerciseByCategory, exercises } from './data/exercises';
import { getLevelForXP } from './data/levels';
import { DAILY_CAP_MINUTES, GRACE_PERIOD_SECONDS, earningRates } from './theme/tokens';
import {
  scheduleScrollEndNotification,
  cancelScrollEndNotification,
  vibrateScrollTimeUp,
  showScrollTimeUpPageNotification,
} from './services/notificationService';
import { isSocialBackendConfigured, syncSocialProfile } from './services/socialService';

/**
 * Rep2Scroll App State Management
 * Handles: effort bar, reps, sessions, XP, settings, onboarding flow
 */

const STORAGE_KEY = 'sweatnscroll_state';

function createReferralCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'SNS-';
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function normalizeCode(code) {
  return (code || '').trim().toUpperCase();
}

function estimateLeaderboardRank(totalReps = 0) {
  if (totalReps >= 12000) return 1;
  if (totalReps >= 9000) return 2;
  if (totalReps >= 7000) return 3;
  if (totalReps >= 5000) return 5;
  if (totalReps >= 3000) return 9;
  if (totalReps >= 1500) return 15;
  return 25;
}

const initialState = {
  // Onboarding
  onboardingComplete: false,
  disclaimerAccepted: false,

  // User
  gender: 'male',
  activityLevel: 'moderate',
  tier: 'free',
  userEquipment: [],
  showEquipmentSetup: false,
  xp: 0,
  streak: 0,
  totalReps: 0,
  sessionsCompleted: 0,
  leaderboardRank: 25,
  dailyHistory: {},
  exerciseBests: {},
  socialProfile: {
    displayName: 'You',
    referralCode: createReferralCode(),
    referredBy: null,
    friends: [],
  },

  // Current session
  currentExercise: null,
  repsCompleted: 0,
  earnedMinutes: 0,
  isExercising: false,
  isScrolling: false,
  scrollTimeUp: false, // NEW — true when timer expires, triggers TIME'S UP from any screen
  formStatus: { level: 'green', message: 'Ready to go' },
  lastTwoExercises: [],

  // Exercise picker (standard tier)
  showBodyPartPicker: false,
  showExercisePicker: false,
  selectedBodyPart: null,

  // Post-session
  lastSession: null,
  showLevelUp: false,
  showSummary: false,
  showCamera: false,
  showHowTo: false,
  scrollEndTime: null,
  showPricing: false,
  showLegal: null,

  // Settings
  settings: {
    audioEnabled: true,
    vibrationEnabled: true,
    notificationsEnabled: true,
    dailyReminder: false,
    camera: 'Front',
  },
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const scrollStillActive = parsed.scrollEndTime && parsed.scrollEndTime > Date.now();
      return {
        ...initialState,
        ...parsed,
        leaderboardRank: parsed.leaderboardRank || estimateLeaderboardRank(parsed.totalReps || 0),
        socialProfile: {
          ...initialState.socialProfile,
          ...(parsed.socialProfile || {}),
          referralCode: parsed?.socialProfile?.referralCode || createReferralCode(),
          friends: Array.isArray(parsed?.socialProfile?.friends) ? parsed.socialProfile.friends : [],
        },
        currentExercise: null,
        repsCompleted: 0,
        earnedMinutes: scrollStillActive ? (parsed.earnedMinutes || 0) : 0,
        isExercising: false,
        isScrolling: scrollStillActive ? true : false,
        scrollTimeUp: false,
        showBodyPartPicker: false,
        showExercisePicker: false,
        selectedBodyPart: null,
        showEquipmentSetup: false,
        showLevelUp: false,
        showSummary: false,
        showCamera: false,
        showHowTo: false,
        showPricing: false,
        showLegal: null,
        scrollEndTime: scrollStillActive ? parsed.scrollEndTime : null,
      };
    }
  } catch { /* ignore */ }
  return initialState;
}

function saveState(state) {
  try {
    const {
      currentExercise, isExercising, isScrolling, showCamera,
      showLevelUp, showSummary, showBodyPartPicker, showExercisePicker,
      selectedBodyPart, showEquipmentSetup, scrollTimeUp,
      ...persistent
    } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent));
  } catch { /* ignore */ }
}

function calculateMinutesEarned(exercise, reps, holdTime) {
  if (exercise.type === 'hold') {
    const rate = earningRates.plankHold;
    return (holdTime / rate.seconds) * rate.minutesEarned;
  }
  return reps * earningRates.repBased.minutesPerRep;
}

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING': {
      const genderChoice = action.payload?.[0] === 'Female' ? 'female' : 'male';
      const activityRaw = action.payload?.[2] || '';
      const activityLevel =
        activityRaw.includes('couch') ? 'beginner' :
        activityRaw.includes('1-2') ? 'light' :
        activityRaw.includes('3-4') ? 'moderate' : 'active';
      return { ...state, onboardingComplete: true, gender: genderChoice, activityLevel };
    }

    case 'ACCEPT_DISCLAIMER':
      return { ...state, disclaimerAccepted: true };

    case 'START_EXERCISE': {
      const exercise = state.currentExercise || getRandomExercise(state.tier, state.lastTwoExercises, state.userEquipment);
      return {
        ...state,
        currentExercise: exercise,
        isExercising: true,
        showHowTo: true,
        showCamera: false,
        repsCompleted: 0,
        formStatus: { level: 'green', message: 'Get ready...' },
      };
    }

    case 'DISMISS_HOW_TO':
      return { ...state, showHowTo: false, showCamera: true };

    case 'COMPLETE_EXERCISE': {
      const { reps = 0, holdTime = 0, formScore = 100, topNote = null } = action.payload;
      const minutesEarned = Math.min(
        calculateMinutesEarned(state.currentExercise, reps, holdTime),
        DAILY_CAP_MINUTES - state.earnedMinutes
      );
      const xpGained = Math.round(reps * 10 * (formScore / 100)) || Math.round(holdTime * 2);
      const newXP = state.xp + xpGained;

      const oldLevel = getLevelForXP(state.xp);
      const newLevel = getLevelForXP(newXP);
      const leveledUp = newLevel.level > oldLevel.level;

      const lastTwo = [state.currentExercise.id, ...state.lastTwoExercises].slice(0, 2);

      const today = new Date().toISOString().split('T')[0];
      const todayHistory = state.dailyHistory[today] || { reps: 0, minutes: 0, sessions: 0, bestFormScore: 0 };
      const updatedDailyHistory = {
        ...state.dailyHistory,
        [today]: {
          reps: todayHistory.reps + reps,
          minutes: todayHistory.minutes + minutesEarned,
          sessions: todayHistory.sessions + 1,
          bestFormScore: Math.max(todayHistory.bestFormScore, formScore),
        },
      };

      const exerciseKey = state.currentExercise.id;
      const prevBest = state.exerciseBests?.[exerciseKey] || 0;
      const isPersonalBest = reps > prevBest && reps > 0;
      const updatedBests = { ...state.exerciseBests, [exerciseKey]: Math.max(prevBest, reps) };

      return {
        ...state,
        isExercising: false,
        showCamera: false,
        showSummary: true,
        showLevelUp: leveledUp,
        repsCompleted: reps || Math.floor(holdTime),
        earnedMinutes: state.earnedMinutes + minutesEarned,
        totalReps: state.totalReps + reps,
        xp: newXP,
        sessionsCompleted: state.sessionsCompleted + 1,
        leaderboardRank: estimateLeaderboardRank(state.totalReps + reps),
        lastTwoExercises: lastTwo,
        dailyHistory: updatedDailyHistory,
        exerciseBests: updatedBests,
        lastSession: {
          exercise: state.currentExercise.name,
          cleanReps: Math.round(reps * (formScore / 100)),
          flaggedReps: reps - Math.round(reps * (formScore / 100)),
          formScore: Math.round(formScore),
          personalBest: isPersonalBest,
          topNote: topNote || (formScore < 90 ? 'Minor form issues' : null),
          minutesEarned: Math.round(minutesEarned * 10) / 10,
          totalPossible: DAILY_CAP_MINUTES - state.earnedMinutes,
        },
      };
    }

    case 'NEW_SET': {
      const nextExercise = getRandomExercise(state.tier, state.lastTwoExercises, state.userEquipment);
      return {
        ...state,
        showSummary: false,
        currentExercise: nextExercise,
        repsCompleted: 0,
      };
    }

    case 'SWITCH_EXERCISE': {
      const target = exercises.find(e => e.name === action.payload);
      if (target) {
        return {
          ...state,
          currentExercise: target,
          repsCompleted: 0,
          formStatus: { level: 'green', message: 'Switched — get ready' },
        };
      }
      return state;
    }

    case 'START_SCROLLING': {
      const scrollMs = Math.floor(state.earnedMinutes * 60 * 1000);
      return {
        ...state,
        isScrolling: true,
        scrollTimeUp: false,
        scrollEndTime: Date.now() + scrollMs,
        showSummary: false,
        currentExercise: null,
      };
    }

    // NEW — fired by the global timer in AppProvider when time runs out
    case 'SCROLL_TIME_UP': {
      return {
        ...state,
        scrollTimeUp: true,
      };
    }

    case 'STOP_SCROLLING': {
      const nextExercise = getRandomExercise(state.tier, state.lastTwoExercises, state.userEquipment);
      return {
        ...state,
        isScrolling: false,
        scrollTimeUp: false,
        scrollEndTime: null,
        earnedMinutes: 0,
        currentExercise: nextExercise,
        repsCompleted: 0,
      };
    }

    case 'DISMISS_LEVEL_UP':
      return { ...state, showLevelUp: false };

    case 'DISMISS_SUMMARY':
      return { ...state, showSummary: false };

    case 'TOGGLE_SETTING': {
      const key = action.payload;
      let newValue;
      if (key === 'camera') {
        newValue = state.settings.camera === 'Front' ? 'Rear' : 'Front';
      } else {
        newValue = !state.settings[key];
      }
      return {
        ...state,
        settings: { ...state.settings, [key]: newValue },
      };
    }

    case 'SET_TIER':
      return {
        ...state,
        tier: action.payload,
        showEquipmentSetup: action.payload === 'standard',
        showPricing: false,
      };

    case 'SET_EQUIPMENT': {
      const nextExercise = getRandomExercise('standard', state.lastTwoExercises, action.payload);
      return {
        ...state,
        userEquipment: action.payload,
        showEquipmentSetup: false,
        currentExercise: nextExercise,
        repsCompleted: 0,
      };
    }

    case 'SHOW_EQUIPMENT_SETUP':
      return { ...state, showEquipmentSetup: true };

    case 'SHOW_BODY_PART_PICKER':
      return {
        ...state,
        showBodyPartPicker: true,
        showExercisePicker: false,
        showSummary: false,
        selectedBodyPart: null,
      };

    case 'DISMISS_BODY_PART_PICKER':
      return {
        ...state,
        showBodyPartPicker: false,
        showExercisePicker: false,
        selectedBodyPart: null,
      };

    case 'SELECT_BODY_PART':
      return {
        ...state,
        selectedBodyPart: action.payload,
        showBodyPartPicker: false,
        showExercisePicker: true,
      };

    case 'PICK_EXERCISE': {
      return {
        ...state,
        currentExercise: action.payload,
        showExercisePicker: false,
        showBodyPartPicker: false,
        selectedBodyPart: null,
        repsCompleted: 0,
      };
    }

    case 'TOGGLE_GENDER':
      return { ...state, gender: state.gender === 'male' ? 'female' : 'male' };

    case 'SHOW_PRICING':
      return { ...state, showPricing: true };

    case 'DISMISS_PRICING':
      return { ...state, showPricing: false };

    case 'SHOW_LEGAL':
      return { ...state, showLegal: action.payload };

    case 'DISMISS_LEGAL':
      return { ...state, showLegal: null };

    case 'UPDATE_FORM_STATUS':
      return { ...state, formStatus: action.payload };

    case 'SET_DISPLAY_NAME': {
      const next = (action.payload || '').trim().slice(0, 20);
      if (!next) return state;
      return {
        ...state,
        socialProfile: {
          ...state.socialProfile,
          displayName: next,
        },
      };
    }

    case 'ADD_FRIEND_CODE': {
      const code = normalizeCode(action.payload);
      const ownCode = normalizeCode(state.socialProfile.referralCode);
      const friends = (state.socialProfile.friends || []).map(normalizeCode);
      if (!code || code === ownCode) return state;
      if (friends.includes(code)) return state;
      return {
        ...state,
        socialProfile: {
          ...state.socialProfile,
          friends: [...friends, code].slice(0, 100),
        },
      };
    }

    case 'APPLY_REFERRAL_CODE': {
      const code = (action.payload || '').trim().toUpperCase();
      if (!code || code === state.socialProfile.referralCode || state.socialProfile.referredBy) return state;
      return {
        ...state,
        socialProfile: {
          ...state.socialProfile,
          referredBy: code,
        },
      };
    }

    default:
      return state;
  }
}

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const timerRef = useRef(null);
  /** Latest end time for interval callback (avoids stale closure). */
  const scrollEndTimeRef = useRef(null);
  /** Prevents double alert / double SCROLL_TIME_UP if check runs twice same ms. */
  const scrollExpiryHandledRef = useRef(false);

  scrollEndTimeRef.current = state.scrollEndTime;

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Best-effort social sync for live leaderboard backend (if configured).
  useEffect(() => {
    if (!isSocialBackendConfigured()) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        if (!cancelled) await syncSocialProfile(state);
      } catch {
        // Keep app fully functional if social backend is unavailable.
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    state.xp,
    state.totalReps,
    state.streak,
    state.socialProfile?.displayName,
    state.socialProfile?.referralCode,
    state.socialProfile?.referredBy,
    JSON.stringify(state.socialProfile?.friends || []),
  ]);

  useEffect(() => {
    if (state.onboardingComplete && state.disclaimerAccepted && !state.currentExercise && !state.showEquipmentSetup) {
      dispatch({ type: 'NEW_SET' });
    }
  }, [state.onboardingComplete, state.disclaimerAccepted, state.showEquipmentSetup]);

  // Schedule SW notification for scroll end (survives tab backgrounding; do not tie to ScrollingScreen mount).
  useEffect(() => {
    if (
      !state.settings?.notificationsEnabled ||
      !state.isScrolling ||
      !state.scrollEndTime ||
      state.scrollTimeUp
    ) {
      cancelScrollEndNotification();
      return;
    }
    scheduleScrollEndNotification(state.scrollEndTime);
    return () => {
      cancelScrollEndNotification();
    };
  }, [state.settings?.notificationsEnabled, state.isScrolling, state.scrollEndTime, state.scrollTimeUp]);

  // ─── Global scroll timer ───────────────────────────────────────────────────
  // Runs at the AppProvider level so it keeps ticking regardless of which
  // screen the user is on. When time expires it dispatches SCROLL_TIME_UP
  // which sets scrollTimeUp: true — AppShell then shows the TIME'S UP overlay.
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!state.isScrolling || !state.scrollEndTime || state.scrollTimeUp) return;

    scrollExpiryHandledRef.current = false;

    const check = () => {
      const end = scrollEndTimeRef.current;
      if (end == null || scrollExpiryHandledRef.current) return;
      if (Date.now() < end) return;

      scrollExpiryHandledRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      cancelScrollEndNotification();
      vibrateScrollTimeUp();

      // Foreground only — background tabs freeze JS; user gets the SW notification instead.
      if (typeof document !== 'undefined' && !document.hidden) {
        if (state.settings?.notificationsEnabled) {
          showScrollTimeUpPageNotification();
        }
        try {
          if (typeof window !== 'undefined') {
            window.setTimeout(() => {
              try {
                window.alert("Time's up! Your scroll session has ended. Come back to earn more.");
              } catch {
                /* ignore */
              }
            }, 0);
          }
        } catch {
          /* ignore */
        }
      }

      dispatch({ type: 'SCROLL_TIME_UP' });
    };

    check();
    timerRef.current = setInterval(check, 1000);

    const handleVisibility = () => {
      if (!document.hidden) check();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [state.settings?.notificationsEnabled, state.isScrolling, state.scrollEndTime, state.scrollTimeUp]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
