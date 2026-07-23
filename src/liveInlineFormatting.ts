import { Extension } from "@tiptap/core";
import type { MarkType } from "@tiptap/pm/model";
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state";
import { starInputRegex as boldStarRegex, underscoreInputRegex as boldUnderscoreRegex } from "@tiptap/extension-bold";
import { starInputRegex as italicStarRegex, underscoreInputRegex as italicUnderscoreRegex } from "@tiptap/extension-italic";
import { inputRegexMatch as codeInputMatch } from "@tiptap/extension-code";

// Bold/Italic/Code's own built-in input rules (what normally auto-formats
// **bold**/*italic*/`code` as you type) hook into ProseMirror's
// `handleTextInput` — and that specific path doesn't fire reliably for a
// Tiptap editor nested inside another Tiptap editor's own NodeView (e.g. a
// consumer's own single-line nested editor for one field of a larger
// embed). Confirmed by testing: typing never formats, but paste — a
// completely separate code path — works fine, and so does plain character
// insertion. This reimplements the same "detect a just-completed pattern
// and convert it" behavior via `appendTransaction` instead, which runs
// after *any* transaction lands regardless of which path inserted the
// text, reusing the exact same, official regexes/matchers those extensions
// use internally so what counts as a valid closing delimiter etc. stays
// identical to the rest of the app.
function applyRegexMark(textBefore: string, regex: RegExp, markType: MarkType, tr: Transaction, blockStart: number): boolean {
  const match = regex.exec(textBefore);
  if (!match) return false;
  const fullMatch = match[0];
  const captureGroup = match[match.length - 1];
  if (!captureGroup) return false;
  const matchStart = blockStart + (textBefore.length - fullMatch.length);
  const matchEnd = blockStart + textBefore.length;
  const startSpaces = fullMatch.search(/\S/);
  const textStart = matchStart + fullMatch.indexOf(captureGroup);
  const textEnd = textStart + captureGroup.length;
  // Delete the trailing delimiter first, then the leading one — in that
  // order so the second `tr.delete` call's positions (both before the
  // first deleted range) stay valid without needing to re-map them.
  if (textEnd < matchEnd) tr.delete(textEnd, matchEnd);
  if (textStart > matchStart) tr.delete(matchStart + startSpaces, textStart);
  const markEnd = matchStart + startSpaces + captureGroup.length;
  tr.addMark(matchStart + startSpaces, markEnd, markType.create());
  return true;
}

function applyCodeMark(textBefore: string, markType: MarkType, tr: Transaction, blockStart: number): boolean {
  const result = codeInputMatch(textBefore);
  if (!result || !result.replaceWith) return false;
  const { index, text, replaceWith } = result;
  const matchStart = blockStart + index;
  const matchEnd = matchStart + text.length;
  const contentStart = matchStart + text.indexOf(replaceWith);
  const contentEnd = contentStart + replaceWith.length;
  if (contentEnd < matchEnd) tr.delete(contentEnd, matchEnd);
  if (contentStart > matchStart) tr.delete(matchStart, contentStart);
  tr.addMark(matchStart, matchStart + replaceWith.length, markType.create());
  return true;
}

export const LiveInlineFormatting = Extension.create({
  name: "liveInlineFormatting",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("liveInlineFormatting"),
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some(tr => tr.docChanged)) return null;
          if (transactions.some(tr => tr.getMeta("liveInlineFormatting"))) return null;

          const { selection, schema } = newState;
          if (!selection.empty) return null;
          const $pos = selection.$from;
          if (!$pos.parent.isTextblock) return null;

          const textBefore = $pos.parent.textBetween(0, $pos.parentOffset, undefined, "￼");
          const blockStart = $pos.start();
          const tr = newState.tr;

          const applied = (schema.marks.bold && (
            applyRegexMark(textBefore, boldStarRegex, schema.marks.bold, tr, blockStart)
            || applyRegexMark(textBefore, boldUnderscoreRegex, schema.marks.bold, tr, blockStart)
          ))
            || (schema.marks.italic && (
              applyRegexMark(textBefore, italicStarRegex, schema.marks.italic, tr, blockStart)
              || applyRegexMark(textBefore, italicUnderscoreRegex, schema.marks.italic, tr, blockStart)
            ))
            || (schema.marks.code && applyCodeMark(textBefore, schema.marks.code, tr, blockStart));

          if (!applied) return null;
          tr.setMeta("liveInlineFormatting", true);
          return tr;
        },
      }),
    ];
  },
});
