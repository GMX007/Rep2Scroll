import React, { useState, useContext } from 'react';
import Button from '../components/Button';
import { AppContext } from '../AppContext';

const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$10',
    period: '/month',
    description: 'Full access, cancel anytime',
    badge: null,
    // Replace with your actual Stripe Payment Link
    stripeUrl: 'https://buy.stripe.com/YOUR_MONTHLY_LINK',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$29',
    period: '/year',
    description: 'Best value — save 76%',
    badge: 'SAVE 76%',
    stripeUrl: 'https://buy.stripe.com/YOUR_ANNUAL_LINK',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$75',
    period: 'one-time',
    description: 'Pay once, own it forever',
    badge: 'BEST DEAL',
    stripeUrl: 'https://buy.stripe.com/YOUR_LIFETIME_LINK',
  },
];

const standardFeatures = [
  { emoji: '🏋️', text: 'Full library of 68+ exercises' },
  { emoji: '🎯', text: 'Body area & equipment filters' },
  { emoji: '📈', text: 'Progressive overload tracking' },
  { emoji: '🔄', text: 'Form correction & variation suggestions' },
  { emoji: '⭐', text: 'Favorite exercises' },
  { emoji: '🏆', text: 'Full gamification (levels 1-10)' },
  { emoji: '📊', text: 'All leaderboard categories' },
];

export default function PricingScreen({ onClose }) {
  const { state, dispatch } = useContext(AppContext);
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const handlePurchase = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan?.stripeUrl && !plan.stripeUrl.includes('YOUR_')) {
      // Open Stripe Checkout in a new tab
      window.open(plan.stripeUrl, '_blank');
    } else {
      // Demo mode — simulate upgrade
      dispatch({ type: 'SET_TIER', payload: 'standard' });
      onClose?.();
    }
  };

  if (state.tier === 'standard') {
    return (
      <div style={styles.screen}>
        <button onClick={onClose} style={styles.closeBtn}>{'✕'}</button>
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'✅'}</div>
          <div style={styles.title}>You're on Standard</div>
          <div style={styles.sub}>You have full access to everything SweatNScroll offers.</div>
          <div style={{ marginTop: 24 }}>
            <Button onClick={onClose}>Back to Settings</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.screen}>
      <button onClick={onClose} style={styles.closeBtn}>{'✕'}</button>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>SWEATNSCROLL</div>
        <div style={styles.tierLabel}>STANDARD</div>
        <div style={styles.title}>Unlock Everything</div>
        <div style={styles.sub}>68 exercises. Full AI coaching. All 10 levels.</div>
      </div>

      {/* Features */}
      <div style={styles.featuresCard}>
        {standardFeatures.map((f, i) => (
          <div key={i} style={styles.featureRow}>
            <span style={{ fontSize: 16 }}>{f.emoji}</span>
            <span style={styles.featureText}>{f.text}</span>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div style={styles.plansRow}>
        {plans.map(plan => {
          const selected = selectedPlan === plan.id;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                ...styles.planCard,
                ...(selected ? styles.planSelected : {}),
              }}
            >
              {plan.badge && (
                <div style={styles.planBadge}>{plan.badge}</div>
              )}
              <div style={styles.planName}>{plan.name}</div>
              <div style={styles.planPrice}>{plan.price}</div>
              <div style={styles.planPeriod}>{plan.period}</div>
              {selected && <div style={styles.planCheck}>{'✓'}</div>}
            </button>
          );
        })}
      </div>

      {/* Lifetime disclaimer */}
      <div style={styles.disclaimer}>
        Lifetime access covers Standard tier only and does not include any future Premium tier.
      </div>

      {/* CTA */}
      <div style={{ marginTop: 16 }}>
        <Button onClick={handlePurchase}>
          {plans.find(p => p.id === selectedPlan)?.stripeUrl?.includes('YOUR_')
            ? 'Upgrade Now (Demo)'
            : `Subscribe — ${plans.find(p => p.id === selectedPlan)?.price}`
          }
        </Button>
      </div>

      <button onClick={onClose} style={styles.maybeLater}>
        Maybe Later
      </button>
    </div>
  );
}

const styles = {
  screen: {
    background: 'linear-gradient(180deg, #152058 0%, #0F1647 100%)',
    minHeight: '100%',
    padding: '16px 0 40px',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    color: '#9AA0B8',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
    padding: '20px 24px 0',
  },
  logo: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 16,
    letterSpacing: 3,
    color: '#E8533A',
    marginBottom: 4,
  },
  tierLabel: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 11,
    letterSpacing: 3,
    color: '#F0A500',
    marginBottom: 12,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 1,
    color: '#F4F1EB',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#9AA0B8',
    marginBottom: 20,
  },
  featuresCard: {
    margin: '0 20px 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '12px 16px',
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  featureText: {
    fontSize: 13,
    color: 'rgba(244,241,235,0.85)',
  },
  plansRow: {
    display: 'flex',
    gap: 10,
    padding: '0 20px',
    justifyContent: 'center',
  },
  planCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: '16px 8px 14px',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  },
  planSelected: {
    background: 'rgba(232,83,58,0.1)',
    borderColor: '#E8533A',
    boxShadow: '0 0 20px rgba(232,83,58,0.2)',
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'linear-gradient(135deg, #F0A500, #E8533A)',
    color: 'white',
    fontSize: 8,
    fontWeight: 800,
    letterSpacing: 1,
    padding: '2px 8px',
    borderRadius: 10,
    whiteSpace: 'nowrap',
  },
  planName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9AA0B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  planPrice: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    color: '#F4F1EB',
    lineHeight: 1,
  },
  planPeriod: {
    fontSize: 10,
    color: '#9AA0B8',
    marginTop: 2,
  },
  planCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#E8533A',
    color: 'white',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    margin: '12px 20px 0',
    fontSize: 11,
    color: '#9AA0B8',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  maybeLater: {
    display: 'block',
    margin: '16px auto 0',
    background: 'transparent',
    border: 'none',
    color: '#9AA0B8',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    textDecoration: 'underline',
  },
};
