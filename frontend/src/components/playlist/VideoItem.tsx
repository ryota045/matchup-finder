import React from 'react';
import { TimestampItem } from '../timestamp/TimestampItem';
import { formatTime } from '../../utils/YouTubeUtils';

/**
 * マッチアップ動画のデータ構造
 * @interface MatchupVideo
 * @property {string} url - 動画のURL
 * @property {string} title - 動画のタイトル
 * @property {string} chara1 - 1人目のキャラクター名
 * @property {string} chara2 - 2人目のキャラクター名
 * @property {string} matchupKey - マッチアップの一意のキー
 * @property {string} directory - 動画が属するディレクトリ
 * @property {TimestampItem[]} timestamps - 動画のタイムスタンプリスト
 * @property {string} [upload_date] - 動画のアップロード日
 */
export interface MatchupVideo {
  url: string;
  title: string;
  chara1: string;
  chara2: string;
  matchupKey: string;
  directory: string;
  timestamps: TimestampItem[];
  upload_date?: string;
}

/**
 * 動画アイテムコンポーネントのプロパティ
 * @interface VideoItemProps
 * @property {MatchupVideo} video - 動画データ
 * @property {boolean} isSelected - 選択されているかどうか
 * @property {() => void} onClick - クリック時のコールバック関数
 */
interface VideoItemProps {
  video: MatchupVideo;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * プレイリスト内の個別の動画アイテムを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <VideoItem
 *   video={videoData}
 *   isSelected={true}
 *   onClick={handleVideoSelect}
 * />
 * ```
 */
const VideoItem: React.FC<VideoItemProps> = ({ video, isSelected, onClick }) => {
  // タイムスタンプの情報を取得
  const firstTimestamp = video.timestamps.length > 0 ? video.timestamps[0] : null;
  const hasMultipleTimestamps = video.timestamps.length > 1;
  
  // タイムスタンプがない場合は、デフォルトのタイムスタンプを作成
  if (video.timestamps.length === 0) {
    video.timestamps = [
      {
        time: 0,
        label: video.title || "動画の開始",
        videoTitle: video.title,
        originalDetectTime: "00:00"
      }
    ];
  }

  return (
    <div 
      className={`
        playlist-item
        ${isSelected ? 'playlist-item-active' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-medium truncate">{video.title}</h4>
        <div className="flex items-center mt-1">
          {firstTimestamp ? (
            <span className="text-xs text-muted-foreground">
              {/* hh:mm:ss形式でタイムスタンプを表示 */}
              {formatTime(firstTimestamp.time)}
              {hasMultipleTimestamps && ` (他 ${video.timestamps.length - 1} 件)`}
              {video.upload_date && ` - ${video.upload_date}`}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">
              タイムスタンプなし
              {video.upload_date && ` - ${video.upload_date}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoItem; 