import {
  Bold, Code, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Minus, Quote, Table, type LucideIcon,
} from "lucide-react";

// `markdown` is a function for blocks that need fresh identity per insertion
// (an embed's own id, so several of the same kind can coexist in one
// document) — a plain string otherwise.
export interface SlashBlock { label: string; markdown: string | (() => string); icon: LucideIcon }
export interface SlashGroup { section: string; blocks: SlashBlock[] }

// Block types offered by the "/" slash menu, grouped into Notion-style
// labeled sections. Only the icon tells them apart visually — every label
// renders with the same uniform text style. This is the editor's own
// built-in default — nothing here depends on any consuming app. A consumer
// with its own embeds (page galleries, images, whatever else) passes extra
// groups of its own via `slashGroups`, appended after these rather than
// baked into the editor itself.
export const DEFAULT_SLASH_GROUPS: SlashGroup[] = [
  {
    section: "Text",
    blocks: [
      { label: "Heading 1", markdown: "# Heading 1", icon: Heading1 },
      { label: "Heading 2", markdown: "## Heading 2", icon: Heading2 },
      { label: "Heading 3", markdown: "### Heading 3", icon: Heading3 },
      { label: "Bold", markdown: "**bold text**", icon: Bold },
      { label: "Italic", markdown: "*italic text*", icon: Italic },
    ],
  },
  {
    section: "Lists",
    blocks: [
      { label: "Bulleted list", markdown: "- List item", icon: List },
      { label: "Numbered list", markdown: "1. List item", icon: ListOrdered },
    ],
  },
  {
    section: "Advanced",
    blocks: [
      { label: "Quote", markdown: "> Quote", icon: Quote },
      { label: "Code", markdown: "`code`", icon: Code },
      { label: "Divider", markdown: "---", icon: Minus },
      { label: "Table", markdown: "| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |", icon: Table },
    ],
  },
];
