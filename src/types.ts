export interface VoiceNote {
  id: string;
  noteId: string;
  audioData: string; // Base64 or Blob URL (Base64 for persistence in this demo)
  duration: number;
  slotNumber: number;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  voiceNotes: VoiceNote[];
  images: string[]; // Base64 strings
  isDeleted?: boolean;
  deletedAt?: number;
}

export type SortOption = 'newest' | 'oldest' | 'subject';

export type AppScreen = 'home' | 'edit' | 'reader' | 'search' | 'subjectDetail' | 'imageViewer' | 'trash';

export type Theme = 'light' | 'dark';
