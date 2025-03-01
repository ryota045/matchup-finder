import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import YouTubeTimestamp from '../timestamp/YouTubeTimestamp';
import { extractVideoId } from '../utils/YouTubeUtils';
import { TimestampItem } from '../timestamp/TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';

/**
 * YouTubeプレーヤーとタイムスタンプを組み合わせたコンポーネントのプロパティ
 * @interface YouTubePlayerWithTimestampsProps
 * @property {string} url - YouTube動画のURL
 * @property {TimestampItem[]} timestamps - タイムスタンプのリスト
 * @property {number|string} [width='100%'] - プレーヤーの幅
 * @property {number|string} [height='480'] - プレーヤーの高さ
 * @property {boolean} [autoplay=false] - 自動再生するかどうか
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト
 * @property {number} [selectedVideoIndex=-1] - 選択されている動画のインデックス
 * @property {function} [onVideoSelect] - 動画が選択されたときのコールバック関数
 */
interface YouTubePlayerWithTimestampsProps {
  url: string;
  timestamps: TimestampItem[];
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  videos?: MatchupVideo[];
  selectedVideoIndex?: number;
  onVideoSelect?: (index: number) => void;
}

/**
 * YouTube動画プレーヤーとタイムスタンプリストを組み合わせたコンポーネント
 * 
 * タイムスタンプをクリックすると、動画の該当時間にジャンプします。
 * 関連動画のリストも表示でき、動画を切り替えることができます。
 * 
 * @component
 * @example
 * ```tsx
 * <YouTubePlayerWithTimestamps
 *   url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   timestamps={[
 *     { time: 0, label: "イントロ" },
 *     { time: 30, label: "サビ" }
 *   ]}
 *   videos={relatedVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
 */
const YouTubePlayerWithTimestamps: React.FC<YouTubePlayerWithTimestampsProps> = ({
  url,
  timestamps,
  width = '100%',
  height = '480',
  autoplay = false,
  videos = [],
  selectedVideoIndex = -1,
  onVideoSelect,
}) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentTimestamps, setCurrentTimestamps] = useState<TimestampItem[]>(timestamps);

  // 親コンポーネントから渡されたURLが変更されたときに更新
  useEffect(() => {
    console.log('YouTubePlayerWithTimestamps: 親から渡されたURLが更新されました', url);
    setCurrentUrl(url);
    setCurrentTimestamps(timestamps);
  }, [url, timestamps]);

  /**
   * タイムスタンプがクリックされたときの処理
   * @param time クリックされたタイムスタンプの時間（秒）
   */
  const handleTimestampClick = (time: number) => {
    // 現在のURLからビデオIDを抽出
    const videoId = extractVideoId(currentUrl);
    if (!videoId) return;

    // 新しいURLを生成（タイムスタンプ付き、自動再生有効）
    const newUrl = `https://www.youtube.com/watch?v=${videoId}&t=${time}`;
    setCurrentUrl(newUrl);
    setCurrentTime(time);
  };

  /**
   * 動画が選択されたときの処理
   * @param index 選択された動画のインデックス
   */
  const handleVideoSelect = (index: number) => {
    console.log('YouTubePlayerWithTimestamps: 動画選択ハンドラーが呼び出されました', index);
    if (onVideoSelect) {
      onVideoSelect(index);
    }
  };

  return (
    <div className="youtube-player-with-timestamps">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow" style={{ minHeight: typeof height === 'string' && height.endsWith('px') ? height : typeof height === 'number' ? `${height}px` : `${height}px` }}>
          <YouTubePlayer 
            url={currentUrl} 
            width={width} 
            height={height} 
            autoplay={true} 
          />
        </div>
        <div className="md:w-80">
          <YouTubeTimestamp 
            timestamps={currentTimestamps} 
            onTimestampClick={handleTimestampClick}
            currentTime={currentTime}
            videos={videos}
            selectedVideoIndex={selectedVideoIndex}
            onVideoSelect={handleVideoSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 