import type { MarkdownLiveTheme, MarkdownPalette } from "../../types";
import { buildMarkdownStyles } from "../buildTheme";

const palette: MarkdownPalette = {
  text: "text-slate-700 dark:text-slate-200",
  textImportant: "text-slate-950 dark:text-slate-50",
  textMuted: "text-slate-500 dark:text-slate-400",
  textFaint: "text-slate-400 dark:text-slate-500",
  accent: "text-slate-600 dark:text-slate-300",
  surfaceTint: "bg-slate-500/10",
  border: "border-slate-300 dark:border-slate-500/30",
  caret: "caret-slate-600 dark:caret-slate-400",
  selection: "selection:bg-slate-400/30 dark:selection:bg-slate-500/20",
};

export const SLATE_THEME: MarkdownLiveTheme = {
  palette,
  markdown: buildMarkdownStyles(palette),
  menu: {
    background: "bg-slate-50 dark:bg-slate-800",
    border: "border-slate-300 dark:border-slate-500/30",
    text: "text-slate-700 dark:text-slate-200",
    button: "bg-transparent! text-slate-700! dark:text-slate-200! hover:bg-slate-500/10! hover:text-slate-950! dark:hover:text-slate-300!",
    buttonActive: "border-slate-400! dark:border-slate-600! bg-slate-500/15! dark:bg-slate-500/20! text-slate-950! dark:text-slate-300!",
    separator: "bg-slate-400/30 dark:bg-slate-500/20",
    activeRing: "border-slate-600! dark:border-slate-300! ring-1! ring-slate-600! dark:ring-slate-300!",
  },
  handle: "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
  ghost: "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  blockSelection: "[--select-pad:0.5rem] ring-2 ring-slate-500/40 ring-offset-0 bg-slate-500/10",
  textColors: [
    "#334155", // slate-700
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#fbbf24", // amber-400
    "#4ade80", // green-400
    "#38bdf8", // sky-400
    "#c084fc", // purple-400
    "#f472b6", // pink-400
  ],
  highlightColors: [
    "#e2e8f0", // slate-200
    "#7f1d1d", // red-900
    "#7c2d12", // orange-900
    "#78350f", // amber-900
    "#14532d", // green-900
    "#0c4a6e", // sky-900
    "#4c1d95", // purple-900
    "#831843", // pink-900
  ],
  swatch: "#64748b", // slate-500
};
