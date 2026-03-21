import React, { useState, useContext } from 'react';
import Button from '../components/Button';
import { AppContext } from '../AppContext';

const disclaimerItems = [
  'Consult a physician before starting any new exercise program, especially if you have any pre-existing medical conditions.',
  'Stop immediately if you experience pain, dizziness, shortness of breath, or discomfort of any kind.',
  'AI form verification is a guide only — it is not a substitute for a qualified personal trainer.',
];

export default function DisclaimerScreen() {
  const { dispatch } = useContext(AppContext);
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.shieldIcon}>{'🛡️'}</div>
        <div style={styles.title}>Safety First</div>
        <div style={styles.sub}>Please read before you begin</div>
      </div>

      {/* Disclaimer body */}
      <div style={styles.body}>
        {disclaimerItems.map((item, i) => (
          <div key={i} style={styles.item}>
            <span style={styles.bullet}>{'→'}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {/* Checkbox */}
      <div style={styles.checkboxRow} onClick={() => setAgreed(!agreed)}>
        <div style={{
          ...styles.checkbox,
          background: agreed ? '#E8533A' : 'transparent',
        }}>
          {agreed && '✓'}
        </div>
        <div style={styles.checkboxText}>
          I have read and agree to the safety disclaimer. I confirm I am physically able to exercise and will stop immediately if I feel unwell.
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 16 }}>
        <Button onClick={() => dispatch({ type: 'ACCEPT_DISCLAIMER' })} disabled={!agreed}>
          I Agree — Let's Begin
        </Button>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    background: 'linear-gradient(180deg, #0A1034 0%, #080D2E 100%)',
    minHeight: '100%',
    padding: '40px 0 100px',
  },
  header: {
    padding: '12px 24px 0',
    textAlign: 'center',
  },
  shieldIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 28,
    letterSpacing: 1,
    color: '#F4F1EB',
    marginBottom: 6,
  },
  sub: {
    fontSize: 12,
    color: '#9AA0B8',
  },
  body: {
    margin: '20px 20px 0',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  item: {
    display: 'flex',
    gap: 10,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 1.6,
    color: 'rgba(244,241,235,0.75)',
  },
  bullet: {
    color: '#E8533A',
    flexShrink: 0,
    marginTop: 1,
    fontSize: 14,
  },
  checkboxRow: {
    margin: '16px 20px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    background: 'rgba(232,83,58,0.06)',
    border: '1px solid rgba(232,83,58,0.2)',
    borderRadius: 12,
    padding: 14,
    cursor: 'pointer',
  },
  checkbox: {
    width: 22,
    height: 22,
    border: '2px solid #E8533A',
    borderRadius: 6,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    color: 'white',
    transition: 'background 0.2s',
  },
  checkboxText: {
    fontSize: 12,
    lineHeight: 1.5,
    color: 'rgba(244,241,235,0.85)',
  },
};
