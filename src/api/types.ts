export type UploadFileType = 'metadata' | 'imageArchive';

export type TaskStatus =
  | 'pending'
  | 'uploading'
  | 'parsing'
  | 'inferencing'
  | 'aggregating'
  | 'completed'
  | 'failed';

export interface UploadInitRequest {
  taskName: string;
  files: Array<{
    fileName: string;
    fileSize: number;
    fileType: UploadFileType;
  }>;
}

export interface UploadInitResponse {
  uploadId: string;
  chunkSize: number;
}

export interface CompleteUploadRequest {
  uploadId: string;
  taskName: string;
}

export interface CompleteUploadResponse {
  taskId: string;
  status: TaskStatus;
}

export interface TaskSummary {
  positive: number;
  neutral: number;
  negative: number;
  lowConfidence: number;
}

export interface TaskItem {
  taskId: string;
  taskName: string;
  status: TaskStatus;
  progress: number;
  stageMessage: string;
  totalSamples: number;
  successSamples: number;
  failedSamples: number;
  createdAt: string;
  finishedAt?: string;
  durationSeconds?: number;
  resultFileUrl?: string;
  summary?: TaskSummary;
}

export interface LabelScore {
  label: string;
  score: number;
}

export interface PredictionResult {
  sampleId: string;
  text: string;
  imageUrl?: string;
  sentiment: 'positive' | 'neutral' | 'negative' | string;
  confidence: number;
  isLowConfidence: boolean;
  topLabels: LabelScore[];
  errorMessage?: string;
}

export interface ConfidenceBucket {
  range: string;
  count: number;
}

export interface TaskResultResponse {
  list: PredictionResult[];
  total: number;
  distribution: Record<string, number>;
  confidenceBuckets: ConfidenceBucket[];
}

export interface TaskListResponse {
  list: TaskItem[];
  total: number;
}

export interface TaskQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: TaskStatus;
}

export interface ResultQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  sentiment?: string;
  lowConfidence?: boolean;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDurationSeconds: number;
  distribution: Record<string, number>;
  recentTasks: TaskItem[];
}
