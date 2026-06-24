import { Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PredictionResult } from '../api/types';
import { LazyImage } from './LazyImage';

const columns: ColumnsType<PredictionResult> = [
  {
    title: '样本 ID',
    dataIndex: 'sampleId',
    width: 180,
    fixed: 'left',
  },
  {
    title: '图片',
    dataIndex: 'imageUrl',
    width: 110,
    render: (value: string | undefined, record) =>
      value ? <LazyImage src={value} alt={record.sampleId} className="result-thumb" /> : '--',
  },
  {
    title: '文本内容',
    dataIndex: 'text',
    ellipsis: true,
    render: (value: string) => (
      <Tooltip title={value}>
        <span>{value}</span>
      </Tooltip>
    ),
  },
  {
    title: '情感类别',
    dataIndex: 'sentiment',
    width: 120,
    render: (value: string) => {
      const color = value === 'positive' ? 'success' : value === 'negative' ? 'error' : 'default';
      const label = value === 'positive' ? '正向' : value === 'negative' ? '负向' : '中性';
      return <Tag color={color}>{label}</Tag>;
    },
  },
  {
    title: '置信度',
    dataIndex: 'confidence',
    width: 110,
    sorter: (a, b) => a.confidence - b.confidence,
    render: (value: number) => value.toFixed(2),
  },
  {
    title: '低置信度',
    dataIndex: 'isLowConfidence',
    width: 120,
    render: (value: boolean) => (value ? <Tag color="warning">需复核</Tag> : <Tag>正常</Tag>),
  },
  {
    title: 'Top-K',
    dataIndex: 'topLabels',
    width: 240,
    render: (value: PredictionResult['topLabels']) =>
      value.map((item) => (
        <Tag key={`${item.label}-${item.score}`}>
          {item.label}:{item.score.toFixed(2)}
        </Tag>
      )),
  },
];

interface ResultTableProps {
  loading: boolean;
  dataSource: PredictionResult[];
  total: number;
  page: number;
  pageSize: number;
  onChange: (page: number, pageSize: number) => void;
}

export function ResultTable(props: ResultTableProps) {
  return (
    <Table
      rowKey="sampleId"
      columns={columns}
      dataSource={props.dataSource}
      loading={props.loading}
      scroll={{ x: 1080, y: 540 }}
      virtual
      pagination={{
        current: props.page,
        pageSize: props.pageSize,
        total: props.total,
        showSizeChanger: true,
        onChange: props.onChange,
      }}
    />
  );
}
