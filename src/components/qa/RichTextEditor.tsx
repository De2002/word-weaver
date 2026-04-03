import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { sanitizeRichTextHtml } from '@/lib/qaRichText';

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

  const run = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    const html = sanitizeRichTextHtml(editorRef.current?.innerHTML || '');
    onChange(html);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const raw = editorRef.current?.innerHTML || '';
    onChange(sanitizeRichTextHtml(raw));
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL (https://...)');
    if (!url) return;
    run('createLink', url);
  };

  return (
    <div className={cn('border border-input rounded-md overflow-hidden', className)}>
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('bold')}>
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('italic')}>
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('underline')}>
          <Underline className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('strikeThrough')}>
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('insertUnorderedList')}>
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => run('insertOrderedList')}>
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={insertLink}>
          <LinkIcon className="h-3.5 w-3.5" />
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
      />
    </div>
  );
}
