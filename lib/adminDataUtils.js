// ============================================================
// Prisdil+ Admin Data Utilities
// All data reading, aggregation, and CSV generation functions
// ============================================================

// ─── Data Reading ───────────────────────────────────────────

/**
 * Safely read data from localStorage with error handling
 */
export function readLocalStorageData() {
  if (typeof window === 'undefined') return { leaderboard: {}, sessions: [], identity: null };

  try {
    const leaderboardRaw = localStorage.getItem('prisdilplus_human_leaderboard') ||
      localStorage.getItem('prisdilplusHumanLeaderboard');
    const sessionsRaw = localStorage.getItem('prisdilplus_game_sessions');
    const identityRaw = localStorage.getItem('prisdilplus_user_identity');

    const leaderboard = leaderboardRaw ? JSON.parse(leaderboardRaw) : {};
    const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
    const identity = identityRaw ? JSON.parse(identityRaw) : null;

    return { leaderboard, sessions, identity };
  } catch (error) {
    console.error('Error reading admin data:', error);
    return { leaderboard: {}, sessions: [], identity: null };
  }
}

// ─── Profile Classification ─────────────────────────────────

function classifyBehaviouralProfile(metrics) {
  const { cooperationRate, defectionRate, retaliationScore, forgivenessScore, pushOverIndex, opportunismScore } = metrics;

  if (cooperationRate > 0.6 && retaliationScore > 0.5 && forgivenessScore > 0.5) {
    return 'Strategic Diplomat';
  }
  if (cooperationRate > 0.75 && (pushOverIndex > 0.6 || retaliationScore < 0.3)) {
    return 'Highly Trusting';
  }
  if (defectionRate > 0.6 && opportunismScore > 0.5) {
    return 'Competitive Strategist';
  }
  if (defectionRate > 0.6 && retaliationScore > 0.7) {
    return 'Defensive Player';
  }
  if (defectionRate > 0.8) {
    return 'Relentless Competitor';
  }
  if (cooperationRate > 0.8) {
    return 'Peaceful Cooperator';
  }
  return 'Adaptive Strategist';
}

// ─── Player Helpers ─────────────────────────────────────────

function computePlayerMetrics(player) {
  const cooperationRate = player.totalMoves > 0 ? player.totalCooperateMoves / player.totalMoves : 0;
  const defectionRate = player.totalMoves > 0 ? player.totalDefectMoves / player.totalMoves : 0;
  const nicenessScore = cooperationRate; // approximation from aggregate data
  const retaliationScore = player.totalBetrayalsFaced > 0 ? player.totalRetaliations / player.totalBetrayalsFaced : 0;
  const forgivenessScore = player.totalRetaliationSequences > 0 ? player.totalForgivenessEvents / player.totalRetaliationSequences : 0;
  const pushOverIndex = player.totalOpponentDefections > 0 ? player.totalCooperationsAfterOpponentDefect / player.totalOpponentDefections : 0;
  const opportunismScore = player.totalDefections > 0 ? player.totalDefectionsAfterOpponentCoop / player.totalDefections : 0;
  const consistencyScore = player.totalRoundsPlayed > 0 ? player.longestStreak / player.totalRoundsPlayed : 0;

  return {
    cooperationRate: r2(cooperationRate),
    defectionRate: r2(defectionRate),
    nicenessScore: r2(nicenessScore),
    retaliationScore: r2(retaliationScore),
    forgivenessScore: r2(forgivenessScore),
    pushOverIndex: r2(pushOverIndex),
    opportunismScore: r2(opportunismScore),
    consistencyScore: r2(consistencyScore),
  };
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

// ─── Get All Players ────────────────────────────────────────

export function getAllPlayers() {
  const { leaderboard, identity } = readLocalStorageData();
  return Object.values(leaderboard).map((player) => {
    const metrics = computePlayerMetrics(player);
    const behaviouralProfile = classifyBehaviouralProfile(metrics);
    const winRate = player.gamesPlayed > 0 ? (player.totalWins / player.gamesPlayed) * 100 : 0;

    return {
      ...player,
      ...metrics,
      winRate: r2(winRate),
      behaviouralProfile,
      deviceId: identity && identity.alias === player.alias ? identity.deviceId : (player.deviceId || ''),
      createdAt: identity && identity.alias === player.alias ? identity.createdAt : (player.createdAt || ''),
    };
  });
}

// ─── Get All Sessions ───────────────────────────────────────

export function getAllSessions() {
  const { sessions } = readLocalStorageData();
  return Array.isArray(sessions) ? sessions : [];
}

// ─── Overview Metrics ───────────────────────────────────────

export function getOverviewMetrics() {
  const players = getAllPlayers();
  const sessions = getAllSessions();

  const totalPlayers = players.length;
  const totalGames = sessions.length;
  const totalRounds = sessions.reduce((sum, s) => sum + (s.totalRounds || 0), 0);

  const avgCooperationRate = players.length > 0
    ? players.reduce((sum, p) => sum + p.cooperationRate, 0) / players.length
    : 0;

  const avgDefectionRate = players.length > 0
    ? players.reduce((sum, p) => sum + p.defectionRate, 0) / players.length
    : 0;

  // Most common behavioural profile
  const profileCounts = {};
  players.forEach(p => {
    profileCounts[p.behaviouralProfile] = (profileCounts[p.behaviouralProfile] || 0) + 1;
  });
  const mostCommonProfile = Object.keys(profileCounts).length > 0
    ? Object.keys(profileCounts).reduce((a, b) => profileCounts[a] > profileCounts[b] ? a : b)
    : 'N/A';

  // Most played mode
  const modeCounts = {};
  sessions.forEach(s => {
    modeCounts[s.gameMode] = (modeCounts[s.gameMode] || 0) + 1;
  });
  const mostPlayedMode = Object.keys(modeCounts).length > 0
    ? Object.keys(modeCounts).reduce((a, b) => modeCounts[a] > modeCounts[b] ? a : b)
    : 'N/A';

  // Most used AI strategy
  const strategyCounts = {};
  sessions.filter(s => s.gameMode === 'PvAI' && s.aiStrategy).forEach(s => {
    strategyCounts[s.aiStrategy] = (strategyCounts[s.aiStrategy] || 0) + 1;
  });
  const mostUsedStrategy = Object.keys(strategyCounts).length > 0
    ? Object.keys(strategyCounts).reduce((a, b) => strategyCounts[a] > strategyCounts[b] ? a : b)
    : 'N/A';

  return {
    totalPlayers,
    totalGames,
    totalRounds,
    avgCooperationRate,
    avgDefectionRate,
    mostCommonProfile,
    mostPlayedMode,
    mostUsedStrategy,
  };
}

// ─── Profile Distribution (for pie chart) ───────────────────

export function getProfileDistribution() {
  const players = getAllPlayers();
  const counts = {};
  players.forEach(p => {
    counts[p.behaviouralProfile] = (counts[p.behaviouralProfile] || 0) + 1;
  });
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

// ─── Cooperation Over Time (for line chart) ─────────────────

export function getCooperationOverTime() {
  const sessions = getAllSessions();
  if (sessions.length === 0) return [];

  // Sort sessions by timestamp
  const sorted = [...sessions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Group by date
  const byDate = {};
  sorted.forEach(s => {
    const date = new Date(s.timestamp).toLocaleDateString();
    if (!byDate[date]) byDate[date] = [];
    const metrics = s.playerMetrics;
    if (metrics) {
      byDate[date].push(metrics.cooperationRate || 0);
    }
  });

  return Object.entries(byDate).map(([date, rates]) => ({
    date,
    cooperationRate: r2(rates.reduce((a, b) => a + b, 0) / rates.length),
  }));
}

// ─── Round Analysis Functions ───────────────────────────────

export function getMoveFrequencies() {
  const sessions = getAllSessions();
  const counts = { CC: 0, CD: 0, DC: 0, DD: 0 };
  let total = 0;

  sessions.forEach(s => {
    if (!s.roundHistory) return;
    s.roundHistory.forEach(r => {
      const outcome = `${r.playerMove}${r.opponentMove}`;
      if (counts.hasOwnProperty(outcome)) {
        counts[outcome]++;
        total++;
      }
    });
  });

  return Object.entries(counts).map(([name, count]) => ({
    name,
    count,
    percentage: total > 0 ? r2((count / total) * 100) : 0,
  }));
}

export function getRoundPositionAnalysis() {
  const sessions = getAllSessions();
  const roundData = {}; // roundNumber -> [cooperated booleans]

  sessions.forEach(s => {
    if (!s.roundHistory) return;
    s.roundHistory.forEach(r => {
      const rn = r.round;
      if (!roundData[rn]) roundData[rn] = [];
      roundData[rn].push(r.playerMove === 'C' ? 1 : 0);
    });
  });

  return Object.entries(roundData)
    .map(([round, values]) => ({
      round: parseInt(round),
      cooperationRate: r2(values.reduce((a, b) => a + b, 0) / values.length),
      sampleSize: values.length,
    }))
    .sort((a, b) => a.round - b.round);
}

export function getFirstMoveAnalysis() {
  const sessions = getAllSessions();
  let cooperate = 0;
  let defect = 0;

  sessions.forEach(s => {
    if (!s.roundHistory || s.roundHistory.length === 0) return;
    const firstMove = s.roundHistory[0].playerMove;
    if (firstMove === 'C') cooperate++;
    else defect++;
  });

  return [
    { name: 'Cooperate', value: cooperate },
    { name: 'Defect', value: defect },
  ];
}

export function getRetaliationLatency() {
  const sessions = getAllSessions();
  const latencies = { '0': 0, '1': 0, '2': 0, '3+': 0 };

  sessions.forEach(s => {
    if (!s.roundHistory || s.roundHistory.length < 2) return;
    const rounds = s.roundHistory;

    for (let i = 0; i < rounds.length - 1; i++) {
      if (rounds[i].opponentMove === 'D' && rounds[i].playerMove === 'C') {
        // Player was defected against while cooperating — look for retaliation
        let found = false;
        for (let j = i + 1; j < rounds.length && j <= i + 3; j++) {
          if (rounds[j].playerMove === 'D') {
            const latency = j - i - 1;
            if (latency === 0) latencies['0']++;
            else if (latency === 1) latencies['1']++;
            else if (latency === 2) latencies['2']++;
            else latencies['3+']++;
            found = true;
            break;
          }
        }
        if (!found) latencies['3+']++;
      }
    }
  });

  return Object.entries(latencies).map(([name, value]) => ({
    name: `${name} round${name === '1' ? '' : 's'}`,
    value,
  }));
}

// ─── Behavioural Insights Functions ─────────────────────────

const METRIC_KEYS = [
  'cooperationRate', 'defectionRate', 'nicenessScore', 'retaliationScore',
  'forgivenessScore', 'pushOverIndex', 'opportunismScore', 'consistencyScore'
];

const METRIC_LABELS = {
  cooperationRate: 'Cooperation Rate',
  defectionRate: 'Defection Rate',
  nicenessScore: 'Niceness Score',
  retaliationScore: 'Retaliation Score',
  forgivenessScore: 'Forgiveness Score',
  pushOverIndex: 'Push-over Index',
  opportunismScore: 'Opportunism Score',
  consistencyScore: 'Consistency Score',
};

export { METRIC_KEYS, METRIC_LABELS };

export function getMetricsDistribution() {
  const players = getAllPlayers();
  const bins = ['0-0.2', '0.2-0.4', '0.4-0.6', '0.6-0.8', '0.8-1.0'];

  const distributions = {};
  METRIC_KEYS.forEach(key => {
    distributions[key] = bins.map(bin => ({ bin, count: 0 }));
  });

  players.forEach(p => {
    METRIC_KEYS.forEach(key => {
      const val = p[key] || 0;
      let binIdx;
      if (val <= 0.2) binIdx = 0;
      else if (val <= 0.4) binIdx = 1;
      else if (val <= 0.6) binIdx = 2;
      else if (val <= 0.8) binIdx = 3;
      else binIdx = 4;
      distributions[key][binIdx].count++;
    });
  });

  return distributions;
}

export function getCorrelationMatrix() {
  const players = getAllPlayers();
  if (players.length < 2) return { keys: METRIC_KEYS, matrix: [] };

  const matrix = [];
  for (let i = 0; i < METRIC_KEYS.length; i++) {
    const row = [];
    for (let j = 0; j < METRIC_KEYS.length; j++) {
      const x = players.map(p => p[METRIC_KEYS[i]] || 0);
      const y = players.map(p => p[METRIC_KEYS[j]] || 0);
      row.push(pearsonCorrelation(x, y));
    }
    matrix.push(row);
  }

  return { keys: METRIC_KEYS, matrix };
}

function pearsonCorrelation(x, y) {
  const n = x.length;
  if (n === 0) return 0;

  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;
  return r2(numerator / denom);
}

export function getProfileBreakdown() {
  const players = getAllPlayers();
  const groups = {};

  players.forEach(p => {
    const profile = p.behaviouralProfile;
    if (!groups[profile]) {
      groups[profile] = { count: 0, metrics: {}, badges: {} };
      METRIC_KEYS.forEach(k => groups[profile].metrics[k] = []);
    }
    groups[profile].count++;
    METRIC_KEYS.forEach(k => groups[profile].metrics[k].push(p[k] || 0));
    (p.badges || []).forEach(b => {
      groups[profile].badges[b] = (groups[profile].badges[b] || 0) + 1;
    });
  });

  return Object.entries(groups).map(([profile, data]) => {
    const avgMetrics = {};
    METRIC_KEYS.forEach(k => {
      const arr = data.metrics[k];
      avgMetrics[k] = arr.length > 0 ? r2(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    });

    const topBadges = Object.entries(data.badges)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([badge]) => badge);

    return { profile, count: data.count, avgMetrics, topBadges };
  });
}

export function getAIStrategyImpact() {
  const sessions = getAllSessions();
  const strategyData = {};

  sessions.forEach(s => {
    if (s.gameMode !== 'PvAI' || !s.aiStrategy) return;
    if (!strategyData[s.aiStrategy]) strategyData[s.aiStrategy] = [];

    const coopRate = s.playerMetrics
      ? (s.playerMetrics.cooperationRate || 0)
      : 0;
    strategyData[s.aiStrategy].push(coopRate);
  });

  return Object.entries(strategyData).map(([strategy, rates]) => ({
    strategy,
    avgCooperationRate: r2(rates.reduce((a, b) => a + b, 0) / rates.length),
    avgDefectionRate: r2(1 - rates.reduce((a, b) => a + b, 0) / rates.length),
    sampleSize: rates.length,
  }));
}

// ─── Player Sessions Helper ─────────────────────────────────

export function getPlayerSessions(alias) {
  const sessions = getAllSessions();
  return sessions.filter(s =>
    s.playerAlias && s.playerAlias.toLowerCase() === alias.toLowerCase()
  );
}

// ─── CSV Generation & Export ────────────────────────────────

function sanitizeCSVField(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/,/g, ';');
  if (str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateCSV(data, headers) {
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => sanitizeCSVField(row[header]));
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestamp() {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
}

// ─── Export Functions ───────────────────────────────────────

export function getExportCounts() {
  const players = getAllPlayers();
  const sessions = getAllSessions();
  const totalRounds = sessions.reduce((sum, s) => sum + (s.roundHistory ? s.roundHistory.length : 0), 0);

  return {
    players: players.length,
    sessions: sessions.length,
    rounds: totalRounds,
  };
}

export function exportPlayerSummaryDataset() {
  const players = getAllPlayers();
  const filename = `prisdilplus_players_${getTimestamp()}.csv`;

  const headers = [
    'alias', 'deviceId', 'createdAt', 'gamesPlayed', 'totalPoints', 'totalWins',
    'totalLosses', 'totalDraws', 'winRate', 'totalCooperateMoves', 'totalDefectMoves',
    'cooperationRate', 'defectionRate', 'nicenessScore', 'retaliationScore',
    'forgivenessScore', 'pushOverIndex', 'opportunismScore', 'consistencyScore',
    'behaviouralProfile', 'badges'
  ];

  const data = players.map(p => ({
    ...p,
    winRate: r2(p.winRate),
    badges: (p.badges || []).join('; '),
  }));

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}

export function exportGameSessionsDataset() {
  const sessions = getAllSessions();
  const filename = `prisdilplus_sessions_${getTimestamp()}.csv`;

  const headers = [
    'sessionId', 'timestamp', 'gameMode', 'playerAlias', 'opponentAlias',
    'opponentType', 'aiStrategy', 'totalRounds', 'playerTotalScore',
    'opponentTotalScore', 'winner', 'playerBehaviouralProfile',
    'cooperationRate', 'defectionRate', 'retaliationScore',
    'forgivenessScore', 'opportunismScore', 'consistencyScore'
  ];

  const data = sessions.map(s => {
    const m = s.playerMetrics || {};
    return {
      sessionId: s.sessionId,
      timestamp: s.timestamp,
      gameMode: s.gameMode,
      playerAlias: s.playerAlias,
      opponentAlias: s.opponentAlias,
      opponentType: s.opponentType,
      aiStrategy: s.aiStrategy || '',
      totalRounds: s.totalRounds,
      playerTotalScore: s.playerTotalScore,
      opponentTotalScore: s.opponentTotalScore,
      winner: s.winner,
      playerBehaviouralProfile: s.playerBehaviouralProfile || '',
      cooperationRate: r2(m.cooperationRate || 0),
      defectionRate: r2(m.defectionRate || 0),
      retaliationScore: r2(m.retaliationScore || 0),
      forgivenessScore: r2(m.forgivenessScore || 0),
      opportunismScore: r2(m.strategicOpportunismScore || m.opportunismScore || 0),
      consistencyScore: r2(m.consistencyScore || 0),
    };
  });

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}

export function exportRoundByRoundDataset() {
  const sessions = getAllSessions();
  const filename = `prisdilplus_rounds_${getTimestamp()}.csv`;

  const headers = [
    'sessionId', 'timestamp', 'gameMode', 'playerAlias', 'opponentAlias',
    'aiStrategy', 'roundNumber', 'totalRounds', 'playerMove', 'opponentMove',
    'outcome', 'playerRoundScore', 'opponentRoundScore',
    'cumulativePlayerScore', 'cumulativeOpponentScore'
  ];

  const data = [];
  sessions.forEach(s => {
    if (!s.roundHistory) return;
    s.roundHistory.forEach(round => {
      data.push({
        sessionId: s.sessionId,
        timestamp: s.timestamp,
        gameMode: s.gameMode,
        playerAlias: s.playerAlias,
        opponentAlias: s.opponentAlias,
        aiStrategy: s.aiStrategy || '',
        roundNumber: round.round,
        totalRounds: s.totalRounds,
        playerMove: round.playerMove,
        opponentMove: round.opponentMove,
        outcome: `${round.playerMove}${round.opponentMove}`,
        playerRoundScore: round.playerScore,
        opponentRoundScore: round.opponentScore,
        cumulativePlayerScore: round.cumulativePlayerScore,
        cumulativeOpponentScore: round.cumulativeOpponentScore,
      });
    });
  });

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}

export function exportBehaviouralMetricsMatrix() {
  const players = getAllPlayers();
  const filename = `prisdilplus_metrics_matrix_${getTimestamp()}.csv`;

  const headers = [
    'alias', 'behaviouralProfile', 'cooperationRate', 'defectionRate',
    'nicenessScore', 'retaliationScore', 'forgivenessScore', 'pushOverIndex',
    'opportunismScore', 'consistencyScore'
  ];

  const csv = generateCSV(players, headers);
  downloadCSV(csv, filename);
  return players.length;
}

export function exportFullRawExport() {
  const players = getAllPlayers();
  const sessions = getAllSessions();
  const filename = `prisdilplus_full_export_${getTimestamp()}.csv`;

  const headers = [
    'sessionId', 'timestamp', 'gameMode', 'playerAlias', 'opponentAlias',
    'aiStrategy', 'totalRounds', 'playerTotalScore', 'opponentTotalScore',
    'winner', 'playerBehaviouralProfile', 'cooperationRate', 'defectionRate',
    'retaliationScore', 'forgivenessScore', 'opportunismScore', 'consistencyScore',
    'playerDeviceId', 'playerCreatedAt', 'playerGamesPlayed', 'playerTotalPoints',
    'playerTotalWins', 'playerTotalLosses', 'playerTotalDraws', 'playerWinRate',
    'playerTotalCooperateMoves', 'playerTotalDefectMoves', 'playerBadges'
  ];

  const data = sessions.map(s => {
    const player = players.find(p => p.alias && s.playerAlias &&
      p.alias.toLowerCase() === s.playerAlias.toLowerCase());
    const m = s.playerMetrics || {};
    return {
      sessionId: s.sessionId,
      timestamp: s.timestamp,
      gameMode: s.gameMode,
      playerAlias: s.playerAlias,
      opponentAlias: s.opponentAlias,
      aiStrategy: s.aiStrategy || '',
      totalRounds: s.totalRounds,
      playerTotalScore: s.playerTotalScore,
      opponentTotalScore: s.opponentTotalScore,
      winner: s.winner,
      playerBehaviouralProfile: s.playerBehaviouralProfile || '',
      cooperationRate: r2(m.cooperationRate || 0),
      defectionRate: r2(m.defectionRate || 0),
      retaliationScore: r2(m.retaliationScore || 0),
      forgivenessScore: r2(m.forgivenessScore || 0),
      opportunismScore: r2(m.strategicOpportunismScore || m.opportunismScore || 0),
      consistencyScore: r2(m.consistencyScore || 0),
      playerDeviceId: player?.deviceId || '',
      playerCreatedAt: player?.createdAt || '',
      playerGamesPlayed: player?.gamesPlayed || 0,
      playerTotalPoints: player?.totalPoints || 0,
      playerTotalWins: player?.totalWins || 0,
      playerTotalLosses: player?.totalLosses || 0,
      playerTotalDraws: player?.totalDraws || 0,
      playerWinRate: r2(player?.winRate || 0),
      playerTotalCooperateMoves: player?.totalCooperateMoves || 0,
      playerTotalDefectMoves: player?.totalDefectMoves || 0,
      playerBadges: player?.badges ? player.badges.join('; ') : '',
    };
  });

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}
