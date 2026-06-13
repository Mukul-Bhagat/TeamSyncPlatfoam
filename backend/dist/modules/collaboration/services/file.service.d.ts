import { ProjectFile, PaginationParams, PaginatedResponse } from '../types';
export declare class FileService {
    private supabase;
    constructor();
    getProjectFiles(projectId: string, _userId: string, params?: PaginationParams & {
        folder_id?: string;
        file_type?: string;
        search?: string;
    }): Promise<PaginatedResponse<ProjectFile>>;
    getFileById(fileId: string, userId: string): Promise<ProjectFile>;
    uploadFile(projectId: string, _userId: string, file: {
        name: string;
        type: string;
        size: number;
        buffer: Buffer;
    }, folderId?: string): Promise<ProjectFile>;
    createFolder(projectId: string, userId: string, name: string, folderId?: string): Promise<ProjectFile>;
    updateFile(fileId: string, _userId: string, updates: {
        file_name?: string;
        folder_id?: string;
    }): Promise<ProjectFile>;
    deleteFile(fileId: string, userId: string): Promise<void>;
    downloadFile(fileId: string, userId: string): Promise<{
        url: string;
        fileName: string;
    }>;
    getFileVersions(fileId: string, _userId: string): Promise<any[]>;
    uploadFileVersion(fileId: string, userId: string, file: {
        name: string;
        type: string;
        size: number;
        buffer: Buffer;
    }, changeNotes?: string): Promise<any>;
    restoreFileVersion(fileId: string, versionId: string, _userId: string): Promise<ProjectFile>;
}
//# sourceMappingURL=file.service.d.ts.map