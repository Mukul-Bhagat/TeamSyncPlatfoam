import { useState, useRef, type KeyboardEvent } from 'react';
import { Paperclip, Smile, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageEditorProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageEditor({
  onSend,
  disabled = false,
  placeholder = 'Message #channel',
}: MessageEditorProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="p-4 border-t border-glass-border bg-glass/30 backdrop-blur-glass-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-2 bg-glass border border-glass-border rounded-lg p-2">
          {/* Attachment Button */}
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'p-2 rounded-lg transition-colors duration-fast',
              'hover:bg-muted',
              'text-muted-foreground hover:text-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 min-h-[40px] max-h-[200px] px-2 py-2',
              'bg-transparent border-none outline-none resize-none',
              'text-sm text-foreground placeholder:text-muted-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            style={{ height: 'auto' }}
          />

          {/* Emoji Button */}
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'p-2 rounded-lg transition-colors duration-fast',
              'hover:bg-muted',
              'text-muted-foreground hover:text-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            className={cn(
              'p-2 rounded-lg transition-all duration-fast',
              'bg-primary text-primary-foreground',
              'hover:opacity-90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}
