import type { MarkdownLiveStyles } from "./types";

// The editor's built-in default styling — MarkdownLiveEditor merges its
// `styles` prop over this, so callers only need to override what they want
// to change. Deliberately neutral/theme-agnostic (uses `currentColor` via
// Tailwind's `current` rather than any specific palette) — a real app is
// expected to pass its own full style map through `styles` to match its
// design system; this is just enough to render something legible on its own.
export const DEFAULT_MARKDOWN_LIVE_STYLES: MarkdownLiveStyles = {
  p: "mb-4 last:mb-0 text-sm leading-relaxed",
  strong: "font-semibold",
  em: "italic",
  h1: "text-2xl font-bold leading-tight mb-2",
  h2: "text-lg leading-tight font-semibold mb-1 mt-6",
  h3: "font-bold mt-6",
  hr: "border-0 h-px bg-current/20 mb-3 mt-2",
  code: "rounded bg-current/10 text-xs font-mono px-1 py-0.5",
  blockquote: "border-l-2 border-current/40 pl-3 italic text-sm mb-4 last:mb-0",
};
