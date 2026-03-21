import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { getLevelForXP } from '../data/levels';

// Simulated leaderboard data — in production this comes from a backend.
// Each user has allTimeReps and weeklyReps so tabs can filter/sort differently.
const simulatedUsers = [
  { name: 'IronMike', xp: 20000, allTimeReps: 14520, weeklyReps: 310, streak: 89, isFriend: false },
  { name: 'SweatQueen', xp: 12000, allTimeReps: 12340, weeklyReps: 420, streak: 72, isFriend: true },
  { name: 'RepKing', xp: 8000, allTimeReps: 10890, weeklyReps: 280, streak: 61, isFriend: false },
  { name: 'CoreCrusher', xp: 5500, allTimeReps: 9200, weeklyReps: 195, streak: 54, isFriend: true },
  { name: 'PlankMaster', xp: 3500, allTimeReps: 7600, weeklyReps: 350, streak: 45, isFriend: false },
  { name: 'GainzGuru', xp: 2000, allTimeReps: 6100, weeklyReps: 150, streak: 38, isFriend: true },
  { name: 'PushPro', xp: 1000, allTimeReps: 4800, weeklyReps: 220, streak: 29, isFriend: false },
  { name: 'SquatStar', xp: 1000, allTimeReps: 3950, weeklyReps: 180, streak: 22, isFriend: false },
];

const TABS = ['All Time', 'This Week', 'Friends'];

export default function RanksScreen() {
  const { state } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState(0);

  // Build ranked list based on active tab
  const rankedList = useMemo(() => {
    let pool = [...simulatedUsers];

    // Add "You" to the pool
    const userLevel = getLevelForXP(state.xp);
    const you = {
      name: 'You',
      xp: state.xp,
      allTimeReps: state.totalReps,
      weeklyReps: state.totalReps, // approximation — proper implementation tracks weekly
      streak: state.streak,
      isFriend: true, // you always appear in friends
      isYou: true,
    };
    pool.push(you);

    // Filter for Friends tab
    if (activeTab === 2) {
      pool = pool.filter(u => u.isFriend || u.isYou);
    }

    // Sort by the right metric
    const sortKey = activeTab === 1 ? 'weeklyReps' : 'allTimeReps';
    pool.sort((a, b) => b[sortKey] - a[sortKey]);

    // Assign ranks and add level info
    return pool.map((user, i) => ({
      ...user,
      rank: i + 1,
      level: getLevelForXP(user.xp),
      displayReps: activeTab === 1 ? user.weeklyReps : user.allTimeReps,
    }));
  }, [activeTab, state.xp, state.totalReps, state.streak]);

  const top3 = rankedList.slice(0, 3);
  const rest = rankedList.slice(3);

  // Find user's entry if not in top list shown
  const userInList = rankedList.find(u => u.isYou);
  const userInRest = rest.find(u => u.isYou);

  return (
    <div style={styles.screen}>
      <div style={styles.title}>Leaderboard</div>

      {/* Category tabs */}
      <div style={styles.tabs}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              ...styles.tab,
              ...(i === activeTab ? styles.tabActive : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 podium — show as [2nd, 1st, 3rd] */}
      {top3.length >= 3 && (
        <div style={styles.podium}>
          {[1, 0, 2].map(idx => {
            const entry = top3[idx];
            const isFirst = idx === 0;
            return (
              <div key={idx} style={{ ...styles.podiumItem, ...(isFirst ? styles.podiumFirst : {}) }}>
                <div style={{
                  ...styles.podiumAvatar,
                  width: isFirst ? 64 : 48,
                  height: isFirst ? 64 : 48,
                  fontSize: isFirst ? 32 : 24,
                  border: isFirst ? '2px solid #F0A500' : '1px solid rgba(255,255,255,0.15)',
                  ...(entry.isYou ? { boxShadow: '0 0 12px rgba(232,83,58,0.4)' } : {}),
                }}>
                  {entry.level.emoji}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600, marginTop: 6,
                  color: entry.isYou ? '#E8533A' : '#F4F1EB',
                }}>
                  {entry.name}
                </div>
                <div style={{ fontSize: 10, color: '#F0A500' }}>{entry.displayReps} reps</div>
                <div style={{
                  ...styles.rankBadge,
                  background: entry.rank === 1 ? 'rgba(240,165,0,0.2)' : 'rgba(255,255,255,0.08)',
                  color: entry.rank === 1 ? '#F0A500' : '#9AA0B8',
                }}>
                  #{entry.rank}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div style={styles.list}>
        {rest.map(entry => (
          <div key={entry.name} style={{
            ...styles.listItem,
            ...(entry.isYou ? { background: 'rgba(232,83,58,0.08)', border: '1px solid rgba(232,83,58,0.2)' } : {}),
          }}>
            <div style={{ ...styles.listRank, color: entry.isYou ? '#E8533A' : '#9AA0B8' }}>#{entry.rank}</div>
            <div style={styles.listAvatar}>{entry.level.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: entry.isYou ? '#E8533A' : '#F4F1EB' }}>
                {entry.name}
              </div>
              <div style={{ fontSize: 11, color: '#9AA0B8' }}>
                {entry.level.name} &middot; {'🔥'}{entry.streak} streak
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: '#E8533A' }}>
                {entry.displayReps}
              </div>
              <div style={{ fontSize: 9, color: '#9AA0B8', textTransform: 'uppercase' }}>reps</div>
            </div>
          </div>
        ))}

        {/* If user didn't appear in the visible list (in top 3 podium only), show them pinned at bottom */}
        {userInList && !userInRest && userInList.rank <= 3 && (
          <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: '#2ECC71' }}>
            You're in the top 3! {'🏆'}
          </div>
        )}
      </div>

      {/* Empty state for Friends tab */}
      {activeTab === 2 && rankedList.length <= 1 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{'👥'}</div>
          <div style={{ fontSize: 14, color: '#9AA0B8' }}>
            No friends yet. Share FitLock to compete with friends!
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  screen: {
    background: '#0D0D14',
    minHeight: '100%',
    padding: '16px 0 100px',
  },
  title: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 32,
    letterSpacing: 1,
    color: '#F4F1EB',
    padding: '8px 24px 16px',
  },
  tabs: {
    display: 'flex',
    gap: 8,
    padding: '0 20px 16px',
  },
  tab: {
    padding: '8px 16px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#9AA0B8',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'rgba(232,83,58,0.12)',
    borderColor: 'rgba(232,83,58,0.3)',
    color: '#E8533A',
  },
  podium: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
    padding: '0 20px 24px',
  },
  podiumItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  podiumFirst: {
    order: 0,
  },
  podiumAvatar: {
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    marginTop: 4,
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 10,
    fontWeight: 700,
  },
  list: {
    padding: '0 20px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    marginBottom: 8,
  },
  listRank: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 18,
    color: '#9AA0B8',
    width: 32,
    textAlign: 'center',
  },
  listAvatar: {
    fontSize: 24,
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
