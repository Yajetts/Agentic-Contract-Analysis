import axios from 'axios';

// Configure your backend API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Types
export interface ChatRequest {
  message: string;
  document_id?: string;
  agent_type?: 'legal' | 'summary' | 'redflags' | 'clause' | 'compliance';
}

export interface ChatResponse {
  response: string;
  agent: string;
  confidence?: number;
  sources?: string[];
}

export interface DocumentUploadResponse {
  document_id: string;
  filename: string;
  status: 'processed' | 'processing' | 'error';
  message?: string;
}

// API Functions
export const chatAPI = {
  // Send message to chat
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat', data);
    return response.data;
  },

  // Upload document
  uploadDocument: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get document analysis
  analyzeDocument: async (documentId: string, analysisType: string): Promise<ChatResponse> => {
    const response = await api.post(`/analyze/${documentId}`, {
      analysis_type: analysisType,
    });
    return response.data;
  },

  // Get document preview
  getDocumentPreview: async (documentId: string): Promise<string> => {
    const response = await api.get(`/documents/${documentId}/preview`);
    return response.data.preview_url;
  },

  // Fetch original contract text
  getContractText: async (documentId: string): Promise<string> => {
    const response = await api.get(`/contract-text/${documentId}`);
    return response.data.text;
  },
};

// Error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);