import { useEffect, useRef, type ClipboardEventHandler, type KeyboardEventHandler } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
  Code2,
  Undo2,
  Redo2,
  Eraser,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  looksLikeMarkdown,
  markdownToRichTextHtml,
  sanitizeRichTextHtml,
} from '@/lib/qaRichText';

interface RichTextEditorProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const sync = () => {
    const html = sanitizeRichTextHtml(editorRef.current?.innerHTML || '');
    onChange(html);
  };

  const run = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    sync();
    editorRef.current?.focus();
  };

  const handleInput = () => {
    sync();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    run('createLink', url);
  };

  const applyMarkdownFromPrompt = () => {
    const text = window.prompt('Paste markdown to convert to rich text');
    if (!text) return;
    const html = markdownToRichTextHtml(text);
    run('insertHTML', html);
  };

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = (event) => {
    const text = event.clipboardData.getData('text/plain');
    const html = event.clipboardData.getData('text/html');

    if (html || !text || !looksLikeMarkdown(text)) return;

    event.preventDefault();
    run('insertHTML', markdownToRichTextHtml(text));
  };

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const withMeta = event.metaKey || event.ctrlKey;
    if (!withMeta) return;

    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      run('bold');
    }
    if (key === 'i') {
      event.preventDefault();
      run('italic');
    }
    if (key === 'u') {
      event.preventDefault();
      run('underline');
    }
    if (key === 'k') {
      event.preventDefault();
      insertLink();
    }
  };

  return (
    <div className={cn('border border-input rounded-md overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('bold')} title="Bold (Ctrl/Cmd + B)">
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('italic')} title="Italic (Ctrl/Cmd + I)">
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('underline')} title="Underline (Ctrl/Cmd + U)">
          <Underline className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('strikeThrough')} title="Strikethrough">
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-0.5" />

        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('formatBlock', 'h1')} title="Heading 1">
          <Heading1 className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('formatBlock', 'h2')} title="Heading 2">
          <Heading2 className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('formatBlock', 'blockquote')} title="Blockquote">
          <Quote className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('formatBlock', 'pre')} title="Code block">
          <Code2 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-0.5" />

        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('insertUnorderedList')} title="Bullet list">
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('insertOrderedList')} title="Numbered list">
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={insertLink} title="Insert link (Ctrl/Cmd + K)">
          <LinkIcon className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-0.5" />

        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('undo')} title="Undo">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('redo')} title="Redo">
          <Redo2 className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('removeFormat')} title="Clear formatting">
          <Eraser className="h-3.5 w-3.5" />
        </Button>

        <Button type="button" size="sm" variant="ghost" className="h-7 gap-1 px-2 ml-auto text-xs" onClick={applyMarkdownFromPrompt} title="Convert markdown and insert">
          <Sparkles className="h-3.5 w-3.5" />
          Markdown
        </Button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label="Answer editor"
        className="min-h-[140px] p-3 text-sm leading-relaxed focus:outline-none [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-muted-foreground [&:empty:before]:pointer-events-none"
        data-placeholder={placeholder}
        onInput={handleInput}
        onBlur={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
