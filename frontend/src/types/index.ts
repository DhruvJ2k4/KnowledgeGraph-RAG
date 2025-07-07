// Type definitions for the Knowledge Graph RAG application

export interface PDFFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error' | 'processed' | 'entities_extracted' | 'graph_built' | 'graph_updated';
  progress?: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface KnowledgeGraphStatus {
  status: 'offline' | 'processed' | 'entities_extracted' | 'building' | 'ready' | 'error';
  stage?: string;
  progress?: number;
  message?: string;
  entityCount?: number;
  relationshipCount?: number;
  chunksCreated?: number;
  pdfsProcessed?: number;
  entitiesExtracted?: number;
  relationshipsCreated?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'document';
  properties?: Record<string, any>;
}

export interface GraphRelationship {
  id: string;
  source: string;
  target: string;
  type: string;
  properties?: Record<string, any>;
}

export interface GraphVisualizationData {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  fullname: string;
  password: string;
  is_superuser?: boolean;
}

export interface RegisterResponse {
  id: number;
  username: string;
  fullname: string;
  is_active: boolean;
  created_at: string;
}

// File Types
export type FileStatus = 'pending' | 'processed' | 'entities_extracted' | 'graph_built' | 'graph_updated';

export interface FileInfo {
  message: string;
  files: Array<{
    filename: string;
    status: 'success' | 'error';
  }>;
}

export interface FileStatusInfo {
  id: number;
  filename: string;
  size: number;
  status: FileStatus;
  uploaded_at: string;
  processed_at: string | null;
  file_path: string;
  user_id: number;
}

// KG Status Types
export interface ProcessPDFsRequest {
  file_ids?: string[];
}

export interface KGStatusResponse {
  status: 'offline' | 'building' | 'ready' | 'error';
  stage?: string;
  progress?: number;
  message?: string;
  entityCount?: number;
  relationshipCount?: number;
  chunksCreated?: number;
  pdfsProcessed?: number;
  entitiesExtracted?: number;
  relationshipsCreated?: number;
}

// Query Types
export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
}

export interface QueryHistory {
  id: number;
  query: string;
  answer: string;
  timestamp: string;
  user_id: number;
}

// Graph Types
export interface GraphSearchRequest {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
}

export interface GraphSearchResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStats {
  node_count: number;
  relationship_count: number;
  entity_types: string[];
  relationship_types: string[];
}

// Environment Config
export interface EnvConfig {
  API_URL: string;
  WS_URL: string;
  AUTH_TOKEN_KEY: string;
}
