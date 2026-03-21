import React, { createContext, useReducer, useEffect } from 'react';
import { getRandomExercise, getRandomExerciseByCategory, exercises } from './data/exercises';
import { getLevelForXP } from './data/levels';
import { DAILY_CAP_MINUTES, GRACE_PERIOD_SECONDS, earningRates } from './theme/tokens';

/**
 * SweatNScroll App State Management
 * Handles: effort bar, reps, sessions, XP, settings, onboarding flow
 */

const STORAGE_KEY = 'sweatnscroll_state';

const initialState = {
  // Onboarding
  onboardingComplete: false,
  disclaimerAccepted: false,

  // User
  gender: 'male', // 'male' | 'female'
  tier: 'free', // 'free' | 'standard'
  userEquipment: [], // e.g. ['Dumbbells', 'Pull-up Bar']
  showEquipmentSetup: false,
  xp: 0,
  streak: 0,
  totalReps: 0,
  sessionsCompleted: 0,
  // Daily history: { 'YYYY-MM-DD': { reps, minutes, sessions, bestFormScore } }
  dailyHistory: {},
  // Personal bests per exercise: { 'push-up': 14, 'squat': 20 }
  exerciseBests: {},

  // Current session
  currentExercise: null,
  repsCompleted: 0,
  earnedMinutes: 0,
  isExercising: false,
  isScrolling: false,
  formStatus: { level: 'green', message: 'Ready to go' },
  lastTwoExercises: [],

  // Exercise picker (standard tier)
  showBodyPartPicker: false,
  showExercisePicker: false,
  selectedBodyPart: null, // 'upper' | 'lower' | 'arms' | 'core'

  // Post-session
  lastSession: null,
  showLevelUp: false,
  showSummary: false,
  showCamera: false,
  showPricing: false,
  showLegal: null, // null | 'privacy' | 'terms'

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
      // Reset session-specific state on load (no carryover between sessions)
      return {
        ...initialState,
        ...parsed,
        currentExercise: null,
        repsCompleted: 0,
        earnedMinutes: 0,
        isExercising: false,
        isScrolling: false,
        showBodyPartPicker: false,
        showExercisePicker: false,
        selectedBodyPart: null,
        showEquipmentSetup: false,
        showLevelUp: false,
        showSummary: false,
        showCamera: false,
        showPricing: false,
        showLegal: null,
      };
    }
  } catch { /* ignore */ }
  return initialState;
}

function saveState(state) {
  try {
    // Only persist non-session state
    const { currentExercise, isExercising, isScrolling, showCamera, showLevelUp, showSummary, showBodyPartPicker, showExercisePicker, selectedBodyPart, showEquipmentSetup, ...persistent } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistent));
  } catch { /* ignore */ }
}

function calculateMinutesEarned(exercise, reps, holdTime) {
  if (exercise.type === 'hold') {
    const rate = earningRates.plankHold; // default hold rate
    return (holdTime / rate.seconds) * rate.minutesEarned;
  }
  return reps * earningRates.repBased.minutesPerRep;
}

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING': {
      // payload.selections[0] is 'Male' or 'Female' from the gender step
      const genderChoice = action.payload?.[0] === 'Female' ? 'female' : 'male';
      return { ...state, onboardingComplete: true, gender: genderChoice };
    }

    case 'ACCEPT_DISCLAIMER':
      return { ...state, disclaimerAccepted: true };

    case 'START_EXERCISE': {
      const exercise = state.currentExercise || getRandomExercise(state.tier, state.lastTwoExercises, state.userEquipment);
      return {
        ...state,
        currentExercise: exercise,
        isExercising: true,
        showCamera: true,
        repsCompleted: 0,
        formStatus: { level: 'green', message: 'Get ready...' },
      };
    }

    case 'COMPLETE_EXERCISE': {
      const { reps = 0, holdTime = 0, formScore = 100 } = action.payload;
      const minutesEarned = Math.min(
        calculateMinutesEarned(state.currentExercise, reps, holdTime),
        DAILY_CAP_MINUTES - state.earnedMinutes
      );
      const xpGained = Math.round(reps * 10 * (formScore / 100)) || Math.round(holdTime * 2);
      const newXP = state.xp + xpGained;

      // Check for level up
      const oldLevel = getLevelForXP(state.xp);
      const newLevel = getLevelForXP(newXP);
      const leveledUp = newLevel.level > oldLevel.level;

      const lastTwo = [state.currentExercise.id, ...state.lastTwoExercises].slice(0, 2);

      // Update daily history
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

      // Check personal best — compare reps for this exercise against history
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
        lastTwoExercises: lastTwo,
        dailyHistory: updatedDailyHistory,
        exerciseBests: updatedBests,
        lastSession: {
          exercise: state.currentExercise.name,
          cleanReps: Math.round(reps * (formScore / 100)),
          flaggedReps: reps - Math.round(reps * (formScore / 100)),
          formScore: Math.round(formScore),
          personalBest: isPersonalBest,
          topNote: formScore < 90 ? 'Minor form issues' : null,
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
      // Find the easier variation exercise by name
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

    case 'START_SCROLLING':
      return {
        ...state,
        isScrolling: true,
        showSummary: false,
        currentExercise: null,
      };

    case 'STOP_SCROLLING': {
      const nextExercise = getRandomExercise(state.tier, state.lastTwoExercises, state.userEquipment);
      return {
        ...state,
        isScrolling: false,
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
        // Toggle between 'Front' and 'Rear'
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
      return { ...state, showLegal: action.payload }; // 'privacy' or 'terms'

    case 'DISMISS_LEGAL':
      return { ...state, showLegal: null };

    case 'UPDATE_FORM_STATUS':
      return { ...state, formStatus: action.payload };

    default:
      return state;
  }
}

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  // Save persistent state on change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Assign initial exercise if needed
  useEffect(() => {
    if (state.onboardingComplete && state.disclaimerAccepted && !state.currentExercise && !state.showEquipmentSetup) {
      dispatch({ type: 'NEW_SET' });
    }
  }, [state.onboardingComplete, state.disclaimerAccepted, state.showEquipmentSetup]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}
