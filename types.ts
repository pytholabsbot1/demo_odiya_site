export interface Attachment {
  type: 'image' | 'pdf';
  mimeType: string;
  data: string; // Base64 string
  fileName: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  content: string; // Text content extracted
  type: 'text' | 'pdf';
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  chats: Chat[];
  documents: ProjectDocument[];
}

export type LoadingState = 'idle' | 'loading' | 'streaming';

export interface AppSettings {
  googleVisionApiKey: string;
}

export interface OCRResult {
  fullText: string;
  blocks: {
    text: string;
    boundingBox: { x: number; y: number }[];
  }[];
}

// --- NEWS TYPES ---

export type AppMode = 'dashboard' | 'news';

export type NewsCategory = 'All' | 'Odisha' | 'Politics' | 'Technology' | 'Sports' | 'Culture';

export interface NewsArticle {
  id: string;
  title: string;
  titleOdia?: string;
  summary: string;
  content: string;
  source: string;
  imageUrl: string;
  publishedAt: number;
  category: NewsCategory;
}