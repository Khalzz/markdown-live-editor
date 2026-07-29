import type { MarkdownLiveTheme, MarkdownPalette } from "../../types";
import { buildMarkdownStyles } from "../buildTheme";

const palette: MarkdownPalette = {
  text: "text-mauve-800 dark:text-mauve-200",
  textImportant: "text-mauve-950 dark:text-mauve-100",
  textMuted: "text-mauve-500 dark:text-mauve-400",
  textFaint: "text-mauve-400 dark:text-mauve-500",
  accent: "text-mauve-600 dark:text-mauve-300",
  surfaceTint: "bg-mauve-500/10",
  border: "border-mauve-300 dark:border-mauve-500/30",
  caret: "caret-mauve-600 dark:caret-mauve-400",
  selection: "selection:bg-mauve-400/30 dark:selection:bg-mauve-500/20",
};

export const MAUVE_THEME: MarkdownLiveTheme = {
  palette,
  markdown: buildMarkdownStyles(palette),
  menu: {
    background: "bg-mauve-50 dark:bg-mauve-950",
    border: "border-mauve-300 dark:border-mauve-500/30",
    text: "text-mauve-800 dark:text-mauve-200",
    button: "bg-transparent! text-mauve-700! dark:text-mauve-200! hover:bg-mauve-500/10! hover:text-mauve-950! dark:hover:text-mauve-300!",
    buttonActive: "border-mauve-400! dark:border-mauve-600! bg-mauve-500/15! dark:bg-mauve-500/20! text-mauve-950! dark:text-mauve-300!",
    separator: "bg-mauve-400/30 dark:bg-mauve-500/20",
    activeRing: "border-mauve-600! dark:border-mauve-300! ring-1! ring-mauve-600! dark:ring-mauve-300!",
  },
  handle: "text-mauve-400 dark:text-mauve-500 hover:text-mauve-700 dark:hover:text-mauve-300",
  ghost: "bg-mauve-50 dark:bg-mauve-950 text-mauve-700 dark:text-mauve-300",
  blockSelection: "[--select-pad:0.5rem] ring-2 ring-mauve-500/40 ring-offset-0 bg-mauve-500/10",
  textColors: [
    "#8f4c68", // mauve-600
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#fbbf24", // amber-400
    "#4ade80", // green-400
    "#60a5fa", // blue-400
    "#c084fc", // purple-400
    "#f472b6", // pink-400
  ],
  highlightColors: [
    "#f5e8ec", // mauve-100
    "#7f1d1d", // red-900
    "#7c2d12", // orange-900
    "#78350f", // amber-900
    "#14532d", // green-900
    "#1e3a8a", // blue-900
    "#4c1d95", // purple-900
    "#831843", // pink-900
  ],
  swatch: "#ab6482", // mauve-500
};
