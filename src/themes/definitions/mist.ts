import type { MarkdownLiveTheme, MarkdownPalette } from "../../types";
import { buildMarkdownStyles } from "../buildTheme";

const palette: MarkdownPalette = {
  text: "text-mist-800 dark:text-mist-200",
  textImportant: "text-mist-950 dark:text-mist-100",
  textMuted: "text-mist-500 dark:text-mist-400",
  textFaint: "text-mist-400 dark:text-mist-500",
  accent: "text-mist-600 dark:text-mist-300",
  surfaceTint: "bg-mist-500/10",
  border: "border-mist-300 dark:border-mist-500/30",
  caret: "caret-mist-600 dark:caret-mist-400",
  selection: "selection:bg-mist-400/30 dark:selection:bg-mist-500/20",
};

export const MIST_THEME: MarkdownLiveTheme = {
  palette,
  markdown: buildMarkdownStyles(palette),
  menu: {
    background: "bg-mist-50 dark:bg-mist-950",
    border: "border-mist-300 dark:border-mist-500/30",
    text: "text-mist-800 dark:text-mist-200",
    button: "bg-transparent! text-mist-700! dark:text-mist-200! hover:bg-mist-500/10! hover:text-mist-950! dark:hover:text-mist-300!",
    buttonActive: "border-mist-400! dark:border-mist-600! bg-mist-500/15! dark:bg-mist-500/20! text-mist-950! dark:text-mist-300!",
    separator: "bg-mist-400/30 dark:bg-mist-500/20",
    activeRing: "border-mist-600! dark:border-mist-300! ring-1! ring-mist-600! dark:ring-mist-300!",
  },
  handle: "text-mist-400 dark:text-mist-500 hover:text-mist-700 dark:hover:text-mist-300",
  ghost: "bg-mist-50 dark:bg-mist-950 text-mist-700 dark:text-mist-300",
  blockSelection: "[--select-pad:0.5rem] ring-2 ring-mist-500/40 ring-offset-0 bg-mist-500/10",
  textColors: [
    "#4d6875", // mist-600
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#fbbf24", // amber-400
    "#4ade80", // green-400
    "#60a5fa", // blue-400
    "#c084fc", // purple-400
    "#f472b6", // pink-400
  ],
  highlightColors: [
    "#e7edf1", // mist-100
    "#7f1d1d", // red-900
    "#7c2d12", // orange-900
    "#78350f", // amber-900
    "#14532d", // green-900
    "#1e3a8a", // blue-900
    "#4c1d95", // purple-900
    "#831843", // pink-900
  ],
  swatch: "#63808f", // mist-500
};
