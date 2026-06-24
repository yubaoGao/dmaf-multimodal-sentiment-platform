import dayjs from 'dayjs';

export function formatDateTime(value?: string) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '--';
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatDuration(seconds?: number) {
  if (!seconds) return '--';
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = seconds % 60;
  return `${minutes} 分 ${remainSeconds} 秒`;
}
