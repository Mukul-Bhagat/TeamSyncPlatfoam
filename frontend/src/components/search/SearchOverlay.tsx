import { useState, useEffect } from 'react';
import { SearchCommand } from './SearchCommand';

interface SearchOverlayProps {
  organizationId: string;
  workspaceId?: string;
}

export function SearchOverlay({ organizationId, workspaceId }: SearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SearchCommand
        organizationId={organizationId}
        workspaceId={workspaceId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
