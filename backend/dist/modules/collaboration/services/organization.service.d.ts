export declare class OrganizationService {
    private supabase;
    constructor();
    getOrganizations(userId: string): Promise<any[]>;
    getOrganizationById(orgId: string, userId: string): Promise<any>;
    createOrganization(userId: string, name: string, slug: string, logoUrl?: string): Promise<any>;
    updateOrganization(orgId: string, userId: string, updateData: any): Promise<any>;
    deleteOrganization(orgId: string, userId: string): Promise<void>;
    getOrganizationMembers(orgId: string, userId: string): Promise<any[]>;
    addOrganizationMember(orgId: string, userId: string, targetEmail: string, role?: string): Promise<any>;
    removeOrganizationMember(orgId: string, userId: string, targetUserId: string): Promise<void>;
    updateOrganizationMemberRole(orgId: string, userId: string, targetUserId: string, role: string): Promise<any>;
    private getMember;
}
//# sourceMappingURL=organization.service.d.ts.map