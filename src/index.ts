export { MarkdownLiveEditor } from "./MarkdownLiveEditor";
export type { MarkdownLiveStyles, HoverBlockState } from "./types";
export { DEFAULT_MARKDOWN_LIVE_STYLES } from "./styles";
export type { SlashGroup, SlashBlock } from "./slashGroups";
export { DEFAULT_SLASH_GROUPS } from "./slashGroups";

// Building blocks for a consumer's own custom embed nodes — a fenced-JSON
// round-trip helper and a minimal toDOM/parseHTML fallback (see each file's
// own comment for why these exist).
export { fencedJsonMarkdown } from "./fencedEmbedMarkdown";
export { embedDomSpec } from "./embedDomSpec";

// A reusable ProseMirror plugin for a consumer's own nested single-line
// editor (bold/italic/code marks) — see its own comment for the nested-
// editor input-rule quirk this works around.
export { LiveInlineFormatting } from "./liveInlineFormatting";
