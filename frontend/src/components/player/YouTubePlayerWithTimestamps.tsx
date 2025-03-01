import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import YouTubeTimestamp from '../timestamp/YouTubeTimestamp';
import { extractVideoId } from '../utils/YouTubeUtils';
import { TimestampItem } from '../timestamp/TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';

/**
 * YouTubeプレーヤーとタイムスタンプを組み合わせたコンポーネントのプロパティ
 * @interface YouTubePlayerWithTimestampsProps
 * @property {number|string} [width='100%'] - プレーヤーの幅
 * @property {number|string} [height='480'] - プレーヤーの高さ
 * @property {boolean} [autoplay=false] - 自動再生するかどうか
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 */
interface YouTubePlayerWithTimestampsProps {
  // url: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[]; // 検索結果で絞られる前の全ての動画リスト
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
 *     { time: 0, label: "イントロ", videoTitle: "動画タイトル" },
 *     { time: 30, label: "サビ", videoTitle: "動画タイトル" }
 *   ]}
 *   videos={relatedVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
 */
const YouTubePlayerWithTimestamps: React.FC<YouTubePlayerWithTimestampsProps> = ({
  // url,
  width = '100%',
  height = '480',
  autoplay = false,
  videos = [],
  allVideos = [], // 検索結果で絞られる前の全ての動画リスト
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);

  // 親コンポーネントから渡されたURLが変更されたときに更新
  // useEffect(() => {
  //   console.log('YouTubePlayerWithTimestamps: 親から渡されたURLが更新されました', url);
  //   console.log('YouTubePlayerWithTimestamps: 選択された動画インデックス', selectedVideoIndex);
  //   console.log('YouTubePlayerWithTimestamps: 動画数', videos.length);
    
  //   // 選択された動画のURLを使用
  //   if (selectedVideoIndex >= 0 && selectedVideoIndex < videos.length) {
  //     const selectedVideo = videos[selectedVideoIndex];
  //     console.log('YouTubePlayerWithTimestamps: 選択された動画', selectedVideo.title, selectedVideo.directory);
  //     console.log('YouTubePlayerWithTimestamps: 選択された動画のURL', selectedVideo.url);
      
  //     // 選択された動画のURLを設定
  //     setCurrentUrl(selectedVideo.url);
      
  //     // タイムスタンプがない場合は、デフォルトのタイムスタンプを作成
  //     if (timestamps.length === 0) {
  //       const defaultTimestamps: TimestampItem[] = [
  //         {
  //           time: 0,
  //           label: "動画の開始",
  //           videoTitle: selectedVideo.title
  //         }
  //       ];
  //       setCurrentTimestamps(defaultTimestamps);
  //     } else {
  //       // 既存のタイムスタンプに動画タイトルを追加
  //       const updatedTimestamps = timestamps.map(timestamp => ({
  //         ...timestamp,
  //         videoTitle: timestamp.videoTitle || selectedVideo.title
  //       }));
  //       setCurrentTimestamps(updatedTimestamps);
  //     }
  //   } else {
  //     console.log('YouTubePlayerWithTimestamps: 選択された動画が見つかりません');
  //     // 選択された動画がない場合は、親から渡されたURLを使用
  //     setCurrentUrl(url);
  //     setCurrentTimestamps(timestamps);
  //   }
  // }, [url, timestamps, videos, selectedVideoIndex]);

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
  const handleVideoSelect = (url: string) => {
    console.log('YouTubePlayerWithTimestamps: 動画選択ハンドラーが呼び出されました', url);
    // if (onVideoSelect) {
      // 選択された動画のURLを直接設定
      if (url) {
        setCurrentUrl(url);
      }
      
      // 親コンポーネントにも通知
      // onVideoSelect(url);
    // }
  };

  return (
    <div className="youtube-player-with-timestamps bg-background dark:bg-background">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 動画プレーヤーを固定高さのコンテナで囲む */}
        <div className="flex-grow rounded-lg overflow-hidden border border-border dark:border-gray-800 bg-card/5 dark:bg-black/30 shadow-sm dark:shadow-xl" style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '480px', maxHeight: '480px', flexShrink: 0 }}>
          <div className="h-full">
            <YouTubePlayer 
              url={currentUrl} 
              width={width} 
              height="100%" 
              autoplay={true} 
            />
          </div>
        </div>
        <div className="md:w-80 w-full md:flex-shrink-0">
          <YouTubeTimestamp 
            onTimestampClick={handleTimestampClick}
            currentTime={currentTime}
            videos={videos}
            allVideos={allVideos} // 全ての動画リストを渡す
            onVideoSelect={handleVideoSelect}
            url={currentUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 