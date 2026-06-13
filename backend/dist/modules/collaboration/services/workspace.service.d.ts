export declare class WorkspaceService {
    private supabase;
    constructor();
    getWorkspaces(orgId: string | null, userId: string): Promise<any[]>;
    getWorkspaceById(workspaceId: string, userId: string): Promise<any>;
    createWorkspace(userId: string, orgId: string | null, name: string, slug: string, description?: string, icon?: string): Promise<any>;
    updateWorkspace(workspaceId: string, userId: string, updateData: any): Promise<any>;
    deleteWorkspace(workspaceId: string, userId: string): Promise<void>;
    getWorkspaceMembers(workspaceId: string, userId: string): Promise<any[]>;
    addWorkspaceMember(workspaceId: string, userId: string, targetEmail: string, role?: string): Promise<any>;
    removeWorkspaceMember(workspaceId: string, userId: string, targetUserId: string): Promise<void>;
    private getMember;
}
//# sourceMappingURL=workspace.service.d.ts.map