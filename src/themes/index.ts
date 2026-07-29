import type { MarkdownLiveTheme } from "../types";
import { ZINC_THEME } from "./definitions/zinc";
import { MAUVE_THEME } from "./definitions/mauve";
import { INDIGO_THEME } from "./definitions/indigo";
import { SLATE_THEME } from "./definitions/slate";
import { MIST_THEME } from "./definitions/mist";

export const MARKDOWN_LIVE_THEMES = {
  zinc: ZINC_THEME,
  mauve: MAUVE_THEME,
  indigo: INDIGO_THEME,
  slate: SLATE_THEME,
  mist: MIST_THEME,
} satisfies Record<string, MarkdownLiveTheme>;

export type MarkdownLiveThemeName = keyof typeof MARKDOWN_LIVE_THEMES;

const NESTED_THEME_KEYS = ["markdown", "menu", "palette"] as const satisfies readonly (keyof MarkdownLiveTheme)[];

function mergeNestedSection<K extends typeof NESTED_THEME_KEYS[number]>(
  merged: MarkdownLiveTheme, base: MarkdownLiveTheme, override: Partial<MarkdownLiveTheme> | undefined, key: K,
): void {
  merged[key] = { ...base[key], ...override?.[key] };
}

export function mergeTheme(base: MarkdownLiveTheme, override?: Partial<MarkdownLiveTheme>): MarkdownLiveTheme {
  const merged: MarkdownLiveTheme = { ...base, ...override };
  for (const key of NESTED_THEME_KEYS) {
    mergeNestedSection(merged, base, override, key);
  }
  return merged;
}
