// ============================================================
// Prisdil+ Admin Data Utilities
// ============================================================

/**
 * Safely read data from localStorage with error handling
 */
export function readLocalStorageData() {
  if (typeof window === 'undefined') return { leaderboard: {}, sessions: [] };

  try {
    const leaderboardRaw = localStorage.getItem('prisdilplus_human_leaderboard');
    const sessionsRaw = localStorage.getItem('prisdilplus_game_sessions');

    const leaderboard = leaderboardRaw ? JSON.parse(leaderboardRaw) : {};
    const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];

    return { leaderboard, sessions };
  } catch (error) {
    console.error('Error reading admin data:', error);
    return { leaderboard: {}, sessions: [] };
  }
}

/**
 * Get all human players with computed metrics
 */
export function getAllPlayers() {
  const { leaderboard } = readLocalStorageData();
  return Object.values(leaderboard).map(player => ({
    ...player,
    winRate: player.gamesPlayed > 0 ? (player.totalWins / player.gamesPlayed) * 100 : 0,
    cooperationRate: player.totalMoves > 0 ? player.totalCooperateMoves / player.totalMoves : 0,
    defectionRate: player.totalMoves > 0 ? player.totalDefectMoves / player.totalMoves : 0,
    retaliationScore: player.totalBetrayalsFaced > 0 ? player.totalRetaliations / player.totalBetrayalsFaced : 0,
    forgivenessScore: player.totalRetaliationSequences > 0 ? player.totalForgivenessEvents / player.totalRetaliationSequences : 0,
    opportunismScore: player.totalDefections > 0 ? player.totalDefectionsAfterOpponentCoop / player.totalDefections : 0,
    consistencyScore: player.totalRoundsPlayed > 0 ? player.longestStreak / player.totalRoundsPlayed : 0,
    behaviouralProfile: classifyBehaviouralProfile({
      cooperationRate: player.totalMoves > 0 ? player.totalCooperateMoves / player.totalMoves : 0,
      defectionRate: player.totalMoves > 0 ? player.totalDefectMoves / player.totalMoves : 0,
      retaliationScore: player.totalBetrayalsFaced > 0 ? player.totalRetaliations / player.totalBetrayalsFaced : 0,
      forgivenessScore: player.totalRetaliationSequences > 0 ? player.totalForgivenessEvents / player.totalRetaliationSequences : 0,
      opportunismScore: player.totalDefections > 0 ? player.totalDefectionsAfterOpponentCoop / player.totalDefections : 0,
      consistencyScore: player.totalRoundsPlayed > 0 ? player.longestStreak / player.totalRoundsPlayed : 0,
    }),
  }));
}

/**
 * Classify behavioural profile (simplified version)
 */
function classifyBehaviouralProfile(metrics) {
  const { cooperationRate, defectionRate, retaliationScore, forgivenessScore } = metrics;

  if (cooperationRate > 0.6 && retaliationScore > 0.5 && forgivenessScore > 0.5) {
    return 'Strategic Diplomat';
  }
  if (cooperationRate > 0.75 && retaliationScore < 0.3) {
    return 'Highly Trusting';
  }
  if (defectionRate > 0.6) {
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

/**
 * Get all game sessions
 */
export function getAllSessions() {
  const { sessions } = readLocalStorageData();
  return sessions;
}

/**
 * Get overview metrics
 */
export function getOverviewMetrics() {
  const players = getAllPlayers();
  const sessions = getAllSessions();

  const totalPlayers = players.length;
  const totalGames = sessions.length;
  const totalRounds = sessions.reduce((sum, s) => sum + s.totalRounds, 0);

  const avgCooperationRate = players.length > 0
    ? players.reduce((sum, p) => sum + p.cooperationRate, 0) / players.length
    : 0;

  const avgDefectionRate = players.length > 0
    ? players.reduce((sum, p) => sum + p.defectionRate, 0) / players.length
    : 0;

  const profileCounts = {};
  players.forEach(p => {
    profileCounts[p.behaviouralProfile] = (profileCounts[p.behaviouralProfile] || 0) + 1;
  });
  const mostCommonProfile = Object.keys(profileCounts).reduce((a, b) =>
    profileCounts[a] > profileCounts[b] ? a : b, '');

  const modeCounts = {};
  sessions.forEach(s => {
    modeCounts[s.gameMode] = (modeCounts[s.gameMode] || 0) + 1;
  });
  const mostPlayedMode = Object.keys(modeCounts).reduce((a, b) =>
    modeCounts[a] > modeCounts[b] ? a : b, '');

  const strategyCounts = {};
  sessions.filter(s => s.gameMode === 'PvAI').forEach(s => {
    strategyCounts[s.aiStrategy] = (strategyCounts[s.aiStrategy] || 0) + 1;
  });
  const mostUsedStrategy = Object.keys(strategyCounts).reduce((a, b) =>
    strategyCounts[a] > strategyCounts[b] ? a : b, '');

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

/**
 * Generate CSV content from data
 */
function generateCSV(data, headers) {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape commas and quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
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
}

/**
 * Export player summary dataset
 */
export function exportPlayerSummaryDataset() {
  const players = getAllPlayers();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `prisdilplus_players_${timestamp}.csv`;

  const headers = [
    'alias', 'deviceId', 'createdAt', 'gamesPlayed', 'totalPoints', 'totalWins',
    'totalLosses', 'totalDraws', 'winRate', 'totalCooperateMoves', 'totalDefectMoves',
    'cooperationRate', 'defectionRate', 'nicenessScore', 'retaliationScore',
    'forgivenessScore', 'pushOverIndex', 'opportunismScore', 'consistencyScore',
    'behaviouralProfile', 'badges'
  ];

  const data = players.map(player => ({
    alias: player.alias,
    deviceId: player.deviceId || '',
    createdAt: player.createdAt || '',
    gamesPlayed: player.gamesPlayed,
    totalPoints: player.totalPoints,
    totalWins: player.totalWins,
    totalLosses: player.totalLosses,
    totalDraws: player.totalDraws,
    winRate: Math.round(player.winRate * 100) / 100,
    totalCooperateMoves: player.totalCooperateMoves,
    totalDefectMoves: player.totalDefectMoves,
    cooperationRate: Math.round(player.cooperationRate * 100) / 100,
    defectionRate: Math.round(player.defectionRate * 100) / 100,
    nicenessScore: 0, // Would need to compute from first 3 rounds
    retaliationScore: Math.round(player.retaliationScore * 100) / 100,
    forgivenessScore: Math.round(player.forgivenessScore * 100) / 100,
    pushOverIndex: 0, // Would need to compute
    opportunismScore: Math.round(player.opportunismScore * 100) / 100,
    consistencyScore: Math.round(player.consistencyScore * 100) / 100,
    behaviouralProfile: player.behaviouralProfile,
    badges: player.badges ? player.badges.join(';') : '',
  }));

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}

/**
 * Export game sessions dataset
 */
export function exportGameSessionsDataset() {
  const sessions = getAllSessions();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `prisdilplus_sessions_${timestamp}.csv`;

  const headers = [
    'sessionId', 'timestamp', 'gameMode', 'playerAlias', 'opponentAlias',
    'opponentType', 'aiStrategy', 'totalRounds', 'playerTotalScore',
    'opponentTotalScore', 'winner', 'playerBehaviouralProfile',
    'cooperationRate', 'defectionRate', 'retaliationScore',
    'forgivenessScore', 'opportunismScore', 'consistencyScore'
  ];

  const data = sessions.map(session => ({
    sessionId: session.sessionId,
    timestamp: session.timestamp,
    gameMode: session.gameMode,
    playerAlias: session.playerAlias,
    opponentAlias: session.opponentAlias,
    opponentType: session.opponentType,
    aiStrategy: session.aiStrategy || '',
    totalRounds: session.totalRounds,
    playerTotalScore: session.playerTotalScore,
    opponentTotalScore: session.opponentTotalScore,
    winner: session.winner,
    playerBehaviouralProfile: session.playerBehaviouralProfile,
    cooperationRate: Math.round(session.playerMetrics.cooperationRate * 100) / 100,
    defectionRate: Math.round(session.playerMetrics.defectionRate * 100) / 100,
    retaliationScore: Math.round(session.playerMetrics.retaliationScore * 100) / 100,
    forgivenessScore: Math.round(session.playerMetrics.forgivenessScore * 100) / 100,
    opportunismScore: Math.round(session.playerMetrics.opportunismScore * 100) / 100,
    consistencyScore: Math.round(session.playerMetrics.consistencyScore * 100) / 100,
  }));

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}

/**
 * Export round-by-round raw dataset
 */
export function exportRoundByRoundDataset() {
  const sessions = getAllSessions();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `prisdilplus_rounds_${timestamp}.csv`;

  const headers = [
    'sessionId', 'timestamp', 'gameMode', 'playerAlias', 'opponentAlias',
    'aiStrategy', 'roundNumber', 'totalRounds', 'playerMove', 'opponentMove',
    'outcome', 'playerRoundScore', 'opponentRoundScore',
    'cumulativePlayerScore', 'cumulativeOpponentScore'
  ];

  const data = [];
  sessions.forEach(session => {
    session.roundHistory.forEach(round => {
      data.push({
        sessionId: session.sessionId,
        timestamp: session.timestamp,
        gameMode: session.gameMode,
        playerAlias: session.playerAlias,
        opponentAlias: session.opponentAlias,
        aiStrategy: session.aiStrategy || '',
        roundNumber: round.round,
        totalRounds: session.totalRounds,
        playerMove: round.playerMove,
        opponentMove: round.opponentMove,
        outcome: round.playerMove + round.opponentMove,
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

/**
 * Export behavioural metrics matrix
 */
export function exportBehaviouralMetricsMatrix() {
  const players = getAllPlayers();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `prisdilplus_metrics_matrix_${timestamp}.csv`;

  const headers = [
    'alias', 'behaviouralProfile', 'cooperationRate', 'defectionRate',
    'nicenessScore', 'retaliationScore', 'forgivenessScore', 'pushOverIndex',
    'opportunismScore', 'consistencyScore'
  ];

  const data = players.map(player => ({
    alias: player.alias,
    behaviouralProfile: player.behaviouralProfile,
    cooperationRate: Math.round(player.cooperationRate * 100) / 100,
    defectionRate: Math.round(player.defectionRate * 100) / 100,
    nicenessScore: 0, // Would need to compute
    retaliationScore: Math.round(player.retaliationScore * 100) / 100,
    forgivenessScore: Math.round(player.forgivenessScore * 100) / 100,
    pushOverIndex: 0, // Would need to compute
    opportunismScore: Math.round(player.opportunismScore * 100) / 100,
    consistencyScore: Math.round(player.consistencyScore * 100) / 100,
  }));

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}

/**
 * Export full raw export
 */
export function exportFullRawExport() {
  const players = getAllPlayers();
  const sessions = getAllSessions();
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `prisdilplus_full_export_${timestamp}.csv`;

  const headers = [
    'sessionId', 'timestamp', 'gameMode', 'playerAlias', 'opponentAlias',
    'aiStrategy', 'totalRounds', 'playerTotalScore', 'opponentTotalScore',
    'winner', 'playerBehaviouralProfile', 'cooperationRate', 'defectionRate',
    'retaliationScore', 'forgivenessScore', 'opportunismScore', 'consistencyScore',
    'playerDeviceId', 'playerCreatedAt', 'playerGamesPlayed', 'playerTotalPoints',
    'playerTotalWins', 'playerTotalLosses', 'playerTotalDraws', 'playerWinRate',
    'playerTotalCooperateMoves', 'playerTotalDefectMoves', 'playerBadges'
  ];

  const data = sessions.map(session => {
    const player = players.find(p => p.alias.toLowerCase() === session.playerAlias.toLowerCase());
    return {
      sessionId: session.sessionId,
      timestamp: session.timestamp,
      gameMode: session.gameMode,
      playerAlias: session.playerAlias,
      opponentAlias: session.opponentAlias,
      aiStrategy: session.aiStrategy || '',
      totalRounds: session.totalRounds,
      playerTotalScore: session.playerTotalScore,
      opponentTotalScore: session.opponentTotalScore,
      winner: session.winner,
      playerBehaviouralProfile: session.playerBehaviouralProfile,
      cooperationRate: Math.round(session.playerMetrics.cooperationRate * 100) / 100,
      defectionRate: Math.round(session.playerMetrics.defectionRate * 100) / 100,
      retaliationScore: Math.round(session.playerMetrics.retaliationScore * 100) / 100,
      forgivenessScore: Math.round(session.playerMetrics.forgivenessScore * 100) / 100,
      opportunismScore: Math.round(session.playerMetrics.opportunismScore * 100) / 100,
      consistencyScore: Math.round(session.playerMetrics.consistencyScore * 100) / 100,
      playerDeviceId: player?.deviceId || '',
      playerCreatedAt: player?.createdAt || '',
      playerGamesPlayed: player?.gamesPlayed || 0,
      playerTotalPoints: player?.totalPoints || 0,
      playerTotalWins: player?.totalWins || 0,
      playerTotalLosses: player?.totalLosses || 0,
      playerTotalDraws: player?.totalDraws || 0,
      playerWinRate: Math.round((player?.winRate || 0) * 100) / 100,
      playerTotalCooperateMoves: player?.totalCooperateMoves || 0,
      playerTotalDefectMoves: player?.totalDefectMoves || 0,
      playerBadges: player?.badges ? player.badges.join(';') : '',
    };
  });

  const csv = generateCSV(data, headers);
  downloadCSV(csv, filename);
  return data.length;
}