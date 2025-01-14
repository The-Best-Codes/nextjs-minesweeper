export const handleCustomSettingChangeUtil = (
  key: "rows" | "cols" | "mines",
  value: number,
  customSettings: { rows: number; cols: number; mines: number },
) => {
  const MIN_ROWS = 5;
  const MAX_ROWS = 40;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MIN_COLS = 5;
  const MAX_COLS = 40;

  return Math.min(
    key === "rows"
      ? MAX_ROWS
      : key === "cols"
        ? MAX_COLS
        : customSettings.rows * customSettings.cols - 1,
    Math.max(key === "rows" || key === "cols" ? MIN_ROWS : 1, value),
  );
};
