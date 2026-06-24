import { useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Select, Space, Table, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../api/client';
import { TaskStatus } from '../api/types';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { formatDateTime, formatDuration } from '../utils/format';

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<TaskStatus | undefined>();
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState<TaskStatus | undefined>();

  const queryParams = useMemo(
    () => ({
      page,
      pageSize,
      keyword: submittedKeyword || undefined,
      status: submittedStatus,
    }),
    [page, pageSize, submittedKeyword, submittedStatus],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: () => fetchTasks(queryParams),
  });

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="hero-card">
        <Typography.Title level={3}>历史记录</Typography.Title>
        <Typography.Paragraph>
          这里汇总所有上传分析任务。历史页默认按分页与虚拟滚动加载，避免任务量变大后整页渲染卡顿。
        </Typography.Paragraph>
      </Card>

      <Card className="feature-card">
        <Space wrap style={{ width: '100%' }}>
          <Input
            placeholder="按任务名称搜索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={() => {
              setPage(1);
              setSubmittedKeyword(keyword);
              setSubmittedStatus(status);
            }}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="状态筛选"
            value={status}
            onChange={setStatus}
            style={{ width: 180 }}
            options={[
              { label: '待调度', value: 'pending' },
              { label: '解析中', value: 'parsing' },
              { label: '推理中', value: 'inferencing' },
              { label: '汇总中', value: 'aggregating' },
              { label: '已完成', value: 'completed' },
              { label: '失败', value: 'failed' },
            ]}
          />
          <Button
            type="primary"
            onClick={() => {
              setPage(1);
              setSubmittedKeyword(keyword);
              setSubmittedStatus(status);
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              setPage(1);
              setKeyword('');
              setStatus(undefined);
              setSubmittedKeyword('');
              setSubmittedStatus(undefined);
            }}
          >
            重置
          </Button>
        </Space>
      </Card>

      <Card className="feature-card">
        <Table
          rowKey="taskId"
          loading={isLoading}
          dataSource={data?.list ?? []}
          virtual
          scroll={{ x: 1080, y: 560 }}
          columns={[
            {
              title: '任务名称',
              dataIndex: 'taskName',
              width: 280,
              fixed: 'left',
              render: (value: string, record: { taskId: string }) => <Link to={`/tasks/${record.taskId}`}>{value}</Link>,
            },
            { title: '状态', dataIndex: 'status', width: 120, render: (value) => <TaskStatusBadge status={value} /> },
            { title: '进度', dataIndex: 'progress', width: 100, render: (value: number) => `${value}%` },
            { title: '总样本数', dataIndex: 'totalSamples', width: 120 },
            { title: '成功数', dataIndex: 'successSamples', width: 120 },
            { title: '失败数', dataIndex: 'failedSamples', width: 120 },
            { title: '创建时间', dataIndex: 'createdAt', width: 180, render: formatDateTime },
            { title: '耗时', dataIndex: 'durationSeconds', width: 120, render: formatDuration },
            { title: '阶段说明', dataIndex: 'stageMessage' },
          ]}
          pagination={{
            current: page,
            pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            onChange: (nextPage, nextSize) => {
              setPage(nextPage);
              setPageSize(nextSize);
            },
          }}
        />
      </Card>
    </Space>
  );
}
