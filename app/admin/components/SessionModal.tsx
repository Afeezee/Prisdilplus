'use client';

export default function SessionModal({ session, onClose }) {
  if (!session) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Session {session.sessionId.slice(0, 8)}...
          </h2>
          <p className="text-gray-400">
            {session.gameMode} • {new Date(session.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-cyan-400 text-sm font-medium">Players</div>
            <div className="text-white text-lg">{session.playerAlias} vs {session.opponentAlias}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-cyan-400 text-sm font-medium">Final Score</div>
            <div className="text-white text-lg">
              {session.playerTotalScore} - {session.opponentTotalScore}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-cyan-400 text-sm font-medium">Winner</div>
            <div className="text-white text-lg">{session.winner}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-cyan-400 text-sm font-medium">Rounds</div>
            <div className="text-white text-lg">{session.totalRounds}</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="text-cyan-400 text-sm font-medium mb-2">Round History</div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {session.roundHistory?.map((round, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Round {round.round}:</span>
                <span className="text-white">
                  {round.playerMove} vs {round.opponentMove} •
                  {round.playerScore}-{round.opponentScore}
                </span>
              </div>
            )) || <div className="text-gray-400">No round data available</div>}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}