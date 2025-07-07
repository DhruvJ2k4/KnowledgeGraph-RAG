import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  FileInfo,
  ProcessPDFsRequest,
  KGStatusResponse,
  ChatRequest,
  ChatResponse,
  QueryHistory,
  GraphSearchRequest,
  GraphSearchResponse,
  GraphStats,
  FileStatusInfo
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 Unauthorized response handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("401 Unauthorized: Logging out user.");
      localStorage.removeItem('auth_token'); // Clear token
      // Redirect to login page
      window.location.href = '/login'; // Adjust this path to your actual login route
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  refresh: async (): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },
};

// File API
export const fileApi = {
  upload: async (files: File[]): Promise<FileInfo> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    const response = await api.post<FileInfo>('/data-loader/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async (): Promise<FileStatusInfo[]> => {
    const response = await api.get<FileStatusInfo[]>('/data-loader/list');
    return response.data;
  },

  delete: async (fileId: number): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/data-loader/delete/${fileId}`);
    return response.data;
  },

  getStatus: async (fileId: number): Promise<FileStatusInfo> => {
    const response = await api.get<FileStatusInfo>(`/data-loader/status/${fileId}`);
    return response.data;
  },
};

// KG Status API
export const kgStatusApi = {
  processPDFs: async (data: ProcessPDFsRequest): Promise<KGStatusResponse> => {
    const response = await api.post<KGStatusResponse>('/KG-status/pdf-status', data);
    return response.data;
  },

  extractEntities: async (): Promise<KGStatusResponse> => {
    const response = await api.post<KGStatusResponse>('/KG-status/entity-extractor');
    return response.data;
  },

  buildKG: async (): Promise<KGStatusResponse> => {
    const response = await api.post<KGStatusResponse>('/KG-status/build-kg');
    return response.data;
  },

  updateKG: async (): Promise<KGStatusResponse> => {
    const response = await api.post<KGStatusResponse>('/KG-status/update-kg');
    return response.data;
  },

  deletePDFStatus: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/KG-status/pdf-status');
    return response.data;
  },

  getStatus: async (): Promise<KGStatusResponse> => {
    const response = await api.get<KGStatusResponse>('/KG-status/status');
    return response.data;
  },
};

// Query API
export const queryApi = {
  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/query/chat', data);
    return response.data;
  },

  getHistory: async (): Promise<QueryHistory[]> => {
    const response = await api.get<QueryHistory[]>('/query/history');
    return response.data;
  },
};

// Graph API
export const graphApi = {
  search: async (data: GraphSearchRequest): Promise<GraphSearchResponse> => {
    const response = await api.post<GraphSearchResponse>('/graph/search', data);
    return response.data;
  },

  getStats: async (): Promise<GraphStats> => {
    const response = await api.get<GraphStats>('/graph/stats');
    return response.data;
  },
}; 