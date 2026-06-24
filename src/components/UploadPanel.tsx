import { InboxOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Progress, Space, Typography, Upload, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runChunkUpload } from '../utils/upload';

const { Dragger } = Upload;

export function UploadPanel() {
  const [form] = Form.useForm<{ taskName: string }>();
  const navigate = useNavigate();
  const [metadataFiles, setMetadataFiles] = useState<UploadFile[]>([]);
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');

  const canSubmit = metadataFiles.length > 0 && imageFiles.length > 0;

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const metadata = metadataFiles[0].originFileObj;
    const archive = imageFiles[0].originFileObj;
    if (!metadata || !archive) {
      message.error('请先选择元数据文件和图片压缩包');
      return;
    }

    setUploading(true);
    try {
      const result = await runChunkUpload({
        taskName: values.taskName,
        files: [
          { file: metadata as File, fileType: 'metadata' },
          { file: archive as File, fileType: 'imageArchive' },
        ],
        onProgress: (nextProgress, fileName) => {
          setProgress(nextProgress);
          setCurrentFileName(fileName);
        },
      });
      message.success('任务创建成功，正在进入详情页');
      navigate(`/tasks/${result.taskId}`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '上传失败，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="feature-card">
      <Space direction="vertical" size={20} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4}>上传分析数据</Typography.Title>
          <Typography.Paragraph type="secondary">
            上传元数据文件和图片压缩包后，系统会创建异步任务，由实验室服务器上的 DMAF 模型完成推理。
          </Typography.Paragraph>
        </div>

        <Alert
          type="info"
          showIcon
          message="推荐文件格式"
          description="元数据请使用 CSV / XLSX；图片请统一打包为 ZIP，并保证 image_name 字段与压缩包中文件名一致。"
        />

        <Form form={form} layout="vertical" initialValues={{ taskName: `批量分析任务-${new Date().toLocaleString()}` }}>
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="例如：微博舆情-5月第一周" />
          </Form.Item>
        </Form>

        <div className="upload-grid">
          <Card size="small" title="元数据文件">
            <Dragger
              accept=".csv,.xls,.xlsx"
              multiple={false}
              beforeUpload={() => false}
              fileList={metadataFiles}
              onChange={({ fileList }) => setMetadataFiles(fileList.slice(-1))}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p>拖拽 CSV / Excel 到这里，或点击上传</p>
            </Dragger>
          </Card>

          <Card size="small" title="图片压缩包">
            <Dragger
              accept=".zip"
              multiple={false}
              beforeUpload={() => false}
              fileList={imageFiles}
              onChange={({ fileList }) => setImageFiles(fileList.slice(-1))}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p>拖拽 ZIP 到这里，或点击上传</p>
            </Dragger>
          </Card>
        </div>

        {uploading ? (
          <Card size="small" className="progress-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text>当前上传文件：{currentFileName || '准备中'}</Typography.Text>
              <Progress percent={progress} status="active" />
            </Space>
          </Card>
        ) : null}

        <Button type="primary" size="large" onClick={handleSubmit} loading={uploading} disabled={!canSubmit}>
          创建分析任务
        </Button>
      </Space>
    </Card>
  );
}
