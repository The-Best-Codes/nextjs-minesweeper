import { COLORS } from "@/utils/constants";
import { Bomb, Flag } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface CellProps {
  state: "hidden" | "revealed" | "flagged";
  isMine: boolean;
  adjacentMines: number;
  rowIndex: number;
  colIndex: number;
  revealCell: (row: number, col: number) => void;
  toggleFlag: (row: number, col: number) => void;
  difficulty: "easy" | "medium" | "hard" | "custom";
}

const Cell: React.FC<CellProps> = ({
  state,
  isMine,
  adjacentMines,
  rowIndex,
  colIndex,
  revealCell,
  toggleFlag,
  difficulty,
}) => {
  return (
    <motion.button
      key={`${rowIndex}-${colIndex}`}
      onClick={() => revealCell(rowIndex, colIndex)}
      onContextMenu={(e) => {
        e.preventDefault();
        toggleFlag(rowIndex, colIndex);
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`w-full aspect-square flex items-center justify-center rounded-lg font-medium transition-colors select-none
          ${
            state === "revealed"
              ? isMine
                ? "bg-red-500 dark:bg-red-400"
                : "bg-white dark:bg-slate-500"
              : "bg-gray-300 dark:bg-slate-800 hover:bg-gray-400 dark:hover:bg-slate-600/80"
          } ${
            state === "revealed" && adjacentMines > 0
              ? COLORS[adjacentMines as keyof typeof COLORS]
              : ""
          } ${difficulty === "easy" ? "text-sm sm:text-lg md:text-lg" : difficulty === "medium" ? "text-xs sm:text-sm md:text-base lg:text-lg" : "text-xs sm:text-xs md:text-base"}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {state === "revealed" && isMine && (
        <Bomb className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
      )}
      {state === "revealed" && !isMine && adjacentMines > 0 && adjacentMines}
      {state === "flagged" && (
        <Flag
          fill="#ef4444"
          className="w-3 h-3 sm:w-5 sm:h-5 text-red-500 dark:text-red-400"
        />
      )}
    </motion.button>
  );
};

export default Cell;
