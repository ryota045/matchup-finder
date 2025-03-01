import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import YouTubeTimestamp, { TimestampItem, MatchupVideo } from './YouTubeTimestamp';

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

  // タイムスタンプがクリックされたときの処理
  const handleTimestampClick = (time: number) => {
    // 現在のURLからビデオIDを抽出
    const videoId = extractVideoId(currentUrl);
    if (!videoId) return;

    // 新しいURLを生成（タイムスタンプ付き、自動再生有効）
    const newUrl = `https://www.youtube.com/watch?v=${videoId}&t=${time}`;
    setCurrentUrl(newUrl);
    setCurrentTime(time);
  };

  // 動画が選択されたときの処理
  const handleVideoSelect = (index: number) => {
    console.log('YouTubePlayerWithTimestamps: 動画選択ハンドラーが呼び出されました', index);
    if (onVideoSelect) {
      onVideoSelect(index);
    }
  };

  // YouTubeのURLからビデオIDを抽出する関数
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
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