import React from 'react';

/**
 * Reusable legal/info screen for Privacy Policy and Terms of Service.
 * Pass `type` as "privacy" or "terms".
 */
export default function LegalScreen({ type = 'privacy', onClose }) {
  const isPrivacy = type === 'privacy';

  return (
    <div style={styles.screen}>
      <button onClick={onClose} style={styles.closeBtn}>&larr; Back</button>

      <div style={styles.title}>
        {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
      </div>
      <div style={styles.updated}>
        Last updated: March 2026
      </div>

      <div style={styles.body}>
        {isPrivacy ? (
          <>
            <Section title="What We Collect">
              Rep2Scroll stores your exercise data (reps completed, form scores, session history, XP, and level progress) locally on your device using browser storage. If you create an account, basic profile information (email, display name) is stored on our servers to enable leaderboard features.
            </Section>

            <Section title="Camera & Video Data">
              Rep2Scroll uses your device camera to verify exercise form in real time using TensorFlow.js MoveNet. All pose detection processing happens entirely on your device. No video or image data is ever recorded, stored, transmitted, or sent to any server. We never have access to your camera feed.
            </Section>

            <Section title="What We Don't Collect">
              We do not collect health data, biometric data, location data, contacts, browsing history, or any data from other apps on your device. We do not sell, share, or monetize your personal data in any way.
            </Section>

            <Section title="Payment Data">
              Payments are processed by Stripe. Rep2Scroll never sees or stores your credit card number, CVV, or banking details. Stripe's privacy policy governs payment data handling.
            </Section>

            <Section title="Analytics">
              We collect anonymous, aggregated usage statistics (e.g., most popular exercises, average session length) to improve the app. This data cannot be linked to individual users.
            </Section>

            <Section title="Data Deletion">
              You can delete all your local data at any time by clearing your browser's site data for Rep2Scroll. To delete your account and server-side data, contact support and we will remove everything within 30 days.
            </Section>

          </>
        ) : (
          <>
            <Section title="Acceptance">
              By using Rep2Scroll, you agree to these Terms of Service. If you do not agree, do not use the app.
            </Section>

            <Section title="What Rep2Scroll Is">
              Rep2Scroll is a fitness motivation app that uses AI-assisted exercise form verification. It is not a medical device, personal trainer, or healthcare provider. The AI provides guidance but may not catch all form issues.
            </Section>

            <Section title="Exercise Risk">
              Exercise carries inherent risk of injury. You are solely responsible for your own safety. Consult a healthcare provider before starting any exercise program. Stop immediately if you experience pain or discomfort. Rep2Scroll is not liable for any injuries sustained while using the app.
            </Section>

            <Section title="Honor System">
              Rep2Scroll operates on the honor system for social media time management. The app provides timers and reminders but cannot enforce screen time limits at the operating system level. The discipline is yours.
            </Section>

            <Section title="Subscriptions">
              Standard tier subscriptions are billed through Stripe. Monthly and annual plans auto-renew until cancelled. You can cancel anytime from your Stripe customer portal. Lifetime access covers the Standard tier only and does not include any future Premium tier features.
            </Section>

            <Section title="Account Termination">
              We reserve the right to suspend accounts that abuse the leaderboard system or violate community standards. You may delete your account at any time.
            </Section>

            <Section title="Changes">
              We may update these terms. Continued use after changes constitutes acceptance. We will notify users of material changes via the app.
            </Section>

            <Section title="Contact">
              Questions? Reach us at legal@sweatnscroll.app
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>{title}</div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

const styles = {
  screen: {
    background: '#0F1647',
    minHeight: '100%',
    padding: '16px 0 100px',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#E8533A',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 24px',
    fontFamily: "'DM Sans', sans-serif",
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 1,
    color: '#F4F1EB',
    padding: '8px 24px 4px',
  },
  updated: {
    fontSize: 11,
    color: '#9AA0B8',
    padding: '0 24px 20px',
  },
  body: {
    padding: '0 20px',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#F4F1EB',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionBody: {
    fontSize: 13,
    lineHeight: 1.7,
    color: 'rgba(244,241,235,0.7)',
  },
};
