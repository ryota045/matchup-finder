import React from 'react';
import { formatTime } from '../utils/YouTubeUtils';

/**
 * タイムスタンプアイテムのデータ構造
 * @interface TimestampItem
 * @property {number} time - 秒単位の時間
 * @property {string} label - タイムスタンプのラベル
 */
export interface TimestampItem {
  time: number; // 秒単位
  label: string;
}

/**
 * タイムスタンプアイテムコンポーネントのプロパティ
 * @interface TimestampItemComponentProps
 * @property {TimestampItem} timestamp - タイムスタンプデータ
 * @property {boolean} isActive - 現在アクティブかどうか
 * @property {(time: number) => void} onClick - クリック時のコールバック関数
 */
interface TimestampItemComponentProps {
  timestamp: TimestampItem;
  isActive: boolean;
  onClick: (time: number) => void;
}

/**
 * 個別のタイムスタンプを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <TimestampItemComponent
 *   timestamp={{ time: 30, label: "サビ" }}
 *   isActive={false}
 *   onClick={handleTimestampClick}
 * />
 * ```
 */
const TimestampItemComponent: React.FC<TimestampItemComponentProps> = ({
  timestamp,
  isActive,
  onClick
}) => {
  return (
    <li 
      className={`
        p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors
        ${isActive ? 'text-blue-600 font-medium' : ''}
      `}
      onClick={() => onClick(timestamp.time)}
      role="button"
      tabIndex={0}
      aria-label={`${formatTime(timestamp.time)} - ${timestamp.label}`}
    >
      <span className="inline-block w-12 text-gray-600">{formatTime(timestamp.time)}</span>
      <span className="ml-2">{timestamp.label}</span>
    </li>
  );
};

export default TimestampItemComponent; 