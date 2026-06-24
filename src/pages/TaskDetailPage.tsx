import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Col, Descriptions, Progress, Row, Space, Statistic, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildExportUrl, fetchTaskResults } from '../api/client';
import { ResultCharts } from '../components/ResultCharts';
import { ResultFilterBar } from '../components/ResultFilterBar';
import { ResultTable } from '../components/ResultTable';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { useTaskPolling } from '../hooks/useTaskPolling';
import { openResultDownload } from '../utils/download';
import { formatDateTime } from '../utils/format';

export function TaskDetailPage() {
  const { taskId } = useParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<{
    keyword?: string;
    sentiment?: string;
    lowConfidence?: boolean;
  }>({});

  const { data: task, isLoading: loadingTask } = useTaskPolling(taskId);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      ...filters,
    }),
    [page, pageSize, filters],
  );

  const { data: resultData, isLoading: loadingResults } = useQuery({
    queryKey: ['task-results', taskId, queryParams],
    queryFn: () => fetchTaskResults(taskId!, queryParams),
    enabled: Boolean(taskId) && task?.status === 'completed',
  });

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="hero-card">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col>
            <Typography.Title level={3}>{task?.taskName ?? '任务详情'}</Typography.Title>
            <Space size={16}>
              {task?.status ? <TaskStatusBadge status={task.status} /> : null}
              <Typography.Text type="secondary">{task?.stageMessage}</Typography.Text>
            </Space>
          </Col>
          <Col>
            <Button type="primary" disabled={task?.status !== 'completed'} onClick={() => openResultDownload(buildExportUrl(taskId!))}>
              下载结果文件
            </Button>
          </Col>
        </Row>
      </Card>

      <Card className="feature-card" loading={loadingTask}>
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Progress percent={task?.progress ?? 0} status={task?.status === 'failed' ? 'exception' : 'active'} />
          {task?.status === 'failed' ? <Alert type="error" showIcon message={task.stageMessage} /> : null}
          <Descriptions column={{ xs: 1, md: 2, xl: 4 }}>
            <Descriptions.Item label="任务 ID">{task?.taskId}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{formatDateTime(task?.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{formatDateTime(task?.finishedAt)}</Descriptions.Item>
            <Descriptions.Item label="总样本数">{task?.totalSamples ?? '--'}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="总样本" value={task?.totalSamples ?? 0} loading={loadingTask} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="成功样本" value={task?.successSamples ?? 0} loading={loadingTask} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="失败样本" value={task?.failedSamples ?? 0} loading={loadingTask} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="低置信度" value={task?.summary?.lowConfidence ?? 0} loading={loadingTask} />
          </Card>
        </Col>
      </Row>

      {task?.status !== 'completed' ? (
        <Alert
          type="info"
          showIcon
          message="当前任务尚未完成"
          description="页面会每 3 秒自动轮询一次任务状态。你可以离开该页面，稍后再从历史记录进入查看。"
        />
      ) : null}

      {task?.status === 'completed' ? (
        <>
          <ResultCharts
            distribution={resultData?.distribution ?? {}}
            confidenceBuckets={resultData?.confidenceBuckets ?? []}
          />

          <ResultFilterBar
            onSearch={(nextFilters) => {
              setPage(1);
              setFilters(nextFilters);
            }}
          />

          <Card className="feature-card" title="预测结果明细">
            <ResultTable
              loading={loadingResults}
              dataSource={resultData?.list ?? []}
              total={resultData?.total ?? 0}
              page={page}
              pageSize={pageSize}
              onChange={(nextPage, nextSize) => {
                setPage(nextPage);
                setPageSize(nextSize);
              }}
            />
          </Card>
        </>
      ) : null}
    </Space>
  );
}
