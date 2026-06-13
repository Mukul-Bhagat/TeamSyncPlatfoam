import { Project, ProjectMember, UpdateProjectDto, PaginationParams, PaginatedResponse, ProjectRole } from '../types';
export declare class ProjectService {
    private supabase;
    constructor();
    getProjects(userId: string, params?: PaginationParams & {
        status?: string;
        team_id?: string;
        search?: string;
    }): Promise<PaginatedResponse<Project>>;
    getProjectById(projectId: string, userId: string): Promise<Project>;
    createProject(userId: string, dto: any): Promise<Project>;
    updateProject(projectId: string, userId: string, dto: UpdateProjectDto): Promise<Project>;
    deleteProject(projectId: string, userId: string): Promise<void>;
    archiveProject(projectId: string, userId: string): Promise<Project>;
    getProjectMembers(projectId: string, userId: string, params?: PaginationParams & {
        role?: string;
        status?: string;
    }): Promise<PaginatedResponse<ProjectMember>>;
    addProjectMember(projectId: string, userId: string, email: string, role: ProjectRole): Promise<ProjectMember>;
    updateProjectMemberRole(projectId: string, memberId: string, userId: string, role: ProjectRole): Promise<ProjectMember>;
    removeProjectMember(projectId: string, memberId: string, userId: string): Promise<void>;
    getProjectStatistics(projectId: string, userId: string): Promise<any>;
    private getProjectMember;
    private getUserEmail;
}
//# sourceMappingURL=project.service.d.ts.map