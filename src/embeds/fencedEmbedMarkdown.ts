import type { MarkdownParseHelpers, MarkdownParseResult, MarkdownToken } from "@tiptap/core";

// A building block for a consumer's own custom embed nodes: round-trips a
// node's attrs through a fenced code block holding JSON (` ```pages\n{...}\n``` `,
// etc.) — a fenced code block is already a standard CommonMark token
// (`type: 'code'`), so no custom tokenizer is needed, just a `parseMarkdown`
// handler keyed on `token.lang`.
//
// Registration order matters here. @tiptap/markdown tries every extension's
// `parseMarkdown` registered for a given token type in turn (in extension-
// priority order) until one returns non-empty. The built-in CodeBlock
// extension also claims every `code` token unconditionally — it never looks
// at `lang` — so without an explicit higher `priority` on the embed node
// (set where this is spread into each Node.create() config), CodeBlock
// would claim a consumer's own ```pages/image/whatever blocks first and
// render them as plain code text instead of the real embed.
export function fencedJsonMarkdown(lang: string, nodeName: string) {
  return {
    markdownTokenName: "code",
    // The `undefined` returns below are how a handler declines a token so
    // @tiptap/markdown tries the next one registered for the same type (see
    // MarkdownManager.parseToken) — the `MarkdownParseResult` return type
    // just doesn't spell that out, so it's cast here rather than widened
    // project-wide.
    parseMarkdown(token: MarkdownToken, helpers: MarkdownParseHelpers): MarkdownParseResult {
      if (token.lang !== lang) return undefined as unknown as MarkdownParseResult;
      try {
        const data = JSON.parse(token.text ?? "");
        return helpers.createNode(nodeName, data);
      } catch {
        return undefined as unknown as MarkdownParseResult;
      }
    },
    renderMarkdown(node: { attrs?: Record<string, unknown> }) {
      return "```" + lang + "\n" + JSON.stringify(node.attrs ?? {}, null, 2) + "\n```";
    },
  };
}
