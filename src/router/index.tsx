import { Suspense, lazy, type ReactNode } from 'react';
import { Spin } from 'antd';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const UploadTaskPage = lazy(() => import('../pages/UploadTaskPage').then((module) => ({ default: module.UploadTaskPage })));
const HistoryPage = lazy(() => import('../pages/HistoryPage').then((module) => ({ default: module.HistoryPage })));
const TaskDetailPage = lazy(() => import('../pages/TaskDetailPage').then((module) => ({ default: module.TaskDetailPage })));

function withSuspense(node: ReactNode) {
  return (
    <Suspense fallback={<Spin size="large" fullscreen />}>
      {node}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'tasks/new', element: withSuspense(<UploadTaskPage />) },
      { path: 'tasks/history', element: withSuspense(<HistoryPage />) },
      { path: 'tasks/:taskId', element: withSuspense(<TaskDetailPage />) },
    ],
  },
]);
