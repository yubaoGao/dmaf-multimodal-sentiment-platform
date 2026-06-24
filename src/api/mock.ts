import {
  CompleteUploadRequest,
  CompleteUploadResponse,
  DashboardMetrics,
  PredictionResult,
  ResultQueryParams,
  TaskItem,
  TaskListResponse,
  TaskQueryParams,
  TaskResultResponse,
  TaskStatus,
  UploadInitRequest,
  UploadInitResponse,
} from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sentiments = ['positive', 'neutral', 'negative'] as const;

function buildResults(seed: string, count = 120): PredictionResult[] {
  return Array.from({ length: count }, (_, index) => {
    const sentiment = sentiments[index % sentiments.length];
    const confidence = Number((0.45 + ((index * 17) % 50) / 100).toFixed(2));
    return {
      sampleId: `${seed}_${index + 1}`,
      text:
        sentiment === 'negative'
          ? `样本 ${index + 1}：用户对商品物流和售后表达了不满。`
          : sentiment === 'neutral'
            ? `样本 ${index + 1}：用户客观描述了图文内容。`
            : `样本 ${index + 1}：用户对品牌活动表达了积极情绪。`,
      imageUrl: `https://picsum.photos/seed/${seed}-${index}/96/96`,
      sentiment,
      confidence,
      isLowConfidence: confidence < 0.65,
      topLabels: [
        { label: sentiment, score: confidence },
        { label: sentiment === 'positive' ? 'neutral' : 'positive', score: Number((1 - confidence - 0.12).toFixed(2)) },
        { label: 'negative', score: 0.12 },
      ],
    };
  });
}

const taskSeeds = [
  {
    taskId: 'task_demo_001',
    taskName: '微博舆情-新品发布周报',
    createdAt: '2026-05-14T09:10:00+08:00',
    totalSamples: 2400,
  },
  {
    taskId: 'task_demo_002',
    taskName: '小红书口碑-五一活动复盘',
    createdAt: '2026-05-13T14:32:00+08:00',
    totalSamples: 1800,
  },
  {
    taskId: 'task_demo_003',
    taskName: '抖音评论-客服投诉专项',
    createdAt: '2026-05-12T11:20:00+08:00',
    totalSamples: 3200,
  },
];

const taskResults = new Map<string, PredictionResult[]>(
  taskSeeds.map((task) => [task.taskId, buildResults(task.taskId)]),
);

let createdTasks: TaskItem[] = taskSeeds.map((seed, index) => ({
  taskId: seed.taskId,
  taskName: seed.taskName,
  status: index === 2 ? 'failed' : 'completed',
  progress: index === 2 ? 72 : 100,
  stageMessage: index === 2 ? '图片与元数据映射缺失，部分样本失败。' : '任务已完成',
  totalSamples: seed.totalSamples,
  successSamples: index === 2 ? 2800 : seed.totalSamples,
  failedSamples: index === 2 ? 400 : 0,
  createdAt: seed.createdAt,
  finishedAt: '2026-05-14T10:10:00+08:00',
  durationSeconds: 860 + index * 110,
  resultFileUrl: `/api/tasks/${seed.taskId}/export`,
  summary: {
    positive: 760 - index * 80,
    neutral: 680 - index * 20,
    negative: 960 + index * 100,
    lowConfidence: 140 + index * 20,
  },
}));

function computeRuntimeTask(task: TaskItem): TaskItem {
  if (!['pending', 'parsing', 'inferencing', 'aggregating'].includes(task.status)) {
    return task;
  }

  const elapsedSeconds = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / 1000);
  if (elapsedSeconds < 10) {
    return { ...task, status: 'parsing', progress: 18, stageMessage: '正在解析元数据与图片索引...' };
  }
  if (elapsedSeconds < 25) {
    return {
      ...task,
      status: 'inferencing',
      progress: Math.min(85, 25 + elapsedSeconds * 2),
      successSamples: Math.floor((task.totalSamples * Math.min(85, 25 + elapsedSeconds * 2)) / 100),
      stageMessage: `DMAF 推理进行中，已完成约 ${Math.min(85, 25 + elapsedSeconds * 2)}%`,
    };
  }
  if (elapsedSeconds < 35) {
    return { ...task, status: 'aggregating', progress: 93, stageMessage: '正在聚合统计并生成导出文件...' };
  }

  return {
    ...task,
    status: 'completed',
    progress: 100,
    stageMessage: '任务已完成',
    successSamples: task.totalSamples,
    failedSamples: 0,
    finishedAt: new Date().toISOString(),
    resultFileUrl: `/api/tasks/${task.taskId}/export`,
    summary: {
      positive: Math.floor(task.totalSamples * 0.35),
      neutral: Math.floor(task.totalSamples * 0.2),
      negative: Math.floor(task.totalSamples * 0.45),
      lowConfidence: Math.floor(task.totalSamples * 0.08),
    },
  };
}

export async function mockInitUpload(payload: UploadInitRequest): Promise<UploadInitResponse> {
  await wait(350);
  return {
    uploadId: `upl_${Date.now()}`,
    chunkSize: 2 * 1024 * 1024,
  };
}

export async function mockUploadChunk(): Promise<{ received: boolean }> {
  await wait(150);
  return { received: true };
}

export async function mockCompleteUpload(payload: CompleteUploadRequest): Promise<CompleteUploadResponse> {
  await wait(500);
  const taskId = `task_${Date.now()}`;
  createdTasks = [
    {
      taskId,
      taskName: payload.taskName,
      status: 'pending',
      progress: 0,
      stageMessage: '任务已创建，等待调度',
      totalSamples: 2000,
      successSamples: 0,
      failedSamples: 0,
      createdAt: new Date().toISOString(),
    },
    ...createdTasks,
  ];
  taskResults.set(taskId, buildResults(taskId, 90));
  return { taskId, status: 'pending' };
}

export async function mockFetchTasks(params: TaskQueryParams): Promise<TaskListResponse> {
  await wait(300);
  const list = createdTasks
    .map(computeRuntimeTask)
    .filter((task) => (params.keyword ? task.taskName.includes(params.keyword) : true))
    .filter((task) => (params.status ? task.status === params.status : true));

  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  return {
    list: list.slice(start, end),
    total: list.length,
  };
}

export async function mockFetchTaskDetail(taskId: string): Promise<TaskItem> {
  await wait(250);
  const task = createdTasks.find((item) => item.taskId === taskId);
  if (!task) {
    throw new Error('任务不存在');
  }
  const computed = computeRuntimeTask(task);
  createdTasks = createdTasks.map((item) => (item.taskId === taskId ? computed : item));
  return computed;
}

export async function mockFetchTaskResults(taskId: string, params: ResultQueryParams): Promise<TaskResultResponse> {
  await wait(280);
  const results = taskResults.get(taskId) ?? [];
  const filtered = results
    .filter((item) => (params.keyword ? item.text.includes(params.keyword) || item.sampleId.includes(params.keyword) : true))
    .filter((item) => (params.sentiment ? item.sentiment === params.sentiment : true))
    .filter((item) => (params.lowConfidence ? item.isLowConfidence : true));

  const distribution = filtered.reduce<Record<string, number>>((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] ?? 0) + 1;
    return acc;
  }, {});

  const bucketRanges = [
    { key: '0.0-0.2', min: 0, max: 0.2 },
    { key: '0.2-0.4', min: 0.2, max: 0.4 },
    { key: '0.4-0.6', min: 0.4, max: 0.6 },
    { key: '0.6-0.8', min: 0.6, max: 0.8 },
    { key: '0.8-1.0', min: 0.8, max: 1.01 },
  ];

  const confidenceBuckets = bucketRanges.map((bucket) => ({
    range: bucket.key,
    count: filtered.filter((item) => item.confidence >= bucket.min && item.confidence < bucket.max).length,
  }));

  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;

  return {
    list: filtered.slice(start, end),
    total: filtered.length,
    distribution,
    confidenceBuckets,
  };
}

export async function mockFetchDashboard(): Promise<DashboardMetrics> {
  await wait(200);
  const tasks = createdTasks.map(computeRuntimeTask);
  return {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((item) => item.status === 'completed').length,
    failedTasks: tasks.filter((item) => item.status === 'failed').length,
    averageDurationSeconds: Math.round(
      tasks.filter((item) => item.durationSeconds).reduce((sum, item) => sum + (item.durationSeconds ?? 0), 0) /
        Math.max(1, tasks.filter((item) => item.durationSeconds).length),
    ),
    distribution: {
      positive: 1430,
      neutral: 820,
      negative: 1950,
    },
    recentTasks: tasks.slice(0, 5),
  };
}
