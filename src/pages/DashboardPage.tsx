import { useQuery } from '@tanstack/react-query';
import { Card, Col, Progress, Row, Space, Statistic, Table, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../api/client';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { formatDateTime, formatDuration } from '../utils/format';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="hero-card">
        <Typography.Title level={3}>平台总览</Typography.Title>
        <Typography.Paragraph>
          该平台用于承接 DMAF 图文情感模型的批量推理任务，前端通过异步任务机制与实验室服务器上的 Python 服务解耦，
          可稳定支持大文件上传、长耗时推理和历史结果复查。
        </Typography.Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="累计任务数" value={data?.totalTasks ?? 0} loading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="已完成任务" value={data?.completedTasks ?? 0} loading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic title="失败任务" value={data?.failedTasks ?? 0} loading={isLoading} />
          </Card>
        </Col>
        <Col xs={24} md={12} xl={6}>
          <Card className="feature-card">
            <Statistic
              title="平均耗时"
              value={formatDuration(data?.averageDurationSeconds)}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={9}>
          <Card title="总体情感结构" className="feature-card">
            <Space direction="vertical" style={{ width: '100%' }} size={14}>
              {Object.entries(data?.distribution ?? {}).map(([label, count]) => {
                const total = Object.values(data?.distribution ?? {}).reduce((sum, value) => sum + value, 0);
                return (
                  <div key={label}>
                    <div className="progress-label">
                      <Typography.Text>{label}</Typography.Text>
                      <Typography.Text>{count}</Typography.Text>
                    </div>
                    <Progress percent={total ? Math.round((count / total) * 100) : 0} showInfo={false} />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        <Col xs={24} xl={15}>
          <Card title="最近任务" className="feature-card">
            <Table
              rowKey="taskId"
              loading={isLoading}
              pagination={false}
              columns={[
                {
                  title: '任务名称',
                  dataIndex: 'taskName',
                  render: (value: string, record: { taskId: string }) => <Link to={`/tasks/${record.taskId}`}>{value}</Link>,
                },
                { title: '状态', dataIndex: 'status', render: (value) => <TaskStatusBadge status={value} /> },
                { title: '样本数', dataIndex: 'totalSamples' },
                { title: '创建时间', dataIndex: 'createdAt', render: formatDateTime },
              ]}
              dataSource={data?.recentTasks ?? []}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
