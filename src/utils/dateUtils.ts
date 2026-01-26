/**
 * 相対時間をフォーマット（例: "3日前", "2時間前"）
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
};

/**
 * 日時を日本語形式でフォーマット
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 日時を詳細な日本語形式でフォーマット（秒なし）
 */
export const formatDateTimeDetailed = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('ja-JP');
};
