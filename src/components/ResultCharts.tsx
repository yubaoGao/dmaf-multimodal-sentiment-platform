import { Card, Col, Row } from 'antd';
import ReactECharts from 'echarts-for-react';
import { ConfidenceBucket } from '../api/types';

interface ResultChartsProps {
  distribution: Record<string, number>;
  confidenceBuckets: ConfidenceBucket[];
}

export function ResultCharts({ distribution, confidenceBuckets }: ResultChartsProps) {
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        data: Object.entries(distribution).map(([name, value]) => ({ name, value })),
        label: { formatter: '{b}: {d}%' },
      },
    ],
  };

  const barOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: confidenceBuckets.map((item) => item.range),
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        barWidth: 36,
        data: confidenceBuckets.map((item) => item.count),
        itemStyle: {
          color: '#14532d',
          borderRadius: [8, 8, 0, 0],
        },
      },
    ],
  };

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card title="情感类别占比" className="feature-card">
          <ReactECharts option={pieOption} style={{ height: 340 }} />
        </Card>
      </Col>
      <Col xs={24} xl={12}>
        <Card title="置信度分布" className="feature-card">
          <ReactECharts option={barOption} style={{ height: 340 }} />
        </Card>
      </Col>
    </Row>
  );
}
