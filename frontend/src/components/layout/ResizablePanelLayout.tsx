import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelLayoutProps {
  leftPanel?: ReactNode;
  centerPanel: ReactNode;
  rightPanel?: ReactNode;
  leftPanelWidth?: number;
  rightPanelWidth?: number;
  leftPanelMinWidth?: number;
  rightPanelMinWidth?: number;
  leftPanelMaxWidth?: number;
  rightPanelMaxWidth?: number;
  className?: string;
}

export function ResizablePanelLayout({
  leftPanel,
  centerPanel,
  rightPanel,
  leftPanelWidth = 280,
  rightPanelWidth = 350,
  leftPanelMinWidth = 200,
  rightPanelMinWidth = 250,
  leftPanelMaxWidth = 400,
  rightPanelMaxWidth = 500,
  className,
}: ResizablePanelLayoutProps) {
  return (
    <div className={cn('flex h-full w-full', className)}>
      {/* Left Panel */}
      {leftPanel && (
        <div
          className="flex-shrink-0 border-r bg-card/50 backdrop-blur-sm"
          style={{
            width: `${leftPanelWidth}px`,
            minWidth: `${leftPanelMinWidth}px`,
            maxWidth: `${leftPanelMaxWidth}px`,
          }}
        >
          {leftPanel}
        </div>
      )}

      {/* Center Panel */}
      <div className="flex-1 min-w-0">{centerPanel}</div>

      {/* Right Panel */}
      {rightPanel && (
        <div
          className="flex-shrink-0 border-l bg-card/50 backdrop-blur-sm"
          style={{
            width: `${rightPanelWidth}px`,
            minWidth: `${rightPanelMinWidth}px`,
            maxWidth: `${rightPanelMaxWidth}px`,
          }}
        >
          {rightPanel}
        </div>
      )}
    </div>
  );
}
