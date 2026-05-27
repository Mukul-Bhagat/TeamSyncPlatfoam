import { create } from 'zustand';

interface PanelState {
  // Left sidebar state
  leftSidebarCollapsed: boolean;
  leftSidebarWidth: number;
  
  // Right panel state
  rightPanelCollapsed: boolean;
  rightPanelWidth: number;
  
  // Mobile drawer states
  leftSidebarMobileOpen: boolean;
  rightPanelMobileOpen: boolean;
  
  // Actions
  toggleLeftSidebar: () => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  setLeftSidebarWidth: (width: number) => void;
  
  toggleRightPanel: () => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setRightPanelWidth: (width: number) => void;
  
  toggleLeftSidebarMobile: () => void;
  setLeftSidebarMobileOpen: (open: boolean) => void;
  
  toggleRightPanelMobile: () => void;
  setRightPanelMobileOpen: (open: boolean) => void;
  
  resetPanels: () => void;
}

const defaultPanelWidths = {
  leftSidebar: 280,
  rightPanel: 350,
};

export const usePanelStore = create<PanelState>((set) => ({
  // Initial state
  leftSidebarCollapsed: false,
  leftSidebarWidth: defaultPanelWidths.leftSidebar,
  
  rightPanelCollapsed: false,
  rightPanelWidth: defaultPanelWidths.rightPanel,
  
  leftSidebarMobileOpen: false,
  rightPanelMobileOpen: false,
  
  // Left sidebar actions
  toggleLeftSidebar: () =>
    set((state) => ({
      leftSidebarCollapsed: !state.leftSidebarCollapsed,
    })),
  
  setLeftSidebarCollapsed: (collapsed) =>
    set({ leftSidebarCollapsed: collapsed }),
  
  setLeftSidebarWidth: (width) =>
    set({ leftSidebarWidth: width }),
  
  // Right panel actions
  toggleRightPanel: () =>
    set((state) => ({
      rightPanelCollapsed: !state.rightPanelCollapsed,
    })),
  
  setRightPanelCollapsed: (collapsed) =>
    set({ rightPanelCollapsed: collapsed }),
  
  setRightPanelWidth: (width) =>
    set({ rightPanelWidth: width }),
  
  // Mobile drawer actions
  toggleLeftSidebarMobile: () =>
    set((state) => ({
      leftSidebarMobileOpen: !state.leftSidebarMobileOpen,
    })),
  
  setLeftSidebarMobileOpen: (open) =>
    set({ leftSidebarMobileOpen: open }),
  
  toggleRightPanelMobile: () =>
    set((state) => ({
      rightPanelMobileOpen: !state.rightPanelMobileOpen,
    })),
  
  setRightPanelMobileOpen: (open) =>
    set({ rightPanelMobileOpen: open }),
  
  // Reset to defaults
  resetPanels: () =>
    set({
      leftSidebarCollapsed: false,
      leftSidebarWidth: defaultPanelWidths.leftSidebar,
      rightPanelCollapsed: false,
      rightPanelWidth: defaultPanelWidths.rightPanel,
      leftSidebarMobileOpen: false,
      rightPanelMobileOpen: false,
    }),
}));
