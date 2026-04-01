'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Move } from '@/lib/types';

interface MoveAnimationProps {
  player1Move: Move | null;
  player2Move: Move | null;
  isRevealing: boolean;
}

export default function MoveAnimation({
  player1Move,
  player2Move,
  isRevealing,
}: MoveAnimationProps) {
  if (!isRevealing || !player1Move || !player2Move) return null;

  const bothCooperate = player1Move === 'C' && player2Move === 'C';
  const bothDefect = player1Move === 'D' && player2Move === 'D';

  return (
    <AnimatePresence>
      {isRevealing && (
        <motion.div
          className="flex flex-col items-center justify-center py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Central animation */}
          {bothCooperate && (
            <motion.div className="relative">
              {/* Handshake glow */}
              <motion.div
                className="text-5xl md:text-6xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              >
                🤝
              </motion.div>
              {/* Green pulse rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400/30"
                  initial={{ scale: 0.5, opacity: 0.8 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.3,
                    repeat: 0,
                    ease: 'easeOut',
                  }}
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                />
              ))}
              <motion.p
                className="text-emerald-400 font-bold text-sm mt-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Mutual Cooperation!
              </motion.p>
            </motion.div>
          )}

          {bothDefect && (
            <motion.div className="relative">
              <motion.div
                className="text-5xl md:text-6xl"
                initial={{ scale: 2, opacity: 0 }}
                animate={{
                  scale: [2, 0.8, 1],
                  opacity: 1,
                  rotate: [0, -10, 10, -5, 0],
                }}
                transition={{ duration: 0.6 }}
              >
                💥
              </motion.div>
              {/* Red flash */}
              <motion.div
                className="absolute inset-0 bg-red-500/10 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{ duration: 0.8 }}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
              <motion.p
                className="text-red-400 font-bold text-sm mt-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Mutual Defection!
              </motion.p>
            </motion.div>
          )}

          {!bothCooperate && !bothDefect && (
            <motion.div className="relative">
              <motion.div
                className="text-5xl md:text-6xl"
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.3, 1],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                ⚡
              </motion.div>
              {/* Mixed pulse */}
              <motion.div
                className="absolute inset-0 bg-amber-500/10 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 1 }}
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              />
              <motion.p
                className="text-amber-400 font-bold text-sm mt-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {player1Move === 'D' ? 'Betrayal!' : 'Exploited!'}
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
