"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import { Icon } from "@iconify/react";
import { useEffect } from "react";

function ToolBtn({ onMouseDown, active, icon, title }) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      title={title}
      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
        active
          ? "bg-primary-100 text-primary-700"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      <Icon icon={icon} className="w-4 h-4" />
    </button>
  );
}

const Sep = () => (
  <div className="w-px h-4 bg-gray-200 mx-0.5 self-center flex-shrink-0" />
);

export default function RichTextEditor({
  value,
  onChange,
  error,
  placeholder = "Detailed product description...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Color,
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] max-h-80 overflow-y-auto px-4 py-3 text-sm text-gray-800 leading-relaxed focus:outline-none " +
          "[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-2 [&_h2]:mb-1 " +
          "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-1.5 [&_h3]:mb-0.5 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 " +
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 " +
          "[&_li]:my-0.5 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-primary-200 [&_blockquote]:pl-3 " +
          "[&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-2 " +
          "[&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through " +
          "[&_a]:text-primary-600 [&_a]:underline [&_p]:my-0.5",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  /* Sync external value on edit mode load */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    const next = value || "";
    if (current !== next && next !== "") {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const cmd = (fn) => (e) => {
    e.preventDefault();
    fn();
  };

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        error
          ? "border-red-400 bg-red-50/20 focus-within:ring-2 focus-within:ring-red-200"
          : "border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20"
      }`}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-100">
        {/* Text style */}
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleBold().run())}
          active={editor.isActive("bold")}
          icon="mdi:format-bold"
          title="Bold (Ctrl+B)"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleItalic().run())}
          active={editor.isActive("italic")}
          icon="mdi:format-italic"
          title="Italic (Ctrl+I)"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleUnderline().run())}
          active={editor.isActive("underline")}
          icon="mdi:format-underline"
          title="Underline (Ctrl+U)"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleStrike().run())}
          active={editor.isActive("strike")}
          icon="mdi:format-strikethrough"
          title="Strikethrough"
        />

        <Sep />

        {/* Headings */}
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          active={editor.isActive("heading", { level: 2 })}
          icon="mdi:format-header-2"
          title="Heading 2"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          active={editor.isActive("heading", { level: 3 })}
          icon="mdi:format-header-3"
          title="Heading 3"
        />

        <Sep />

        {/* Lists */}
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleBulletList().run())}
          active={editor.isActive("bulletList")}
          icon="mdi:format-list-bulleted"
          title="Bullet list"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleOrderedList().run())}
          active={editor.isActive("orderedList")}
          icon="mdi:format-list-numbered"
          title="Numbered list"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().toggleBlockquote().run())}
          active={editor.isActive("blockquote")}
          icon="mdi:format-quote-close"
          title="Blockquote"
        />

        <Sep />

        {/* Alignment */}
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().setTextAlign("left").run())}
          active={editor.isActive({ textAlign: "left" })}
          icon="mdi:format-align-left"
          title="Align left"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().setTextAlign("center").run())}
          active={editor.isActive({ textAlign: "center" })}
          icon="mdi:format-align-center"
          title="Align center"
        />
        <ToolBtn
          onMouseDown={cmd(() => editor.chain().focus().setTextAlign("right").run())}
          active={editor.isActive({ textAlign: "right" })}
          icon="mdi:format-align-right"
          title="Align right"
        />

        <Sep />

        {/* Link */}
        <ToolBtn
          onMouseDown={cmd(() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = window.prompt("Enter URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }
          })}
          active={editor.isActive("link")}
          icon="mdi:link-variant"
          title="Insert / remove link"
        />

        <Sep />

        {/* Clear */}
        <ToolBtn
          onMouseDown={cmd(() => {
            editor.chain().focus().unsetAllMarks().run();
            editor.chain().focus().clearNodes().run();
          })}
          icon="mdi:format-clear"
          title="Clear formatting"
        />
      </div>

      {/* ── Content ── */}
      <div className="relative bg-white">
        {editor.isEmpty && (
          <p className="absolute top-3 left-4 text-gray-400 text-sm pointer-events-none select-none z-10">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
