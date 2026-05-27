import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div
      className={cn(
        'relative w-full',
        'transition-all duration-fast',
        focused && 'scale-[1.02]',
        className
      )}
    >
      <Search
        className={cn(
          'absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-fast',
          focused ? 'text-primary' : 'text-muted-foreground'
        )}
      />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-10 pr-10 py-2',
          'bg-background border rounded-lg',
          'text-sm text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          'transition-all duration-fast',
          'shadow-sm',
          focused && 'shadow-elevation-md'
        )}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted transition-colors duration-fast"
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
