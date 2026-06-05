import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceContextState {
  organizationId: string | null;
  workspaceId: string | null;
  channelId: string | null;
  projectId: string | null;
  setOrganizationId: (organizationId: string | null) => void;
  setWorkspaceId: (workspaceId: string | null) => void;
  setChannelId: (channelId: string | null) => void;
  setProjectId: (projectId: string | null) => void;
  resetContext: () => void;
}

export const useWorkspaceContextStore = create<WorkspaceContextState>()(
  persist(
    (set) => ({
      organizationId: null,
      workspaceId: null,
      channelId: null,
      projectId: null,
      setOrganizationId: (organizationId) =>
        set({
          organizationId,
          workspaceId: null,
          channelId: null,
          projectId: null,
        }),
      setWorkspaceId: (workspaceId) =>
        set({
          workspaceId,
          channelId: null,
          projectId: null,
        }),
      setChannelId: (channelId) => set({ channelId }),
      setProjectId: (projectId) => set({ projectId }),
      resetContext: () =>
        set({
          organizationId: null,
          workspaceId: null,
          channelId: null,
          projectId: null,
        }),
    }),
    {
      name: 'teamsync-workspace-context',
    }
  )
);
