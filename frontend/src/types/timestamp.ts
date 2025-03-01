/**
 * タイムスタンプの型定義
 * 
 * @interface Timestamp
 * @property {string} id - タイムスタンプの一意のID
 * @property {number} time - 動画内の時間（秒）
 * @property {string} label - タイムスタンプのラベル
 * @property {string} [description] - タイムスタンプの詳細説明（オプション）
 */
export interface Timestamp {
  id: string;
  time: number;
  label: string;
  description?: string;
} 