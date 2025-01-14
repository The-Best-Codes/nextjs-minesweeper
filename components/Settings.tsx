import { motion } from "motion/react";
import React from "react";

type Difficulty = "easy" | "medium" | "hard" | "custom";

interface CustomSettings {
  rows: number;
  cols: number;
  mines: number;
}

interface SettingsProps {
  difficulty: Difficulty;
  customSettings: CustomSettings;
  setDifficulty: (difficulty: Difficulty) => void;
  handleCustomSettingChange: (key: keyof CustomSettings, value: number) => void;
}

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard", "custom"];
const MIN_ROWS = 5;
const MAX_ROWS = 40;
const MIN_COLS = 5;
const MAX_COLS = 40;
const Settings: React.FC<SettingsProps> = ({
  difficulty,
  customSettings,
  setDifficulty,
  handleCustomSettingChange,
}) => {
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3 justify-center">
        {DIFFICULTY_OPTIONS.map((diff) => (
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
                      Math.max(MIN_ROWS, parseInt(e.target.value) || MIN_ROWS),
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
                      Math.max(MIN_COLS, parseInt(e.target.value) || MIN_COLS),
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
    </>
  );
};

export default Settings;
