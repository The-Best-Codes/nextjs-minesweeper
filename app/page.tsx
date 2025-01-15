"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import clsx from "clsx";
import {
  Bomb,
  CircleHelp,
  Flag,
  Moon,
  RefreshCw,
  Sun,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Difficulty = "easy" | "medium" | "hard" | "custom";
type CellState = "hidden" | "revealed" | "flagged";

interface Cell {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
}

interface CustomSettings {
  rows: number;
  cols: number;
  mines: number;
}

const DIFFICULTY_SETTINGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 24, cols: 24, mines: 80 },
};

const COLORS = {
  1: "text-blue-500 dark:text-blue-400",
  2: "text-green-500 dark:text-green-400",
  3: "text-red-500 dark:text-red-400",
  4: "text-purple-500 dark:text-purple-400",
  5: "text-yellow-500 dark:text-yellow-400",
  6: "text-cyan-500 dark:text-cyan-400",
  7: "text-gray-700 dark:text-gray-300",
  8: "text-gray-500 dark:text-gray-200",
};

const MIN_ROWS = 5;
const MAX_ROWS = 40;
const MIN_COLS = 5;
const MAX_COLS = 40;

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    rows: 9,
    cols: 9,
    mines: 10,
  });
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Helper function to count flags around a cell
  const flagCountAroundCell = (row: number, col: number): number => {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr;
        const nc = col + dc;
        if (
          nr >= 0 &&
          nr < board.length &&
          nc >= 0 &&
          nc < board[0].length &&
          board[nr][nc].state === "flagged"
        ) {
          count++;
        }
      }
    }
    return count;
  };

  // Initialize board
  const initializeBoard = (
    rows: number,
    cols: number,
    mines: number,
    firstClickRow?: number,
    firstClickCol?: number,
  ) => {
    const newBoard: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            isMine: false,
            state: "hidden",
            adjacentMines: 0,
          })),
      );

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      // Ensure the first click position is not a mine
      if (
        !(
          firstClickRow !== undefined &&
          row === firstClickRow &&
          col === firstClickCol
        ) &&
        !newBoard[row][col].isMine
      ) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di;
              const nj = j + dj;
              if (
                ni >= 0 &&
                ni < rows &&
                nj >= 0 &&
                nj < cols &&
                newBoard[ni][nj].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[i][j].adjacentMines = count;
        }
      }
    }

    return newBoard;
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const resetGame = useCallback(() => {
    const settings =
      difficulty === "custom"
        ? customSettings
        : DIFFICULTY_SETTINGS[difficulty];
    setBoard(initializeBoard(settings.rows, settings.cols, settings.mines));
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
  }, [difficulty, customSettings]);

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].state !== "hidden") return;

    let newBoard = [...board];

    if (firstClick) {
      const settings =
        difficulty === "custom"
          ? customSettings
          : DIFFICULTY_SETTINGS[difficulty];
      newBoard = initializeBoard(
        settings.rows,
        settings.cols,
        settings.mines,
        row,
        col,
      );
      setBoard(newBoard);
      setFirstClick(false);
    }
    if (newBoard[row][col].isMine) {
      newBoard.forEach((row) =>
        row.forEach((cell) => {
          if (cell.isMine) cell.state = "revealed";
        }),
      );
      setBoard(newBoard);
      setGameOver(true);
      toast.error("Game Over! You hit a mine.", { duration: 3000 });
      return;
    }

    const revealRecursive = (r: number, c: number) => {
      if (
        r < 0 ||
        r >= board.length ||
        c < 0 ||
        c >= board[0].length ||
        newBoard[r][c].state !== "hidden"
      )
        return;

      newBoard[r][c].state = "revealed";

      if (newBoard[r][c].adjacentMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            revealRecursive(r + dr, c + dc);
          }
        }
      }
    };
    revealRecursive(row, col);
    setBoard(newBoard);

    // Check for win
    const isWon = newBoard.every((row) =>
      row.every(
        (cell) =>
          (cell.isMine && cell.state !== "revealed") ||
          (!cell.isMine && cell.state === "revealed"),
      ),
    );
    if (isWon) {
      setGameWon(true);
      toast.success("Congratulations! You won!", { duration: 3000 });
    }
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || gameWon || board[row][col].state === "revealed") return;

    const newBoard = [...board];
    newBoard[row][col].state =
      board[row][col].state === "flagged" ? "hidden" : "flagged";
    setBoard(newBoard);
  };

  const handleCustomSettingChange = (
    key: keyof CustomSettings,
    value: number,
  ) => {
    const newSettings = {
      ...customSettings,
      [key]: Math.min(
        key === "rows"
          ? MAX_ROWS
          : key === "cols"
            ? MAX_COLS
            : customSettings.rows * customSettings.cols - 1,
        Math.max(key === "rows" || key === "cols" ? MIN_ROWS : 1, value),
      ),
    };
    setCustomSettings(newSettings);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    resetGame();
  }, [difficulty, customSettings, resetGame]);

  const getCellClassName = (cell: Cell, rowIndex: number, colIndex: number) => {
    const isRevealed = cell.state === "revealed";
    const tooManyFlags =
      isRevealed &&
      cell.adjacentMines > 0 &&
      flagCountAroundCell(rowIndex, colIndex) > cell.adjacentMines;

    const correctFlagCount =
      isRevealed &&
      cell.adjacentMines > 0 &&
      flagCountAroundCell(rowIndex, colIndex) === cell.adjacentMines;

    return clsx(
      "w-full aspect-square flex items-center justify-center rounded-lg font-medium transition-colors select-none",
      {
        "bg-red-500 dark:bg-red-400": isRevealed && cell.isMine,
        "bg-white dark:bg-slate-500":
          isRevealed && !cell.isMine && !tooManyFlags,
        "bg-gray-300 dark:bg-slate-800 hover:bg-gray-400 dark:hover:bg-slate-600/80":
          !isRevealed,
        "bg-slate-200 dark:bg-slate-600/80 text-black dark:text-slate-400":
          correctFlagCount,
        "bg-red-400 dark:bg-red-500/80 text-white": tooManyFlags,
        [COLORS[cell.adjacentMines as keyof typeof COLORS]]:
          isRevealed &&
          cell.adjacentMines > 0 &&
          flagCountAroundCell(rowIndex, colIndex) < cell.adjacentMines &&
          !tooManyFlags,
        "text-sm sm:text-lg md:text-lg": difficulty === "easy",
        "text-xs sm:text-sm md:text-base lg:text-lg": difficulty === "medium",
        "text-xs sm:text-xs md:text-base":
          difficulty === "hard" || difficulty === "custom",
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 p-4 sm:p-8 flex items-center justify-center">
      {/* Centering here */}
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 dark:text-white">
              Minesweeper
            </h1>
          </div>
          <div className="flex flex-row">
            <Dialog>
              <DialogTrigger asChild>
                <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <CircleHelp className="w-5 h-5 text-slate-800 dark:text-white" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>How to play Minesweeper</DialogTitle>
                  <DialogDescription asChild>
                    <ul className="list-disc pl-5">
                      <li>Click on a tile to reveal it.</li>
                      <li>If you reveal a mine, you lose!</li>
                      <li>
                        If a revealed tile has a number, it tells you how many
                        mines are adjacent to it.
                      </li>
                      <li>
                        Right-click to place or remove a flag if you think there
                        is a mine there.
                      </li>
                      <li>Reveal all safe tiles to win the game!</li>
                    </ul>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-white" />
              ) : (
                <Moon className="w-5 h-5 text-slate-800" />
              )}
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 shadow-md">
          {/* Difficulty Selection */}
          <div className="mb-6 flex flex-wrap gap-3 justify-center">
            {["easy", "medium", "hard", "custom"].map((diff) => (
              <motion.button
                key={diff}
                onClick={() => setDifficulty(diff as Difficulty)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  difficulty === diff
                    ? "bg-indigo-600 text-white dark:bg-indigo-500 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-400/30"
                    : "bg-gray-100 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Custom Settings */}
          {difficulty === "custom" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-gray-100 dark:bg-slate-700 rounded-xl"
            >
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <div className="flex flex-col gap-2">
                  <label className="text-slate-800 dark:text-white text-sm">
                    Rows
                  </label>
                  <input
                    type="number"
                    value={customSettings.rows}
                    onChange={(e) =>
                      handleCustomSettingChange(
                        "rows",
                        Math.min(
                          MAX_ROWS,
                          Math.max(
                            MIN_ROWS,
                            parseInt(e.target.value) || MIN_ROWS,
                          ),
                        ),
                      )
                    }
                    className="w-20 sm:w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-slate-800 dark:text-white text-sm">
                    Columns
                  </label>
                  <input
                    type="number"
                    value={customSettings.cols}
                    onChange={(e) =>
                      handleCustomSettingChange(
                        "cols",
                        Math.min(
                          MAX_COLS,
                          Math.max(
                            MIN_COLS,
                            parseInt(e.target.value) || MIN_COLS,
                          ),
                        ),
                      )
                    }
                    className="w-20 sm:w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-slate-800 dark:text-white text-sm">
                    Mines
                  </label>
                  <input
                    type="number"
                    value={customSettings.mines}
                    onChange={(e) =>
                      handleCustomSettingChange(
                        "mines",
                        Math.min(
                          customSettings.rows * customSettings.cols - 1,
                          Math.max(1, parseInt(e.target.value) || 1),
                        ),
                      )
                    }
                    className="w-20 sm:w-24 p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Reset Button */}
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

          {/* Game Board */}
          <div className="w-full overflow-auto">
            <div className="flex justify-center min-w-fit">
              <div
                className="grid gap-1 bg-gray-200 dark:bg-slate-700 p-4 rounded-xl select-none"
                style={{
                  gridTemplateColumns: `repeat(${board[0]?.length || 1}, minmax(16px, 40px))`,
                }}
              >
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <motion.button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => revealCell(rowIndex, colIndex)}
                      onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={getCellClassName(cell, rowIndex, colIndex)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cell.state === "revealed" && cell.isMine && (
                        <Bomb className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                      )}
                      {cell.state === "revealed" &&
                        !cell.isMine &&
                        cell.adjacentMines > 0 &&
                        cell.adjacentMines}
                      {cell.state === "flagged" && (
                        <Flag
                          fill="#ef4444"
                          className="w-3 h-3 sm:w-5 sm:h-5 text-red-500 dark:text-red-400"
                        />
                      )}
                    </motion.button>
                  )),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
