import { Badge } from 'antd';
import { TaskStatus } from '../api/types';

const statusMap: Record<TaskStatus, { color: string; text: string }> = {
  pending: { color: 'default', text: '待调度' },
  uploading: { color: 'processing', text: '上传中' },
  parsing: { color: 'processing', text: '解析中' },
  inferencing: { color: 'processing', text: '推理中' },
  aggregating: { color: 'warning', text: '汇总中' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' },
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge status={statusMap[status].color as never} text={statusMap[status].text} />;
}
