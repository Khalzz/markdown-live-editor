// Per-element markdown styling this editor renders block-level nodes with.
// A plain, self-contained shape (not derived from any consuming app's own
// styling) — pass a full or partial override via MarkdownLiveEditor's
// `styles` prop to match your own design system.
export interface MarkdownLiveStyles {
  p: string;
  strong: string;
  em: string;
  h1: string;
  h2: string;
  h3: string;
  hr: string;
  code: string;
  blockquote: string;
}

// Container-relative pixel rect for the hover drag-handle, plus the
// ProseMirror document position it points at (so a click can turn it into a
// NodeSelection via `editor.commands.setNodeSelection(pos)`).
export interface HoverBlockState {
  pos: number;
  top: number;
  bottom: number;
}
