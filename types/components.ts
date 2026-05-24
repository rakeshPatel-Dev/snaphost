import type { ReactNode, RefObject } from 'react';
import type { AnonymousLink, AppFile, UploadSuccess } from './app';

export type ThemeProviderProps = {
  children: ReactNode;
};

export type ReduxProviderProps = {
  children: ReactNode;
};

export type SiteChromeProps = {
  children: ReactNode;
};

export type DeleteConfirmDialogProps = {
  trigger?: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  destructiveClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type DeleteAccountDialogProps = {
  trigger: ReactNode;
  redirectUrl?: string;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  destructiveClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type UploadMockTabsProps = {
  activeTab: 'upload' | 'links';
  onTabChange: (tab: 'upload' | 'links') => void;
  linksCount?: number;
};

export type UploadDropzoneProps = {
  isDragging: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onClick: () => void;
};

export type AnonymousLinkCardProps = AnonymousLink & {
  copied: boolean;
  onCopy: (url: string, id: string) => void;
  onOpen: (url: string) => void;
  onDelete: (id: string) => void;
};

export type AnonymousLinksDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: AnonymousLink[];
  copiedId: string | null;
  onCopy: (url: string, id: string) => void;
  onOpen: (url: string) => void;
  onDelete: (id: string) => void;
};

export type UploadSuccessCardProps = Pick<UploadSuccess, 'fileId' | 'filename' | 'fileUrl' | 'fileSize' | 'optimizedSize'> & {
  onUploadMore: () => void;
};

export type FileDetailsCardProps = Pick<UploadSuccess, 'filename' | 'fileSize' | 'optimizedSize'>;

export type FilePreviewProps = {
  fileId: string;
};

export type ImagePreviewProps = {
  url: string;
  filename: string;
};

export type PdfPreviewProps = {
  url: string;
  filename: string;
};

export type ShareLinkInputProps = {
  fileUrl: string;
};

export type ShareModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  filename: string;
};

export type AuthScreenProps = {
  isSignIn: boolean;
};

export type AnimatedThemeTogglerProps = {
  className?: string;
};

export type ProfileDashboardProps = {
  initialUsername: string;
  email: string;
  tier: 'free' | 'premium';
  files: AppFile[];
};

export type UploadFormProps = {
  isDragging: boolean;
  isUploading: boolean;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileInputClick: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
