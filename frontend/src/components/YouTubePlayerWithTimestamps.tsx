import React, { useState, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import YouTubeTimestamp, { TimestampItem } from './YouTubeTimestamp';

interface YouTubePlayerWithTimestampsProps {
  url: string;
  timestamps: TimestampItem[];
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
}

const YouTubePlayerWithTimestamps: React.FC<YouTubePlayerWithTimestampsProps> = ({
  url,
  timestamps,
  width = '100%',
  height = '315',
  autoplay = false,
}) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentTime, setCurrentTime] = useState(0);

  // URLが変更されたら、現在のURLを更新
  useEffect(() => {
    setCurrentUrl(url);
  }, [url]);

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

  // YouTubeのURLからビデオIDを抽出する関数
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="youtube-player-with-timestamps">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <YouTubePlayer 
            url={currentUrl} 
            width={width} 
            height={height} 
            autoplay={true} 
          />
        </div>
        <div className="md:w-64">
          <YouTubeTimestamp 
            timestamps={timestamps} 
            onTimestampClick={handleTimestampClick}
            currentTime={currentTime}
          />
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 