import type { MarkdownLiveTheme, MarkdownPalette } from "../../types";
import { buildMarkdownStyles } from "../buildTheme";

const palette: MarkdownPalette = {
  text: "text-indigo-800 dark:text-indigo-200",
  textImportant: "text-indigo-950 dark:text-indigo-100",
  textMuted: "text-indigo-500 dark:text-indigo-400",
  textFaint: "text-indigo-400 dark:text-indigo-500",
  accent: "text-indigo-600 dark:text-indigo-300",
  surfaceTint: "bg-indigo-500/10",
  border: "border-indigo-300 dark:border-indigo-500/30",
  caret: "caret-indigo-600 dark:caret-indigo-400",
  selection: "selection:bg-indigo-400/30 dark:selection:bg-indigo-500/20",
};

export const INDIGO_THEME: MarkdownLiveTheme = {
  palette,
  markdown: buildMarkdownStyles(palette),
  menu: {
    background: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-300 dark:border-indigo-500/30",
    text: "text-indigo-800 dark:text-indigo-200",
    button: "bg-transparent! text-indigo-700! dark:text-indigo-200! hover:bg-indigo-500/10! hover:text-indigo-950! dark:hover:text-indigo-300!",
    buttonActive: "border-indigo-400! dark:border-indigo-600! bg-indigo-500/15! dark:bg-indigo-500/20! text-indigo-950! dark:text-indigo-300!",
    separator: "bg-indigo-400/30 dark:bg-indigo-500/20",
    activeRing: "border-indigo-600! dark:border-indigo-300! ring-1! ring-indigo-600! dark:ring-indigo-300!",
  },
  handle: "text-indigo-400 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300",
  ghost: "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300",
  blockSelection: "[--select-pad:0.5rem] bg-indigo-200/80 dark:bg-indigo-500/20",
  textColors: [
    "#4338ca", // indigo-700
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#fbbf24", // amber-400
    "#4ade80", // green-400
    "#22d3ee", // cyan-400
    "#c084fc", // purple-400
    "#f472b6", // pink-400
  ],
  highlightColors: [
    "#e0e7ff", // indigo-100
    "#7f1d1d", // red-900
    "#7c2d12", // orange-900
    "#78350f", // amber-900
    "#14532d", // green-900
    "#164e63", // cyan-900
    "#4c1d95", // purple-900
    "#831843", // pink-900
  ],
  swatch: "#6366f1", // indigo-500
};
