# FitLock PWA — Getting Started

## What's in this project

A complete React PWA scaffold for FitLock, matching your UI prototype with:

- **8 screens**: Earn, Summary, Level Up, Onboarding, Disclaimer, Progress, Ranks, Settings
- **Camera AI**: TensorFlow.js MoveNet integration for push-up, squat, and plank verification
- **Design system**: Exact colors, fonts, and component styles from your prototype
- **State management**: React Context with localStorage persistence
- **Effort bar logic**: Earning rates, daily cap (60 min), no carryover
- **Gamification**: 10 levels with lore, XP system, leaderboard
- **Exercise library**: 3 free + 12 standard exercises defined (expandable to 68)
- **PWA config**: Manifest, service worker, offline caching, iOS meta tags

## Quick Start (Local)

```bash
cd fitlock-pwa
npm install
npm run dev
```

Opens at `http://localhost:5173`. Use Chrome DevTools mobile view (iPhone 14 Pro recommended).

## Deploy to Vercel (Free)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com), sign in with GitHub
3. Import your repo — Vercel auto-detects Vite
4. Click Deploy — done! You get a `.vercel.app` URL

## Deploy to Netlify (Free)

```bash
npm run build
# Upload the `dist/` folder to netlify.com/drop
```

## Using with Base44

Base44 generates apps from prompts — it doesn't accept file uploads directly. Here's how to use both:

1. **Paste your Base44 prompt** (from the .docx) into Base44 to generate the initial app
2. **Use this codebase as a reference** — when Base44 generates something that doesn't match your vision, you can point to specific files here and ask it to match the implementation
3. **Copy specific components** — if Base44 struggles with the camera AI or effort bar, paste the relevant code from `src/services/` or `src/components/`

## Project Structure

```
fitlock-pwa/
├── index.html              # Entry point with PWA meta tags
├── package.json            # Dependencies
├── vite.config.js          # Build config + PWA plugin
├── src/
│   ├── main.jsx            # React root
│   ├── App.jsx             # Router + screen flow logic
│   ├── AppContext.jsx       # State management (effort bar, XP, settings)
│   ├── theme/tokens.js     # Design system colors, fonts, earning rates
│   ├── styles/global.css   # Global styles, animations, app shell
│   ├── components/         # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── EffortBar.jsx       # Circular SVG progress ring
│   │   ├── ExerciseCard.jsx
│   │   ├── FormIndicator.jsx   # Green/amber/red form quality pill
│   │   ├── InstructionPopup.jsx# Exercise info bottom sheet
│   │   ├── LevelBadge.jsx
│   │   └── NavBar.jsx          # Bottom tab navigation
│   ├── screens/            # Full-page screen components
│   │   ├── EarnScreen.jsx      # Main screen with effort bar
│   │   ├── CameraScreen.jsx    # Live camera with pose detection
│   │   ├── SummaryScreen.jsx   # Post-session stats
│   │   ├── LevelUpScreen.jsx   # Level up celebration
│   │   ├── OnboardingScreen.jsx# 3-step onboarding flow
│   │   ├── DisclaimerScreen.jsx# Legal/safety acceptance
│   │   ├── ProgressScreen.jsx  # Stats, XP bar, weekly chart
│   │   ├── RanksScreen.jsx     # Leaderboard with podium
│   │   └── SettingsScreen.jsx  # Toggles, tier, honor system message
│   ├── services/           # Business logic
│   │   ├── poseDetection.js    # TensorFlow.js MoveNet wrapper
│   │   └── exerciseVerifier.js # Exercise-specific form rules
│   └── data/               # Static data
│       ├── exercises.js    # Exercise library with AI thresholds
│       └── levels.js       # 10 gamification levels with lore
└── public/
    └── icons/              # Add your app icons here (192, 512, 180px)
```

## What to Build Next

1. **App icons** — Create 192x192, 512x512, and 180x180 PNG icons and put them in `public/icons/`
2. **Stripe integration** — Add a pricing screen with Stripe Checkout for $10/mo, $29/yr, $75 lifetime
3. **Push notifications** — Use the Push API for "time's up" and daily reminders
4. **More exercises** — Expand the 15 exercises in `exercises.js` to all 68 from your spec
5. **Backend** — Add a simple backend (Supabase, Firebase, or similar) for leaderboards and user accounts
6. **Audio coaching** — Wire up Web Speech API in `CameraScreen.jsx` for voice cues

## Path to the App Store

PWA → App Store path:
1. **Start here** — deploy the PWA, test with real users
2. **Capacitor** — wrap the PWA in [Capacitor](https://capacitorjs.com/) to create a native iOS/Android app from the same codebase
3. **Submit** — Capacitor apps can be submitted to the App Store and Google Play
4. This lets you ship a PWA today and get to the App Store without rewriting anything
