import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// StarterKit's own block-level input rules (`# ` → heading, `- `/`* ` →
// bullet list, `1. ` → ordered list, `> ` → blockquote, ``` ``` ``` → code
// block, `---` → horizontal rule) hook into ProseMirror's `handleTextInput`
// DOM path — and, like the mark input rules `liveInlineFormatting.ts`
// already has to work around for a nested single-line editor, that path
// doesn't fire reliably for a Tiptap editor nested inside another Tiptap
// editor's own NodeView (a consumer embedding this editor recursively —
// e.g. a "card" whose own content is itself a nested MarkdownLiveEditor).
// Confirmed by testing: typing "- " in a nested instance left it as literal
// text instead of becoming a real bullet list, the same "typing doesn't
// trigger it, paste/plain-character-insertion do" symptom as marks.
//
// Rather than hand-reimplementing every one of StarterKit's own rules the
// way liveInlineFormatting.ts had to for marks, this reuses Tiptap's own
// public escape hatch for exactly this: a transaction whose meta carries
// `applyInputRules: { from, text }` makes the *already-registered*
// InputRules plugin (added automatically for every extension that defines
// `addInputRules()`) re-run every rule against that position — see
// `inputRulesPlugin`'s own `apply()` in @tiptap/core, the same mechanism
// its `compositionend` handler already uses. Firing this after every real
// doc change means the rules get a chance to match even when the native DOM
// path that would normally invoke them doesn't — and it's a no-op the rest
// of the time (nothing left to match once the native path already handled
// it), so this is safe to include unconditionally, not just when nested.
export const InputRuleRelay = Extension.create({
  name: "inputRuleRelay",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("inputRuleRelay"),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) return null;
          if (transactions.some(tr => tr.getMeta("applyInputRules"))) return null;
          const { selection } = newState;
          if (!selection.empty) return null;
          return newState.tr.setMeta("applyInputRules", { from: selection.from, text: "" });
        },
      }),
    ];
  },
});
