import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Heading1, Heading2, Quote, List, ListOrdered, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

type MarkdownAction = 'bold' | 'italic' | 'h1' | 'h2' | 'quote' | 'ul' | 'ol' | 'hr';

const toolbarButtons: { action: MarkdownAction; icon: React.ElementType; label: string }[] = [
  { action: 'bold', icon: Bold, label: 'Bold' },
  { action: 'italic', icon: Italic, label: 'Italic' },
  { action: 'h1', icon: Heading1, label: 'Heading 1' },
  { action: 'h2', icon: Heading2, label: 'Heading 2' },
  { action: 'quote', icon: Quote, label: 'Quote' },
  { action: 'ul', icon: List, label: 'Bullet List' },
  { action: 'ol', icon: ListOrdered, label: 'Numbered List' },
  { action: 'hr', icon: Minus, label: 'Divider' },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your content...',
  className,
  minHeight = '400px',
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const updateSelection = useCallback(() => {
    if (textareaRef.current) {
      setSelectionStart(textareaRef.current.selectionStart);
      setSelectionEnd(textareaRef.current.selectionEnd);
    }
  }, []);

  const insertMarkdown = useCallback((action: MarkdownAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    let newText = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        newText = `${beforeText}**${selectedText || 'bold text'}**${afterText}`;
        cursorOffset = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        newText = `${beforeText}*${selectedText || 'italic text'}*${afterText}`;
        cursorOffset = selectedText ? end + 2 : start + 1;
        break;
      case 'h1':
        // Add newline before if not at start of line
        const h1Prefix = beforeText.endsWith('\n') || beforeText === '' ? '' : '\n';
        newText = `${beforeText}${h1Prefix}# ${selectedText || 'Heading 1'}\n${afterText}`;
        cursorOffset = start + h1Prefix.length + 2;
        break;
      case 'h2':
        const h2Prefix = beforeText.endsWith('\n') || beforeText === '' ? '' : '\n';
        newText = `${beforeText}${h2Prefix}## ${selectedText || 'Heading 2'}\n${afterText}`;
        cursorOffset = start + h2Prefix.length + 3;
        break;
      case 'quote':
        const quotePrefix = beforeText.endsWith('\n') || beforeText === '' ? '' : '\n';
        newText = `${beforeText}${quotePrefix}> ${selectedText || 'Quote'}\n${afterText}`;
        cursorOffset = start + quotePrefix.length + 2;
        break;
      case 'ul':
        const ulPrefix = beforeText.endsWith('\n') || beforeText === '' ? '' : '\n';
        newText = `${beforeText}${ulPrefix}- ${selectedText || 'List item'}\n${afterText}`;
        cursorOffset = start + ulPrefix.length + 2;
        break;
      case 'ol':
        const olPrefix = beforeText.endsWith('\n') || beforeText === '' ? '' : '\n';
        newText = `${beforeText}${olPrefix}1. ${selectedText || 'List item'}\n${afterText}`;
        cursorOffset = start + olPrefix.length + 3;
        break;
      case 'hr':
        const hrPrefix = beforeText.endsWith('\n') || beforeText === '' ? '' : '\n';
        newText = `${beforeText}${hrPrefix}---\n${afterText}`;
        cursorOffset = start + hrPrefix.length + 4;
        break;
      default:
        return;
    }

    onChange(newText);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      if (!selectedText || action === 'hr') {
        textarea.setSelectionRange(cursorOffset, cursorOffset);
      }
    }, 0);
  }, [value, onChange]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 border border-border rounded-lg bg-muted/30 flex-wrap">
        {toolbarButtons.map(({ action, icon: Icon, label }) => (
          <Button
            key={action}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown(action)}
            className="h-8 w-8 p-0 hover:bg-secondary"
            title={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground pr-2">Markdown supported</span>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={updateSelection}
        onKeyUp={updateSelection}
        onClick={updateSelection}
        placeholder={placeholder}
        className={cn("resize-y leading-relaxed font-mono text-sm", className)}
        style={{ minHeight }}
      />

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Use **bold**, *italic*, # headings, &gt; quotes, - lists
      </p>
    </div>
  );
}
