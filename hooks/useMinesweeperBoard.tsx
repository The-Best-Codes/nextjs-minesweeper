import { useCallback, useState } from "react";
import { toast } from "sonner";

type CellState = "hidden" | "revealed" | "flagged";

interface Cell {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
}

type Difficulty = "easy" | "medium" | "hard" | "custom";

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

const useMinesweeperBoard = (
  difficulty: Difficulty,
  customSettings: CustomSettings,
) => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

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

  const toggleFlag = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].state === "revealed") return;

    const newBoard = [...board];
    newBoard[row][col].state =
      board[row][col].state === "flagged" ? "hidden" : "flagged";
    setBoard(newBoard);
  };

  return {
    board,
    gameOver,
    gameWon,
    resetGame,
    revealCell,
    toggleFlag,
    firstClick,
  };
};

export default useMinesweeperBoard;
