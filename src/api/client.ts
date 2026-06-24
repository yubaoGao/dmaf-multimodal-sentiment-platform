import axios from 'axios';
import {
  CompleteUploadRequest,
  CompleteUploadResponse,
  DashboardMetrics,
  ResultQueryParams,
  TaskItem,
  TaskListResponse,
  TaskQueryParams,
  TaskResultResponse,
  UploadInitRequest,
  UploadInitResponse,
} from './types';
import {
  mockCompleteUpload,
  mockFetchDashboard,
  mockFetchTaskDetail,
  mockFetchTaskResults,
  mockFetchTasks,
  mockInitUpload,
  mockUploadChunk,
} from './mock';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || 'true') === 'true';

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export async function initUpload(payload: UploadInitRequest): Promise<UploadInitResponse> {
  if (USE_MOCK) return mockInitUpload(payload);
  const { data } = await http.post<UploadInitResponse>('/uploads/init', payload);
  return data;
}

export async function uploadChunk(payload: FormData): Promise<{ received: boolean }> {
  if (USE_MOCK) return mockUploadChunk();
  const { data } = await http.post<{ received: boolean }>('/uploads/chunk', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function completeUpload(payload: CompleteUploadRequest): Promise<CompleteUploadResponse> {
  if (USE_MOCK) return mockCompleteUpload(payload);
  const { data } = await http.post<CompleteUploadResponse>('/uploads/complete', payload);
  return data;
}

export async function fetchTasks(params: TaskQueryParams): Promise<TaskListResponse> {
  if (USE_MOCK) return mockFetchTasks(params);
  const { data } = await http.get<TaskListResponse>('/tasks', { params });
  return data;
}

export async function fetchTaskDetail(taskId: string): Promise<TaskItem> {
  if (USE_MOCK) return mockFetchTaskDetail(taskId);
  const { data } = await http.get<TaskItem>(`/tasks/${taskId}`);
  return data;
}

export async function fetchTaskResults(taskId: string, params: ResultQueryParams): Promise<TaskResultResponse> {
  if (USE_MOCK) return mockFetchTaskResults(taskId, params);
  const { data } = await http.get<TaskResultResponse>(`/tasks/${taskId}/results`, { params });
  return data;
}

export async function fetchDashboard(): Promise<DashboardMetrics> {
  if (USE_MOCK) return mockFetchDashboard();
  const { data } = await http.get<DashboardMetrics>('/dashboard');
  return data;
}

export function buildExportUrl(taskId: string) {
  return `${API_BASE_URL}/tasks/${taskId}/export`;
}
