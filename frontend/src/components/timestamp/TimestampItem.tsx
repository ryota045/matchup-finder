import React from 'react';
import { formatTime } from '../../utils/YouTubeUtils';

/**
 * タイムスタンプアイテムのデータ構造
 * @interface TimestampItem
 * @property {number} time - 秒単位の時間（detect_timeに対応）
 * @property {string} label - タイムスタンプのラベル
 * @property {string} [videoTitle] - 動画のタイトル（video_titleに対応）
 * @property {string} [originalDetectTime] - 元のdetect_time文字列（HH:MM:SS形式）
 * @property {string} [sourceVideo] - タイムスタンプの元の動画タイトル
 * @property {number} [sourceVideoIndex] - タイムスタンプの元の動画インデックス
 * @property {string} [chara1] - 1人目のキャラクター名
 * @property {string} [chara2] - 2人目のキャラクター名
 */
export interface TimestampItem {
  time: number; // 秒単位（detect_timeに対応）
  label: string;
  videoTitle?: string; // 動画のタイトル（video_titleに対応）
  originalDetectTime?: string; // 元のdetect_time文字列
  sourceVideo?: string; // タイムスタンプの元の動画タイトル
  sourceVideoIndex?: number; // タイムスタンプの元の動画インデックス
  chara1?: string; // 1人目のキャラクター名
  chara2?: string; // 2人目のキャラクター名
}

/**
 * タイムスタンプアイテムコンポーネントのプロパティ
 * @interface TimestampItemComponentProps
 * @property {TimestampItem} timestamp - タイムスタンプデータ
 * @property {boolean} isActive - 現在アクティブかどうか
 * @property {(time: number) => void} onClick - クリック時のコールバック関数
 * @property {boolean} [showTitle=false] - タイトルを表示するかどうか
 */
interface TimestampItemComponentProps {
  timestamp: TimestampItem;
  isActive: boolean;
  onClick: (time: number) => void;
  showTitle?: boolean;
}

/**
 * 個別のタイムスタンプを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <TimestampItemComponent
 *   timestamp={{ 
 *     time: 30, 
 *     label: "サビ", 
 *     videoTitle: "動画タイトル", 
 *     originalDetectTime: "00:30",
 *     sourceVideo: "元の動画タイトル",
 *     sourceVideoIndex: 1,
 *     chara1: "マリオ",
 *     chara2: "リンク"
 *   }}
 *   isActive={false}
 *   onClick={handleTimestampClick}
 *   showTitle={false}
 * />
 * ```
 */
const TimestampItemComponent: React.FC<TimestampItemComponentProps> = ({
  timestamp,
  isActive,
  onClick,
  showTitle = false
}) => {
  return (
    <li 
      className={`
        p-2 rounded cursor-pointer transition-all duration-200
        hover:bg-accent/10
        ${isActive 
          ? 'bg-primary/10 dark:bg-primary/5 text-primary font-medium border-l-2 border-primary' 
          : 'text-foreground'
        }
      `}
      onClick={() => onClick(timestamp.time)}
      role="button"
      tabIndex={0}
      aria-label={`${formatTime(timestamp.time)} - ${timestamp.label}`}
    >
      <div className="flex flex-col">
        {showTitle && timestamp.videoTitle && (
          <span className="text-sm font-medium text-foreground mb-1 truncate">{timestamp.videoTitle}</span>
        )}
        <div className="flex items-center">
          <button
            className="p-1 rounded-full hover:opacity-100 hover:bg-primary/10 text-primary transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onClick(timestamp.time);
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
          <span className="inline-block w-12 text-sm font-mono text-muted-foreground bg-muted/20 dark:bg-muted/10 rounded px-1 py-0.5 text-center">
            {timestamp.originalDetectTime || formatTime(timestamp.time)}
          </span>
          {/* <span className="ml-2 flex-grow">{timestamp.label}</span> */}

        </div>
      </div>
    </li>
  );
};

export default TimestampItemComponent; 