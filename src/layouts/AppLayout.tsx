import { BarChartOutlined, HistoryOutlined, UploadOutlined } from '@ant-design/icons';
import { Layout, Menu, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <BarChartOutlined />, label: '分析总览' },
  { key: '/tasks/new', icon: <UploadOutlined />, label: '新建任务' },
  { key: '/tasks/history', icon: <HistoryOutlined />, label: '历史记录' },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = (() => {
    const pathname = location.pathname;
    if (pathname === '/') return '/';
    if (pathname === '/tasks/new') return '/tasks/new';
    if (pathname === '/tasks/history' || pathname.startsWith('/tasks/')) return '/tasks/history';
    return '/';
  })();

  return (
    <Layout className="app-shell">
      <Sider width={248} breakpoint="lg" collapsedWidth={0} className="app-sider">
        <div className="brand-block">
          <Typography.Title level={3} className="brand-title">
            DMAF Platform
          </Typography.Title>
          <Typography.Paragraph className="brand-subtitle">
            多模态图文情感分析平台
          </Typography.Paragraph>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={items}
          onClick={({ key }) => navigate(key)}
          className="app-menu"
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div>
            <Typography.Title level={2} className="page-title">
              基于 DMAF 的多模态情感分析
            </Typography.Title>
            <Typography.Text className="page-subtitle">
              支持图文弱对齐场景下的异步批量推理与结果分析
            </Typography.Text>
          </div>
        </Header>
        <Content className="app-content">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
