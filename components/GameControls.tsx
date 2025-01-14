import { RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface GameControlsProps {
  resetGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ resetGame }) => {
  return (
    <div className="mb-6 text-center">
      <motion.button
        onClick={resetGame}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-6 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 mx-auto hover:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/30 dark:shadow-emerald-400/30"
      >
        <RefreshCw className="w-4 h-4" />
        Reset Game
      </motion.button>
    </div>
  );
};

export default GameControls;
