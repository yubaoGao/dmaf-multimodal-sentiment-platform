import { Button, Card, Col, Input, Row, Select, Switch, Typography } from 'antd';
import { useState } from 'react';

interface ResultFilterBarProps {
  onSearch: (filters: { keyword?: string; sentiment?: string; lowConfidence?: boolean }) => void;
}

export function ResultFilterBar({ onSearch }: ResultFilterBarProps) {
  const [keyword, setKeyword] = useState('');
  const [sentiment, setSentiment] = useState<string>();
  const [lowConfidence, setLowConfidence] = useState(false);

  const handleApply = () => {
    onSearch({ keyword: keyword || undefined, sentiment, lowConfidence });
  };

  const handleReset = () => {
    setKeyword('');
    setSentiment(undefined);
    setLowConfidence(false);
    onSearch({});
  };

  return (
    <Card className="feature-card">
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={10}>
          <Input
            placeholder="按 sample_id 或文本关键词筛选"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleApply}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="情感类别"
            style={{ width: '100%' }}
            value={sentiment}
            onChange={setSentiment}
            options={[
              { label: '正向', value: 'positive' },
              { label: '中性', value: 'neutral' },
              { label: '负向', value: 'negative' },
            ]}
          />
        </Col>
        <Col xs={24} md={4}>
          <Typography.Text>仅低置信度</Typography.Text>
          <Switch checked={lowConfidence} onChange={setLowConfidence} style={{ marginLeft: 8 }} />
        </Col>
        <Col xs={24} md={4}>
          <Button
            type="primary"
            block
            onClick={handleApply}
          >
            应用筛选
          </Button>
        </Col>
        <Col xs={24} md={4}>
          <Button block onClick={handleReset}>
            重置条件
          </Button>
        </Col>
      </Row>
    </Card>
  );
}
