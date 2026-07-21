"use client";

import { useEffect, useRef, useState, type ReactNode, type ChangeEvent } from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import { TextStyle }from "@tiptap/extension-text-style";
import { Markdown } from "@tiptap/markdown";

import {
  Box,
  Button,
  Divider,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import CodeIcon from "@mui/icons-material/Code";
import TitleIcon from "@mui/icons-material/Title";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ChecklistIcon from "@mui/icons-material/Checklist";
import LinkIcon from "@mui/icons-material/Link";
import ImageIcon from "@mui/icons-material/Image";
import TableChartIcon from "@mui/icons-material/TableChart";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import HighlightIcon from "@mui/icons-material/Highlight";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

function ToolButton({
  active = false,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title} arrow>
      <Button
        onClick={onClick}
        variant={active ? "contained" : "outlined"}
        size="small"
        sx={{
          minWidth: 40,
          height: 40,
          px: 1.2,
          borderRadius: 2,
          textTransform: "none",
          color: "white",
          borderColor: active ? "rgba(139,92,246,.85)" : "rgba(255,255,255,.14)",
          bgcolor: active ? "rgba(139,92,246,.22)" : "rgba(255,255,255,.03)",
          backdropFilter: "blur(12px)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,.08)",
            borderColor: "rgba(255,255,255,.28)",
          },
        }}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

function getBlockType(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return "paragraph";

  if (editor.isActive("heading", { level: 1 })) return "h1";
  if (editor.isActive("heading", { level: 2 })) return "h2";
  if (editor.isActive("heading", { level: 3 })) return "h3";
  if (editor.isActive("blockquote")) return "quote";
  if (editor.isActive("codeBlock")) return "code";
  return "paragraph";
}

export default function Editor({ value, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [blockType, setBlockType] = useState("paragraph");
  const [fontFamily, setFontFamily] = useState("Inter");

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      Color,
      FontFamily,
      TaskList,
      TaskItem,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      Markdown,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const syncBlockType = () => {
      setBlockType(getBlockType(editor));
    };

    editor.on("selectionUpdate", syncBlockType);
    editor.on("transaction", syncBlockType);

    return () => {
      editor.off("selectionUpdate", syncBlockType);
      editor.off("transaction", syncBlockType);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const countCharacters = () => {
    const storage = editor.storage.characterCount;
    return typeof storage?.characters === "function" ? storage.characters() : 0;
  };

  const countWords = () => {
    const storage = editor.storage.characterCount;
    return typeof storage?.words === "function" ? storage.words() : 0;
  };

  const setBlock = (next: string) => {
    setBlockType(next);

    if (next === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    if (next === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      return;
    }

    if (next === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }

    if (next === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      return;
    }

    if (next === "quote") {
      editor.chain().focus().toggleBlockquote().run();
      return;
    }

    if (next === "code") {
      editor.chain().focus().toggleCodeBlock().run();
    }
  };

  const handleInsertLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter link URL", previousUrl ?? "");

    if (url === null) return;

    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const handleInsertImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleDownloadMarkdown = () => {
    const markdown = (editor as typeof editor & { getMarkdown?: () => string }).getMarkdown?.() ?? "";
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lit-write.md";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 4,
        background: "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
        backdropFilter: "blur(20px)",
        overflow: "hidden",
        boxShadow: "0 24px 90px rgba(0,0,0,.35)",
      }}
    >
      <Box
        sx={{
          p: 1.5,
          borderBottom: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: 1.25,
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(2,6,23,.55)",
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <ToolButton
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <UndoIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <RedoIcon fontSize="small" />
          </ToolButton>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          <TextField
            select
            size="small"
            value={blockType}
            onChange={(e) => setBlock(e.target.value)}
            sx={{
              width: 150,
              "& .MuiInputBase-root": {
                color: "white",
                bgcolor: "rgba(255,255,255,.03)",
                borderRadius: 2,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,.12)",
              },
              "& .MuiSvgIcon-root": {
                color: "rgba(255,255,255,.7)",
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,.65)",
              },
            }}
            label="Block"
          >
            <MenuItem value="paragraph">Paragraph</MenuItem>
            <MenuItem value="h1">Heading 1</MenuItem>
            <MenuItem value="h2">Heading 2</MenuItem>
            <MenuItem value="h3">Heading 3</MenuItem>
            <MenuItem value="quote">Quote</MenuItem>
            <MenuItem value="code">Code block</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={fontFamily}
            onChange={(e) => {
              const next = e.target.value;
              setFontFamily(next);
              editor.chain().focus().setFontFamily(next).run();
            }}
            sx={{
              width: 170,
              "& .MuiInputBase-root": {
                color: "white",
                bgcolor: "rgba(255,255,255,.03)",
                borderRadius: 2,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,.12)",
              },
              "& .MuiSvgIcon-root": {
                color: "rgba(255,255,255,.7)",
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255,255,255,.65)",
              },
            }}
            label="Font"
          >
            <MenuItem value="Inter">Inter</MenuItem>
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Georgia">Georgia</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier New">Courier New</MenuItem>
          </TextField>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          <ToolButton
            title="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <FormatBoldIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <FormatItalicIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <FormatUnderlinedIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Strike"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughSIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Inline code"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <CodeIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Highlight"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <HighlightIcon fontSize="small" />
          </ToolButton>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          <ToolButton
            title="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <FormatListBulletedIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <FormatListNumberedIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Task list"
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ChecklistIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <FormatQuoteIcon fontSize="small" />
          </ToolButton>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          <ToolButton
            title="Align left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <FormatAlignLeftIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <FormatAlignCenterIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <FormatAlignRightIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Justify"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <FormatAlignJustifyIcon fontSize="small" />
          </ToolButton>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          <ToolButton
            title="Insert link"
            active={editor.isActive("link")}
            onClick={handleInsertLink}
          >
            <LinkIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Insert image"
            onClick={handleInsertImage}
          >
            <ImageIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Insert table"
            onClick={() =>
              editor.chain().focus().insertTable({
                rows: 3,
                cols: 3,
                withHeaderRow: true,
              }).run()
            }
          >
            <TableChartIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Add row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <TitleIcon fontSize="small" sx={{ transform: "rotate(90deg)" }} />
          </ToolButton>

          <ToolButton
            title="Add column"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <TitleIcon fontSize="small" />
          </ToolButton>

          <ToolButton
            title="Delete table"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </ToolButton>

          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Text color" arrow>
              <Box
                component="label"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,.14)",
                  bgcolor: "rgba(255,255,255,.03)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <input
                  type="color"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: "pointer",
                  }}
                />
              </Box>
            </Tooltip>

            <ToolButton
              title="Clear text color"
              onClick={() => editor.chain().focus().unsetColor().run()}
            >
              <ClearIcon fontSize="small" />
            </ToolButton>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Typography sx={{ color: "rgba(255,255,255,.68)", fontSize: 13 }}>
            {countWords()} words
          </Typography>

          <Typography sx={{ color: "rgba(255,255,255,.45)", fontSize: 13 }}>
            {countCharacters()} characters
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={handleDownloadMarkdown}
            startIcon={<DownloadIcon />}
            variant="outlined"
            size="small"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,.14)",
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "rgba(255,255,255,.03)",
              "&:hover": {
                borderColor: "rgba(255,255,255,.28)",
                bgcolor: "rgba(255,255,255,.08)",
              },
            }}
          >
            Export Markdown
          </Button>

          <Button
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            startIcon={<ClearIcon />}
            variant="outlined"
            size="small"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,.14)",
              borderRadius: 2,
              textTransform: "none",
              bgcolor: "rgba(255,255,255,.03)",
              "&:hover": {
                borderColor: "rgba(255,255,255,.28)",
                bgcolor: "rgba(255,255,255,.08)",
              },
            }}
          >
            Clear formatting
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          p: 3,
          minHeight: 520,
          background: "rgba(255,255,255,.02)",
          "& .ProseMirror": {
            minHeight: 460,
            outline: "none",
            color: "white",
            fontSize: "1.05rem",
            lineHeight: 1.85,
          },
          "& .ProseMirror p.is-editor-empty:first-of-type::before": {
            color: "rgba(255,255,255,.35)",
            content: "attr(data-placeholder)",
            float: "left",
            height: 0,
            pointerEvents: "none",
          },
          "& .ProseMirror h1": {
            fontSize: "2.4rem",
            lineHeight: 1.15,
            marginTop: "1.25rem",
            marginBottom: "0.75rem",
          },
          "& .ProseMirror h2": {
            fontSize: "1.8rem",
            lineHeight: 1.2,
            marginTop: "1.1rem",
            marginBottom: "0.65rem",
          },
          "& .ProseMirror h3": {
            fontSize: "1.35rem",
            lineHeight: 1.25,
            marginTop: "1rem",
            marginBottom: "0.55rem",
          },
          "& .ProseMirror blockquote": {
            borderLeft: "4px solid rgba(139,92,246,.8)",
            paddingLeft: "1rem",
            marginLeft: 0,
            color: "rgba(255,255,255,.78)",
            fontStyle: "italic",
          },
          "& .ProseMirror code": {
            background: "rgba(255,255,255,.08)",
            borderRadius: 6,
            padding: "0.15rem 0.35rem",
            fontSize: "0.95em",
          },
          "& .ProseMirror pre": {
            background: "rgba(15,23,42,.9)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 14,
            padding: "1rem 1.1rem",
            overflowX: "auto",
          },
          "& .ProseMirror a": {
            color: "#8b5cf6",
            textDecoration: "underline",
          },
          "& .ProseMirror ul, & .ProseMirror ol": {
            paddingLeft: "1.3rem",
          },
          "& .ProseMirror table": {
            width: "100%",
            borderCollapse: "collapse",
            margin: "1rem 0",
            overflow: "hidden",
            tableLayout: "fixed",
          },
          "& .ProseMirror th, & .ProseMirror td": {
            border: "1px solid rgba(255,255,255,.10)",
            padding: "0.6rem 0.75rem",
            verticalAlign: "top",
          },
          "& .ProseMirror img": {
            maxWidth: "100%",
            borderRadius: 16,
            display: "block",
          },
          "& .ProseMirror .task-list-item": {
            listStyle: "none",
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageFile}
      />
    </Box>
  );
}