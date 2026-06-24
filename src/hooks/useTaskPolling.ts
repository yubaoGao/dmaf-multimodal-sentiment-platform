import { useQuery } from '@tanstack/react-query';
import { fetchTaskDetail } from '../api/client';
import { TaskStatus } from '../api/types';

function shouldPoll(status?: TaskStatus) {
  return !!status && !['completed', 'failed'].includes(status);
}

export function useTaskPolling(taskId?: string) {
  return useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: () => fetchTaskDetail(taskId!),
    enabled: Boolean(taskId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return shouldPoll(status) ? 3000 : false;
    },
  });
}
