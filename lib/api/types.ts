// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  status: number;
}

export interface ApiErrorResponse {
  error: string;
}

// Resource Types
export interface CreateResourceRequest {
  file: File;
  cover: File;
  language: string;
}

export interface ResourceResponse {
  id: string;
  title: string;
  pdfUrl: string;
  coverUrl: string;
  language: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceResponse {
  success: boolean;
  resource: ResourceResponse;
}

export interface ResourcePageResponse {
  id: string;
  resourceId: string;
  page: number;
  language: string;
  content: string;
  audioUrl: string;
  audioDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface BulkGeneratePagesRequest {
  pages: Array<{
    page: number;
    language: string;
  }>;
}

export interface BulkGeneratePagesResponse {
  success: boolean;
  pages: ResourcePageResponse[];
  errors?: Array<{
    page: number;
    language: string;
    error: string;
  }>;
}

// Bookmark Types
export interface BookmarkResponse {
  id: string;
  resourceId: string;
  name: string;
  page: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetBookmarksResponse {
  bookmarks: BookmarkResponse[];
}

export interface CreateBookmarkRequest {
  page: number;
  name: string;
}

export interface CreateBookmarkResponse {
  bookmark: BookmarkResponse;
}
