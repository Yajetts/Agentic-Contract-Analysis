import { create } from 'zustand';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'agent';
  agent?: 'legal' | 'summary' | 'redflags' | 'clause' | 'compliance' | 'ambiguity' | 'framework' | 'obligation' | 'risk';
  timestamp: Date;
  isLoading?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  size: number;
  url: string;
  uploadedAt: Date;
  preview?: string;
}

interface ChatState {
  messages: Message[];
  documents: Document[];
  isLoading: boolean;
  activeDocument: Document | null;
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  addDocument: (document: Omit<Document, 'uploadedAt'>) => void;
  setActiveDocument: (document: Document | null) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  documents: [],
  isLoading: false,
  activeDocument: null,

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  addDocument: (document) => {
    const newDocument: Document = {
      ...document,
      uploadedAt: new Date(),
    };
    
    set((state) => ({
      documents: [...state.documents, newDocument],
      activeDocument: newDocument,
    }));
  },

  setActiveDocument: (document) => {
    set({ activeDocument: document });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  clearMessages: () => {
    set({ messages: [] });
  },
}));