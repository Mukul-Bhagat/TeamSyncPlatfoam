import { useState, useEffect, useRef } from 'react';
import { workflowService } from '../../services/workflow.service';
import { Input } from '../../../components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Badge } from '../../../components/ui/badge';
import { Search, Terminal } from 'lucide-react';

interface CommandPaletteProps {
  onSelectCommand?: (command: string) => void;
}

export function CommandPalette({ onSelectCommand }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [commands, setCommands] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedCommand, setSelectedCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      loadCommands();
      inputRef.current?.focus();
    }
  }, [open]);

  const loadCommands = async () => {
    try {
      const data = await workflowService.getAvailableCommands();
      setCommands(data.commands);
    } catch (error) {
      console.error('Failed to load commands:', error);
    }
  };

  const executeCommand = async (command: string) => {
    try {
      const result = await workflowService.executeCommand(command, {});
      setHistory([command, ...history.slice(0, 9)]);
      setSelectedCommand('');
      setSearch('');
      setOpen(false);
      onSelectCommand?.(command);
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  const filteredCommands = commands.filter((cmd) =>
    cmd.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-muted-foreground">
          <Terminal className="mr-2 h-4 w-4" />
          Execute command...
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={inputRef}
              placeholder="Search commands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full border-0 bg-transparent focus:ring-0 focus-visible:ring-0"
            />
          </div>
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            {history.length > 0 && (
              <CommandGroup heading="Recent">
                {history.map((cmd) => (
                  <CommandItem
                    key={cmd}
                    value={cmd}
                    onSelect={() => executeCommand(cmd)}
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    <span>{cmd}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Available Commands">
              {filteredCommands.map((cmd) => (
                <CommandItem
                  key={cmd}
                  value={cmd}
                  onSelect={() => executeCommand(cmd)}
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  <span>{cmd}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
