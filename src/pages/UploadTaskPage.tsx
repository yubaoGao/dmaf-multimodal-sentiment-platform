import { Card, Col, Row, Space, Steps, Typography } from 'antd';
import { UploadPanel } from '../components/UploadPanel';

export function UploadTaskPage() {
  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Card className="hero-card">
        <Typography.Title level={3}>新建分析任务</Typography.Title>
        <Typography.Paragraph>
          前端负责完成大文件上传与任务提交；后端负责文件合并、样本解析、DMAF 模型推理和结果持久化。这样可以避免浏览器直接承载推理逻辑，也更适合实验室服务器部署。
        </Typography.Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <UploadPanel />
        </Col>
        <Col xs={24} xl={8}>
          <Card className="feature-card" title="任务执行流程">
            <Steps
              direction="vertical"
              items={[
                { title: '上传文件', description: '前端分片上传元数据与图片压缩包' },
                { title: '解析校验', description: '后端校验 CSV/Excel 与 ZIP 中图片映射关系' },
                { title: 'DMAF 推理', description: '批量推理图文情感类别与置信度' },
                { title: '统计汇总', description: '生成表格、图表摘要与导出文件' },
                { title: '结果查询', description: '前端通过历史记录与详情页查看分析结果' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
