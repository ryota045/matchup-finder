import React from 'react';
import { TimestampItem } from '../timestamp/TimestampItem';

/**
 * マッチアップ動画のデータ構造
 * @interface MatchupVideo
 * @property {string} url - 動画のURL
 * @property {TimestampItem[]} timestamps - タイムスタンプのリスト
 * @property {string} title - 動画のタイトル
 * @property {string} matchupKey - マッチアップの一意のキー
 * @property {string} directory - 動画が属するディレクトリ
 * @property {string} chara1 - 1人目のキャラクター名
 * @property {string} chara2 - 2人目のキャラクター名
 */
export interface MatchupVideo {
  url: string;
  timestamps: TimestampItem[];
  title: string;
  matchupKey: string;
  directory: string;
  chara1: string;
  chara2: string;
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
 *   onClick={() => handleVideoSelect(videoIndex)}
 * />
 * ```
 */
const VideoItem: React.FC<VideoItemProps> = ({ video, isSelected, onClick }) => {
  return (
    <div 
      className={`p-2 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <div className="text-sm font-medium mb-1 truncate">{video.title || video.matchupKey}</div>
      <div className="text-xs text-gray-500">{video.timestamps.length} タイムスタンプ</div>
    </div>
  );
};

export default VideoItem; 