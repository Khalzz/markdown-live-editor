export interface MarkdownLiveStyles {
  content: string;
  p: string;
  strong: string;
  em: string;
  h1: string;
  h2: string;
  h3: string;
  hr: string;
  code: string;
  blockquote: string;
  ul: string;
  ol: string;
  li: string;
  table: string;
  tr: string;
  th: string;
  td: string;
}

export interface MarkdownLiveMenuStyles {
  background: string;
  border: string;
  text: string;
  button: string;
  buttonActive: string;
  separator: string;
  activeRing: string;
}

export interface MarkdownPalette {
  text: string;         // base body text — content, h3, th, td
  textImportant: string; // headings, strong — the most prominent tier
  textMuted: string;     // secondary text — em, code
  textFaint: string;     // least prominent — blockquote
  accent: string;        // list items, and reused by menu/handle/ghost (hand-written — see zinc.ts)
  surfaceTint: string;   // subtle background — hr, code background
  border: string;        // blockquote border, table row border
  caret: string;          // e.g. "caret-zinc-500"
  selection: string;      // e.g. "selection:bg-zinc-500/20"
}

export interface MarkdownLiveTheme {
  palette?: MarkdownPalette;
  markdown: MarkdownLiveStyles;
  menu: MarkdownLiveMenuStyles;
  handle: string;
  ghost: string;
  blockSelection: string;
  textColors: string[];
  highlightColors: string[];
  swatch: string;
}

export interface HoverBlockState {
  pos: number;
  top: number;
  bottom: number;
}
