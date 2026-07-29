import type { MarkdownLiveTheme, MarkdownPalette } from "../../types";
import { buildMarkdownStyles } from "../buildTheme";

const palette: MarkdownPalette = {
  text: "text-zinc-800 dark:text-zinc-200",
  textImportant: "text-zinc-950 dark:text-zinc-100",
  textMuted: "text-zinc-500 dark:text-zinc-400",
  textFaint: "text-zinc-400 dark:text-zinc-500",
  accent: "text-zinc-600 dark:text-zinc-300",
  surfaceTint: "bg-zinc-500/10",
  border: "border-zinc-300 dark:border-zinc-500/30",
  caret: "caret-zinc-600 dark:caret-zinc-500",
  selection: "selection:bg-zinc-400/30 dark:selection:bg-zinc-500/20",
};

export const ZINC_THEME: MarkdownLiveTheme = {
  palette,
  markdown: buildMarkdownStyles(palette),
  menu: {
    background: "bg-zinc-50 dark:bg-zinc-800",
    border: "border-zinc-300 dark:border-zinc-500/30",
    text: "text-zinc-800 dark:text-zinc-200",
    button: "bg-transparent! text-zinc-700! dark:text-zinc-200! hover:bg-zinc-500/10! hover:text-zinc-950! dark:hover:text-zinc-300!",
    buttonActive: "border-zinc-400! dark:border-zinc-600! bg-zinc-500/15! dark:bg-zinc-500/20! text-zinc-950! dark:text-zinc-300!",
    separator: "bg-zinc-400/30 dark:bg-zinc-500/20",
    activeRing: "border-zinc-600! dark:border-zinc-300! ring-1! ring-zinc-600! dark:ring-zinc-300!",
  },
  handle: "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
  ghost: "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
  blockSelection: "[--select-pad:0.5rem] ring-2 ring-zinc-500/40 ring-offset-0 bg-zinc-500/10",
  textColors: [
    "#3f3f46", // zinc-700
    "#f87171", // red-400
    "#fb923c", // orange-400
    "#fbbf24", // amber-400
    "#4ade80", // green-400
    "#60a5fa", // blue-400
    "#c084fc", // purple-400
    "#f472b6", // pink-400
  ],
  highlightColors: [
    "#e4e4e7", // zinc-200
    "#7f1d1d", // red-900
    "#7c2d12", // orange-900
    "#78350f", // amber-900
    "#14532d", // green-900
    "#1e3a8a", // blue-900
    "#4c1d95", // purple-900
    "#831843", // pink-900
  ],
  swatch: "#a1a1aa", // zinc-400
};
