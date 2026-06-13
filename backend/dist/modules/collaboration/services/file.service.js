"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileService = void 0;
// File Service
const supabase_js_1 = require("@supabase/supabase-js");
class FileService {
    supabase;
    constructor() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async getProjectFiles(projectId, _userId, params) {
        const { page = 1, limit = 50, folder_id, file_type, search } = params || {};
        const offset = (page - 1) * limit;
        let query = this.supabase
            .from('project_files')
            .select('*, uploaded_by:profiles(full_name, avatar_url)', { count: 'exact' })
            .eq('project_id', projectId)
            .is('deleted_at', null);
        if (folder_id) {
            query = query.eq('folder_id', folder_id);
        }
        if (file_type) {
            query = query.eq('file_type', file_type);
        }
        if (search) {
            query = query.ilike('file_name', `%${search}%`);
        }
        const { data, error, count } = await query
            .order('is_folder', { ascending: false })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch files: ${error.message}`);
        }
        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }
    async getFileById(fileId, userId) {
        const { data, error } = await this.supabase
            .from('project_files')
            .select('*, uploaded_by:profiles(full_name, avatar_url)')
            .eq('id', fileId)
            .is('deleted_at', null)
            .single();
        if (error) {
            throw new Error(`Failed to fetch file: ${error.message}`);
        }
        return data;
    }
    async uploadFile(projectId, _userId, file, folderId) {
        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `projects/${projectId}/${fileName}`;
        const { data: uploadData, error: uploadError } = await this.supabase.storage
            .from('project-files')
            .upload(filePath, file.buffer, {
            contentType: file.type,
            upsert: false
        });
        if (uploadError) {
            throw new Error(`Failed to upload file: ${uploadError.message}`);
        }
        // Get public URL
        const { data: { publicUrl } } = await this.supabase.storage
            .from('project-files')
            .getPublicUrl(filePath);
        // Create file record
        const { data, error } = await this.supabase
            .from('project_files')
            .insert({
            project_id: projectId,
            folder_id: folderId,
            uploaded_by: userId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl,
            storage_provider: 'supabase',
            storage_path: filePath,
            is_folder: false
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create file record: ${error.message}`);
        }
        return data;
    }
    async createFolder(projectId, userId, name, folderId) {
        const { data, error } = await this.supabase
            .from('project_files')
            .insert({
            project_id: projectId,
            folder_id: folderId,
            uploaded_by: userId,
            file_name: name,
            file_type: 'folder',
            file_size: 0,
            file_url: '',
            storage_provider: 'supabase',
            is_folder: true
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create folder: ${error.message}`);
        }
        return data;
    }
    async updateFile(fileId, _userId, updates) {
        const file = await this.getFileById(fileId, _userId);
        if (file.uploaded_by !== userId) {
            throw new Error('Access denied');
        }
        const { data, error } = await this.supabase
            .from('project_files')
            .update(updates)
            .eq('id', fileId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update file: ${error.message}`);
        }
        return data;
    }
    async deleteFile(fileId, userId) {
        const file = await this.getFileById(fileId, userId);
        if (file.uploaded_by !== userId) {
            throw new Error('Access denied');
        }
        // Soft delete
        const { error } = await this.supabase
            .from('project_files')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', fileId);
        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    async downloadFile(fileId, userId) {
        const file = await this.getFileById(fileId, userId);
        // Increment download count
        await this.supabase.rpc('increment_file_download_count', {
            p_file_id: fileId
        });
        return {
            url: file.file_url,
            fileName: file.file_name
        };
    }
    async getFileVersions(fileId, _userId) {
        const { data, error } = await this.supabase
            .from('project_file_versions')
            .select('*, uploaded_by:profiles(full_name, avatar_url)')
            .eq('file_id', fileId)
            .order('version', { ascending: false });
        if (error) {
            throw new Error(`Failed to fetch file versions: ${error.message}`);
        }
        return data || [];
    }
    async uploadFileVersion(fileId, userId, file, changeNotes) {
        const existingFile = await this.getFileById(fileId, userId);
        // Upload new version
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `projects/${existingFile.project_id}/versions/${fileId}/${fileName}`;
        const { error: uploadError } = await this.supabase.storage
            .from('project-files')
            .upload(filePath, file.buffer, {
            contentType: file.type,
            upsert: false
        });
        if (uploadError) {
            throw new Error(`Failed to upload file version: ${uploadError.message}`);
        }
        // Get public URL
        const { data: { publicUrl } } = await this.supabase.storage
            .from('project-files')
            .getPublicUrl(filePath);
        // Get next version number
        const { data: versions } = await this.supabase
            .from('project_file_versions')
            .select('version')
            .eq('file_id', fileId)
            .order('version', { ascending: false })
            .limit(1);
        const nextVersion = (versions?.[0]?.version || 0) + 1;
        // Create version record
        const { data, error } = await this.supabase
            .from('project_file_versions')
            .insert({
            file_id: fileId,
            version: nextVersion,
            file_url: publicUrl,
            file_size: file.size,
            uploaded_by: userId,
            change_notes: changeNotes
        })
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create file version: ${error.message}`);
        }
        // Update main file record
        await this.supabase
            .from('project_files')
            .update({
            file_url: publicUrl,
            file_size: file.size,
            version: nextVersion
        })
            .eq('id', fileId);
        return data;
    }
    async restoreFileVersion(fileId, versionId, _userId) {
        const file = await this.getFileById(fileId, _userId);
        if (file.uploaded_by !== userId) {
            throw new Error('Access denied');
        }
        // Get version to restore
        const { data: version } = await this.supabase
            .from('project_file_versions')
            .select('*')
            .eq('id', versionId)
            .single();
        if (!version) {
            throw new Error('Version not found');
        }
        // Update main file record
        const { data, error } = await this.supabase
            .from('project_files')
            .update({
            file_url: version.file_url,
            file_size: version.file_size,
            version: version.version
        })
            .eq('id', fileId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to restore file version: ${error.message}`);
        }
        return data;
    }
}
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map