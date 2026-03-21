import React, { useState, useContext } from 'react';
import Button from '../components/Button';
import LevelAvatar from '../components/LevelAvatar';
import { AppContext } from '../AppContext';

const steps = [
  {
    question: 'Pick your look! ✨',
    subtitle: 'Watch your avatar glow up as you level up!',
    options: [
      { emoji: '🙋‍♂️', text: 'Male' },
      { emoji: '🙋‍♀️', text: 'Female' },
    ],
  },
  {
    question: "What brings you here? 💭",
    subtitle: 'No wrong answers — we just wanna know you!',
    options: [
      { emoji: '📱', text: 'Less doomscrolling' },
      { emoji: '💪', text: 'Build a sweat habit' },
      { emoji: '⚖️', text: 'Both, honestly!' },
    ],
  },
  {
    question: 'How active are you rn? 🤔',
    subtitle: "Be honest — we won't judge (much)",
    options: [
      { emoji: '🛋️', text: 'Total couch potato' },
      { emoji: '🚶', text: 'Moving 1-2 days/week' },
      { emoji: '🏃', text: 'Solid 3-4 days/week' },
      { emoji: '⚡', text: 'Beast mode 5+ days' },
    ],
  },
  {
    question: 'How much scroll time to earn? 📱',
    subtitle: "Gotta sweat for every minute!",
    options: [
      { emoji: '⏰', text: '15 minutes' },
      { emoji: '⏱️', text: '30 minutes' },
      { emoji: '🕐', text: '45 minutes' },
      { emoji: '🕒', text: '60 minutes (the max!)' },
    ],
  },
];

export default function OnboardingScreen() {
  const { dispatch } = useContext(AppContext);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({});

  // ─── WELCOME SPLASH ───
  if (showWelcome) {
    return (
      <div style={welcomeStyles.screen}>
        <div style={welcomeStyles.glow} />
        <div style={welcomeStyles.content}>
          {/* Logo */}
          <div style={welcomeStyles.logoIcon}>{'💪'}</div>
          <div style={welcomeStyles.logo}>SWEATNSCROLL</div>
          <div style={welcomeStyles.tagline}>Sweat first. Scroll later. ✨</div>

          {/* Description */}
          <div style={welcomeStyles.descCard}>
            <div style={welcomeStyles.descText}>
              Do a quick workout, earn your phone time. Our AI checks your form so you can't fake it — but you totally got this! 💪
            </div>
          </div>

          {/* Feature pills */}
          <div style={welcomeStyles.features}>
            <div style={welcomeStyles.featurePill}>{'📷'} AI form checks</div>
            <div style={welcomeStyles.featurePill}>{'🔥'} Streaks</div>
            <div style={welcomeStyles.featurePill}>{'🏆'} Leaderboards</div>
            <div style={welcomeStyles.featurePill}>{'⏱️'} Earn scroll time</div>
          </div>

          <Button onClick={() => setShowWelcome(false)}>
            Let's Go! ✨
          </Button>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING STEPS ───
  const step = steps[currentStep];

  const handleSelect = (optionText) => {
    setSelections(prev => ({ ...prev, [currentStep]: optionText }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      dispatch({ type: 'COMPLETE_ONBOARDING', payload: selections });
    }
  };

  return (
    <div style={styles.screen}>
      <div style={styles.content}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < currentStep ? '#2ECC71' : i === currentStep ? '#E8533A' : 'rgba(255,255,255,0.15)',
              boxShadow: i === currentStep ? '0 0 8px #E8533A' : 'none',
            }} />
          ))}
        </div>

        {/* Question */}
        <div style={styles.question}>{step.question}</div>
        <div style={styles.subtitle}>{step.subtitle}</div>

        {/* Avatar preview on gender step */}
        {currentStep === 0 && selections[0] && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '12px 0 8px' }}>
            <LevelAvatar
              level={1}
              gender={selections[0] === 'Male' ? 'male' : 'female'}
              size={100}
            />
          </div>
        )}

        {/* Options */}
        {step.options.map((option, i) => {
          const selected = selections[currentStep] === option.text;
          return (
            <button key={`${currentStep}-${i}`} onClick={() => handleSelect(option.text)} style={{
              ...styles.optionBtn,
              background: selected ? 'rgba(232,83,58,0.12)' : 'rgba(255,255,255,0.04)',
              borderColor: selected ? 'rgba(232,83,58,0.4)' : 'rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: 20 }}>{option.emoji}</span>
              <span style={styles.optionText}>{option.text}</span>
              {selected && (
                <div style={styles.optionCheck}>{'✓'}</div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <Button onClick={handleNext} disabled={!selections[currentStep]}>
          {currentStep < steps.length - 1 ? 'Continue →' : "Let's Go →"}
        </Button>
      </div>
    </div>
  );
}

// ─── WELCOME SPLASH STYLES ───
const welcomeStyles = {
  screen: {
    background: '#0F1647',
    minHeight: '100%',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 400,
    height: 400,
    background: 'radial-gradient(circle, rgba(232,83,58,0.25) 0%, transparent 70%)',
    top: '15%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  content: {
    padding: '60px 24px 80px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 56,
    letterSpacing: 6,
    color: '#E8533A',
    lineHeight: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9AA0B8',
    marginBottom: 32,
    fontWeight: 500,
  },
  descCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 24,
    padding: '18px 20px',
    marginBottom: 24,
    textAlign: 'center',
  },
  descText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: 'rgba(244,241,235,0.8)',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
  },
  featurePill: {
    background: 'rgba(232,83,58,0.08)',
    border: '1px solid rgba(232,83,58,0.2)',
    borderRadius: 24,
    padding: '6px 14px',
    fontSize: 12,
    color: '#F4F1EB',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
};

// ─── ONBOARDING STEPS STYLES ───
const styles = {
  screen: {
    background: 'radial-gradient(ellipse at 50% 0%, rgba(232,83,58,0.15) 0%, #0F1647 50%)',
    minHeight: '100%',
    padding: '40px 0 100px',
  },
  content: {
    padding: '20px 24px 0',
  },
  question: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 26,
    letterSpacing: 0.5,
    color: '#F4F1EB',
    lineHeight: 1.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#9AA0B8',
    marginBottom: 20,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '14px 16px',
    marginBottom: 10,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    color: '#F4F1EB',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  },
  optionSelected: {
    /* now applied inline for reliable toggling */
  },
  optionText: {
    fontSize: 14,
    fontWeight: 500,
    flex: 1,
  },
  optionCheck: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#E8533A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    color: 'white',
  },
};
