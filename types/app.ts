type UserTier = 'free' | 'premium';
export type UploadType = 'anonymous' | 'custom';
export type FileType = 'image' | 'pdf';

export type AppUser = {
  id: string;
  auth_user_id: string;
  username: string | null;
  email: string;
  tier: UserTier;
  created_at: string;
  updated_at: string;
};

export type AdminFileRow = {
  id: string;
  user_id: string | null;
  anon_session_id?: string | null;
  upload_type: UploadType;
  slug: string;
  filename: string;
  file_type: FileType;
  mime_type: string;
  size: number;
  storage_path: string;
  expires_at: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  user?: { username: string | null } | null;
};

export type AppFile = {
  id: string;
  slug: string;
  filename: string;
  file_type: FileType;
  upload_type: UploadType;
  expires_at: string | null;
  created_at: string;
  publicUrl: string;
};

export type FileMetadata = {
  slug: string;
  filename: string;
  fileType: FileType;
  size: number;
  createdAt: string;
  expiresAt: string | null;
  url: string;
  downloadUrl: string;
};

export type AnonymousLink = {
  id: string;
  filename: string;
  fileType: FileType;
  fileSize: string;
  url: string;
  createdAt: string;
  expiresAt: string;
};

export type UploadSuccess = {
  fileId: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  optimizedSize?: number;
};

export type UploadResponse = {
  success?: true;
  fileId: string;
  filename?: string;
  url?: string;
  expiresAt?: string | null;
  optimizedSize?: number;
  details?: string[] | string;
  error?: string;
};

export type ProfilePayload = {
  user: AppUser;
};

export type FilesPayload = {
  files: AppFile[];
};

export type UsernameAvailabilityPayload = {
  username: string;
  available: boolean;
  exists: boolean;
  valid: boolean;
  message?: string;
};

export type UpdateFilePayload = {
  fileId: string;
  slug: string;
  filename: string;
  expiresAt: string | null;
};
