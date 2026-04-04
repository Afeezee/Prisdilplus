'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface SessionModalProps {
  session: any;
  onClose: () => void;
}

export default function SessionModal({ session, onClose }: SessionModalProps) {
  if (!session) return null;

  const rounds = session.roundHistory || [];

  // Score progression data
  const scoreData = rounds.map((r: any) => ({
    round: r.round,
    player: r.cumulativePlayerScore,
    opponent: r.cumulativeOpponentScore,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#12121f]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">
              Session <span className="font-mono text-cyan-400">{session.sessionId?.slice(0, 8)}</span>
            </h2>
            <p className="text-gray-400 text-sm">
              {session.gameMode} • {new Date(session.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white font-bold">{session.playerAlias}</div>
            <div className="text-gray-400 text-xs">Player</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white font-bold">{session.opponentAlias}</div>
            <div className="text-gray-400 text-xs">Opponent</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-white font-bold">{session.playerTotalScore} - {session.opponentTotalScore}</div>
            <div className="text-gray-400 text-xs">Final Score</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className={`font-bold ${session.winner === 'tie' ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {session.winner}
            </div>
            <div className="text-gray-400 text-xs">Winner</div>
          </div>
        </div>

        {session.aiStrategy && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2 mb-6 text-sm text-purple-300">
            AI Strategy: <span className="font-mono font-semibold">{session.aiStrategy}</span>
          </div>
        )}

        {/* Move Sequence Visualization */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Round-by-Round Moves</h3>
          {rounds.length > 0 ? (
            <div className="space-y-3">
              {/* Player moves */}
              <div>
                <div className="text-gray-400 text-xs mb-1">{session.playerAlias}</div>
                <div className="flex flex-wrap gap-1.5">
                  {rounds.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        r.playerMove === 'C'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                      title={`Round ${r.round}: ${r.playerMove === 'C' ? 'Cooperate' : 'Defect'}`}
                    >
                      {r.playerMove}
                    </div>
                  ))}
                </div>
              </div>
              {/* Opponent moves */}
              <div>
                <div className="text-gray-400 text-xs mb-1">{session.opponentAlias}</div>
                <div className="flex flex-wrap gap-1.5">
                  {rounds.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        r.opponentMove === 'C'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                      title={`Round ${r.round}: ${r.opponentMove === 'C' ? 'Cooperate' : 'Defect'}`}
                    >
                      {r.opponentMove}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No round data available</p>
          )}
        </div>

        {/* Score Progression Chart */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h3 className="text-white font-semibold text-sm mb-3">Score Progression</h3>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="round" stroke="#6b7280" tick={{ fontSize: 10 }} label={{ value: 'Round', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="player" stroke="#22d3ee" strokeWidth={2} name={session.playerAlias} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="opponent" stroke="#a855f7" strokeWidth={2} name={session.opponentAlias} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500">No data</div>
          )}
        </div>

        {/* Round History Table */}
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">Detailed Round History</h3>
          {rounds.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="px-3 py-2 text-left">Round</th>
                    <th className="px-3 py-2 text-center">Player</th>
                    <th className="px-3 py-2 text-center">Opponent</th>
                    <th className="px-3 py-2 text-center">Outcome</th>
                    <th className="px-3 py-2 text-center">P Score</th>
                    <th className="px-3 py-2 text-center">O Score</th>
                    <th className="px-3 py-2 text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r: any) => (
                    <tr key={r.round} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-3 py-2 text-gray-300">{r.round}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.playerMove === 'C' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {r.playerMove === 'C' ? 'COOP' : 'DEFECT'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.opponentMove === 'C' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {r.opponentMove === 'C' ? 'COOP' : 'DEFECT'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-300 font-mono">{r.playerMove}{r.opponentMove}</td>
                      <td className="px-3 py-2 text-center text-gray-300">+{r.playerScore}</td>
                      <td className="px-3 py-2 text-center text-gray-300">+{r.opponentScore}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{r.cumulativePlayerScore}-{r.cumulativeOpponentScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No round data available</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
