import { useState } from "react";
import { MarkdownLiveEditor } from "markdown-live-editor";

const STARTER_CONTENT = `# markdown-live-editor

Try it out:

- Hover the left edge of a line for the drag handle, then drag to reorder blocks.
- Type \`/\` for the slash command menu.
- Select some text and right-click for the formatting menu.
- Type \`**bold**\`, \`*italic*\`, \`- a list\`, or \`# a heading\` and watch it format live.

This is the editor with **no custom extensions** — a real app would pass its own
via the \`extensions\` prop (e.g. a page-gallery block, an image block, whatever
else) and its own "/" menu entries for them via \`slashGroups\`.`;

export default function App() {
  const [content, setContent] = useState(STARTER_CONTENT);

  return (
    <div className="h-screen flex flex-col bg-base">
      <header className="shrink-0 px-4 py-3 border-b border-gold-500/20">
        <h1 className="text-gold-300 text-sm font-semibold">markdown-live-editor</h1>
      </header>
      <main className="flex-1 min-h-0 flex flex-col">
        <MarkdownLiveEditor content={content} onChange={setContent} />
      </main>
    </div>
  );
}
