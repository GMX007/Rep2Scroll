import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, AppContext } from './AppContext';
import NavBar from './components/NavBar';
import ScrollSessionAwayPopup from './components/ScrollSessionAwayPopup';
import InstallPrompt from './components/InstallPrompt';
// Screens
import EarnScreen from './screens/EarnScreen';
import SummaryScreen from './screens/SummaryScreen';
import LevelUpScreen from './screens/LevelUpScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DisclaimerScreen from './screens/DisclaimerScreen';
import ProgressScreen from './screens/ProgressScreen';
import RanksScreen from './screens/RanksScreen';
import SettingsScreen from './screens/SettingsScreen';
import CameraScreen from './screens/CameraScreen';
import PricingScreen from './screens/PricingScreen';
import LegalScreen from './screens/LegalScreen';
import ScrollingScreen from './screens/ScrollingScreen';
import BodyPartScreen from './screens/BodyPartScreen';
import ExercisePickerScreen from './screens/ExercisePickerScreen';
import EquipmentScreen from './screens/EquipmentScreen';
import ExerciseHowToScreen from './screens/ExerciseHowToScreen';

function AppShell() {
  const { state, dispatch } = useContext(AppContext);

  // Flow: Onboarding -> Disclaimer -> Main app
  if (!state.onboardingComplete) {
    return <OnboardingScreen />;
  }
  if (!state.disclaimerAccepted) {
    return <DisclaimerScreen />;
  }
  // How-to screen (shown before camera)
  if (state.showHowTo) {
    return (
      <ExerciseHowToScreen
        exercise={state.currentExercise}
        onReady={() => dispatch({ type: 'DISMISS_HOW_TO' })}
      />
    );
  }
  // Camera overlay (shown over main app)
  if (state.showCamera) {
    return (
      <CameraScreen
        exercise={state.currentExercise}
        onComplete={(result) => dispatch({ type: 'COMPLETE_EXERCISE', payload: result })}
        onSwitchExercise={(name) => dispatch({ type: 'SWITCH_EXERCISE', payload: name })}
      />
    );
  }
  // Level up overlay
  if (state.showLevelUp) {
    return <LevelUpScreen />;
  }

  // ← NEW: Time's Up overlay — fires from any screen when scroll timer expires
  if (state.scrollTimeUp) {
    return (
      <ScrollingScreen
        onStop={() => dispatch({ type: 'STOP_SCROLLING' })}
        minutes={0}
        forceTimeUp={true}
      />
    );
  }

  // Equipment setup (shown after upgrading to standard)
  if (state.showEquipmentSetup) {
    return <EquipmentScreen />;
  }
  // Body part picker overlay (standard tier)
  if (state.showBodyPartPicker) {
    return <BodyPartScreen />;
  }
  // Exercise picker overlay (standard tier)
  if (state.showExercisePicker) {
    return <ExercisePickerScreen />;
  }
  // Pricing overlay
  if (state.showPricing) {
    return <PricingScreen onClose={() => dispatch({ type: 'DISMISS_PRICING' })} />;
  }
  // Legal screens overlay
  if (state.showLegal) {
    return <LegalScreen type={state.showLegal} onClose={() => dispatch({ type: 'DISMISS_LEGAL' })} />;
  }

  return (
    <div className="app-shell">
      <div className="screen-container">
        <Routes>
          <Route path="/" element={
            state.showSummary ? <SummaryScreen /> :
            state.isScrolling ? <ScrollingScreen onStop={() => dispatch({ type: 'STOP_SCROLLING' })} minutes={state.earnedMinutes} scrollEndTime={state.scrollEndTime} /> :
            <EarnScreen />
          } />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/ranks" element={<RanksScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </div>
      <ScrollSessionAwayPopup />
      <NavBar />
      <InstallPrompt />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}

