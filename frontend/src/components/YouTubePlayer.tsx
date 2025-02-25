import React from 'react';

interface YouTubePlayerProps {
  url: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  url,
  width = '100%',
  height = '315',
  autoplay = false,
}) => {
  // YouTubeのURLからビデオIDを抽出する関数
  const extractVideoId = (url: string): string | null => {
    // 通常のYouTube URL (例: https://www.youtube.com/watch?v=VIDEO_ID)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // URLから開始時間（秒）を抽出する関数
  const extractStartTime = (url: string): number | null => {
    // t=XXXパラメータを検索（秒単位）
    const timeRegExp = /[?&]t=(\d+)s?/;
    const timeMatch = url.match(timeRegExp);
    
    if (timeMatch && timeMatch[1]) {
      return parseInt(timeMatch[1], 10);
    }
    
    // t=1m30sのような形式を検索
    const complexTimeRegExp = /[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/;
    const complexTimeMatch = url.match(complexTimeRegExp);
    
    if (complexTimeMatch) {
      const hours = complexTimeMatch[1] ? parseInt(complexTimeMatch[1], 10) * 3600 : 0;
      const minutes = complexTimeMatch[2] ? parseInt(complexTimeMatch[2], 10) * 60 : 0;
      const seconds = complexTimeMatch[3] ? parseInt(complexTimeMatch[3], 10) : 0;
      
      if (hours > 0 || minutes > 0 || seconds > 0) {
        return hours + minutes + seconds;
      }
    }
    
    return null;
  };

  const videoId = extractVideoId(url);
  const startTime = extractStartTime(url);
  
  if (!videoId) {
    return <div className="text-red-500">無効なYouTube URLです</div>;
  }

  // 埋め込みURLを作成
  let embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  // クエリパラメータを追加
  const queryParams = [];
  
  if (autoplay) {
    queryParams.push('autoplay=1');
  }
  
  if (startTime !== null) {
    queryParams.push(`start=${startTime}`);
  }
  
  if (queryParams.length > 0) {
    embedUrl += `?${queryParams.join('&')}`;
  }

  return (
    <div className="youtube-player-container">
      <iframe
        width={width}
        height={height}
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubePlayer; 