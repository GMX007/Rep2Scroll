/**
 * FitLock Gamification Levels
 * Free tier: levels 1-3 only
 * Standard tier: levels 1-10
 */

export const levels = [
  {
    level: 1,
    name: 'ROOKIE',
    emoji: '🌱',
    tier: 'free',
    xpRequired: 0,
    lore: "Everyone starts somewhere. You've chosen to start here — that already puts you ahead of everyone still on the couch.",
    unlocks: ['3 free exercises', 'Basic form tracking'],
  },
  {
    level: 2,
    name: 'STARTER',
    emoji: '🔥',
    tier: 'free',
    xpRequired: 200,
    lore: "The hardest part is showing up. You've shown up more than once. Your body is waking up, and your discipline is starting to sharpen.",
    unlocks: ['Streak tracking', 'Session history'],
  },
  {
    level: 3,
    name: 'MOVER',
    emoji: '⚡',
    tier: 'free',
    xpRequired: 500,
    lore: "Movement is becoming a habit. You're building something bigger than reps — you're building a version of yourself that follows through.",
    unlocks: ['Leaderboard access', 'Form score history'],
  },
  {
    level: 4,
    name: 'GRINDER',
    emoji: '🏋️',
    tier: 'standard',
    xpRequired: 1000,
    lore: "The couch is a distant memory now. Your body is starting to remember what it was built for. People are beginning to notice — though they can't quite say why.",
    unlocks: ['Body area selection', 'Progressive overload', 'Equipment exercises'],
  },
  {
    level: 5,
    name: 'FORGED',
    emoji: '🔨',
    tier: 'standard',
    xpRequired: 2000,
    lore: "You've been through the fire. What used to feel impossible is now your warm-up. The discipline you've built here is bleeding into everything else.",
    unlocks: ['Advanced exercises', 'Custom targets'],
  },
  {
    level: 6,
    name: 'WARRIOR',
    emoji: '⚔️',
    tier: 'standard',
    xpRequired: 3500,
    lore: "Every battle with the bar has been won. You don't negotiate with laziness anymore. You simply don't lose.",
    unlocks: ['Warrior badge', 'Extended session options'],
  },
  {
    level: 7,
    name: 'TITAN',
    emoji: '🏛️',
    tier: 'standard',
    xpRequired: 5500,
    lore: "Titans hold up the sky. You've been holding up your own world — reps at a time. Lesser mortals scroll endlessly. You earn your time.",
    unlocks: ['Titan challenges', 'Weekly reports'],
  },
  {
    level: 8,
    name: 'LEGEND',
    emoji: '👑',
    tier: 'standard',
    xpRequired: 8000,
    lore: "Legends aren't born. They're forged in sweat and silence while everyone else sleeps. You are proof that small choices compound into something extraordinary.",
    unlocks: ['Legend badge', 'Unlimited favorites'],
  },
  {
    level: 9,
    name: 'IMMORTAL',
    emoji: '🌟',
    tier: 'standard',
    xpRequired: 12000,
    lore: "Your body is a monument to what happens when someone refuses to quit. The version of you that started FitLock wouldn't recognize what you've become.",
    unlocks: ['Immortal badge', 'Exclusive exercises'],
  },
  {
    level: 10,
    name: 'MACHINE',
    emoji: '🤖',
    tier: 'standard',
    xpRequired: 20000,
    lore: "You've reached the summit. Not because it was easy — but because you decided that easy wasn't enough. You are the machine. No app controls you. You control yourself.",
    unlocks: ['Machine badge', 'Leaderboard crown'],
  },
];

export function getLevelForXP(xp) {
  let current = levels[0];
  for (const level of levels) {
    if (xp >= level.xpRequired) current = level;
    else break;
  }
  return current;
}

export function getNextLevel(currentLevel) {
  const idx = levels.findIndex(l => l.level === currentLevel);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

export function getXPProgress(xp) {
  const current = getLevelForXP(xp);
  const next = getNextLevel(current.level);
  if (!next) return { current, next: null, progress: 1 };
  const needed = next.xpRequired - current.xpRequired;
  const earned = xp - current.xpRequired;
  return { current, next, progress: Math.min(earned / needed, 1) };
}
