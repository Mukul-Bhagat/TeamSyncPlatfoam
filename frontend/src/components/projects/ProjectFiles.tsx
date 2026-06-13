import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Loader2,
  FileText,
  Folder,
  Upload,
  Search,
  Trash2,
  Download,
  FolderPlus,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';

interface ProjectFilesProps {
  projectId: string;
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [fileVersions, setFileVersions] = useState<any[]>([]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (currentFolderId) params.folder_id = currentFolderId;
      if (searchQuery) params.search = searchQuery;

      const data = await api.get<any[]>(`/projects/${projectId}/files`, params);
      setFiles(data || []);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [projectId, currentFolderId, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          await api.post(`/projects/${projectId}/files`, {
            name: file.name,
            type: file.type,
            size: file.size,
            base64Data,
            folderId: currentFolderId || undefined,
          });
          toast.success('File uploaded successfully!');
          fetchFiles();
        } catch (err: any) {
          toast.error(err.message || 'Failed to upload file');
        } finally {
          setUploading(false);
        }
      };
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await api.post(`/projects/${projectId}/folders`, {
        name: newFolderName.trim(),
        folderId: currentFolderId || undefined,
      });
      toast.success('Folder created successfully!');
      setNewFolderName('');
      setShowFolderModal(false);
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create folder');
    }
  };

  const handleDeleteFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.del(`/files/${id}`);
      toast.success('Deleted successfully');
      if (selectedFile?.id === id) setSelectedFile(null);
      fetchFiles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleFolderClick = (folder: any) => {
    setFolderPath((prev) => [...prev, folder]);
    setCurrentFolderId(folder.id);
  };

  const handleBreadcrumbClick = (folder: any | null, index: number) => {
    if (folder === null) {
      setFolderPath([]);
      setCurrentFolderId(null);
    } else {
      setFolderPath((prev) => prev.slice(0, index + 1));
      setCurrentFolderId(folder.id);
    }
  };

  const handleFileSelect = async (file: any) => {
    setSelectedFile(file);
    // Fetch file versions
    try {
      const versions = await api.get<any[]>(`/files/${file.id}/versions`).catch(() => []);
      setFileVersions(versions || []);
    } catch {
      setFileVersions([]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
      {/* Main Files Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/60 backdrop-blur-sm p-4 rounded-xl border border-glass-border">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-sm font-medium overflow-x-auto w-full sm:w-auto">
            <span
              onClick={() => handleBreadcrumbClick(null, -1)}
              className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-fast"
            >
              Root
            </span>
            {folderPath.map((folder, index) => (
              <div key={folder.id} className="flex items-center gap-1.5">
                <span className="text-muted-foreground">/</span>
                <span
                  onClick={() => handleBreadcrumbClick(folder, index)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-fast truncate max-w-[120px]"
                >
                  {folder.file_name}
                </span>
              </div>
            ))}
          </div>

          {/* Search and Upload Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full sm:w-48 bg-background/50 border border-glass-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              onClick={() => setShowFolderModal(true)}
              className="p-2 border border-glass-border rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-fast"
              title="New Folder"
            >
              <FolderPlus className="h-5 w-5" />
            </button>

            <label className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-fast">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>Upload</span>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Files Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : files.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((item) => (
              <div
                key={item.id}
                onClick={() => (item.is_folder ? handleFolderClick(item) : handleFileSelect(item))}
                className="p-4 bg-card/40 border border-glass-border/30 hover:border-primary/40 rounded-xl flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-fast group h-40 hover:shadow-soft-md"
              >
                <div className="flex-1 flex items-center justify-center">
                  {item.is_folder ? (
                    <Folder className="h-12 w-12 text-primary/80 fill-primary/10" />
                  ) : (
                    <FileText className="h-12 w-12 text-muted-foreground/80" />
                  )}
                </div>
                <div className="w-full mt-2 space-y-1">
                  <p className="text-sm font-semibold text-foreground truncate w-full px-1">
                    {item.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.is_folder ? 'Folder' : `${(item.file_size / 1024).toFixed(1)} KB`}
                  </p>
                </div>
                {/* Hover delete */}
                <button
                  onClick={(e) => handleDeleteFile(item.id, e)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-danger bg-danger/10 hover:bg-danger/25 p-1 rounded transition-all duration-fast"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card/20 border border-dashed border-glass-border rounded-xl">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">This folder is empty.</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a file or create a folder to start collaborating.</p>
          </div>
        )}
      </div>

      {/* Sidebar - File Details */}
      <div className="bg-card/40 border border-glass-border rounded-xl p-5 space-y-5">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-glass-border">
              <h3 className="font-heading font-semibold text-foreground">File Details</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-background/30 rounded-xl border border-glass-border/30">
              <FileText className="h-16 w-16 text-muted-foreground/75 mb-3" />
              <h4 className="font-semibold text-foreground text-sm w-full truncate px-2">
                {selectedFile.file_name}
              </h4>
              <p className="text-xs text-muted-foreground uppercase mt-1">
                {selectedFile.file_type.split('/')[1] || 'Unknown'}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium text-foreground">{(selectedFile.file_size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded By:</span>
                <span className="font-medium text-foreground">
                  {selectedFile.uploaded_by?.full_name || 'TeamSync User'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium text-foreground">
                  {new Date(selectedFile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={selectedFile.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex justify-center items-center gap-1.5 bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all duration-fast"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
              <button
                onClick={(e) => handleDeleteFile(selectedFile.id, e as any)}
                className="p-2 border border-danger/30 rounded-lg text-danger bg-danger/5 hover:bg-danger/10 transition-colors duration-fast"
                title="Delete File"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Versions Section */}
            <div className="space-y-3 pt-3 border-t border-glass-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                <Layers className="h-3.5 w-3.5" /> Version History
              </div>
              <div className="space-y-2">
                {fileVersions.length > 0 ? (
                  fileVersions.map((v: any, index: number) => (
                    <div key={v.id} className="p-2.5 bg-background/40 border border-glass-border/40 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground">Version {fileVersions.length - index}</span>
                        {index === 0 && <span className="text-success text-[10px] font-bold">Active</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Uploaded {new Date(v.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 bg-background/40 border border-glass-border/40 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-medium">
                      <span className="text-foreground">Version 1 (Active)</span>
                      <span className="text-muted-foreground">Active</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Uploaded {new Date(selectedFile.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-60" />
            <p className="text-sm font-medium">No File Selected</p>
            <p className="text-xs mt-1">Select a file to inspect details, versions, or download.</p>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFolder}
            className="bg-card border border-glass-border p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-elevation-xl animate-fade-in"
          >
            <h3 className="font-heading font-bold text-lg text-foreground">Create Folder</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Folder Name</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Marketing Documents, Releases, etc."
                className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground border border-glass-border rounded-lg hover:bg-muted transition-colors duration-fast"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-fast"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
