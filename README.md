# markdown-live-editor

A live, WYSIWYG-style markdown editor built on [Tiptap](https://tiptap.dev)/ProseMirror — real block elements (headings, paragraphs, lists, tables) instead of a plain-text buffer with syntax hidden/revealed via decorations. The document round-trips to/from a plain markdown string.

Ships **no embeds of its own** — page galleries, images, custom blocks, whatever else, are entirely up to whatever app uses this. Bring your own Tiptap node extensions via the `extensions` prop, and your own extra "/" slash-menu entries for them via `slashGroups`.

## What's included

- A Notion-style hover handle for drag-to-reorder blocks, with a cursor-following ghost preview.
- A "/" slash command menu (built-in text formatting defaults: headings, bold/italic, lists, quote, code, divider, table).
- A floating formatting card (bold/italic/strike/code) that appears above the selection as soon as text is selected.
- A placeholder ("New Page") shown only when the whole document is empty.
- A fix for a real Tiptap quirk: input rules (`**bold**`, `- list`, etc.) don't fire reliably when this editor is nested inside another instance's own custom node (e.g. a "card" embed whose content is itself a nested editor) — `inputRuleRelay.ts` works around it.

## Usage

```tsx
import { MarkdownLiveEditor } from "markdown-live-editor";

function MyPage() {
  const [content, setContent] = useState("# Hello");
  return (
    <MarkdownLiveEditor
      content={content}
      onChange={setContent}
      extensions={[MyCustomEmbedNode]} // your own Tiptap nodes, if any
      slashGroups={[myCustomSlashGroup]} // your own "/" menu entries for them
      styles={{ h1: "text-3xl font-bold" }} // override any of the defaults
    />
  );
}
```

Anything a custom embed node needs at render time (ids, callbacks, app data) is entirely up to the consumer — e.g. wrap `<MarkdownLiveEditor>` in your own React Context provider. Tiptap NodeView portals render inside the same React tree this component renders in, so context from an ancestor of `<MarkdownLiveEditor>` is visible inside them.

## Developing

This is a pnpm workspace: the library itself at the repo root, plus an `example/` app for interactively testing changes.

```sh
pnpm install
pnpm --filter example dev
```

Edits to `src/` hot-reload straight into the example app — no build/link step needed during development.

## Publishing

Not yet built for distribution — `main`/`types` currently point straight at `src/`, which works for a workspace consumer (Vite/bundler-mode resolution transpiles it directly) but isn't what you'd want published to npm. Add a build step (`tsup` or Vite library mode) emitting `dist/` before `npm publish`.
