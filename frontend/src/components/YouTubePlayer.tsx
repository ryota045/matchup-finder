import React, { useEffect, useState } from 'react';

interface YouTubePlayerProps {
  url: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  url,
  width = '100%',
  height = '100%',
  autoplay = false,
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');

  // URLが変更されたときに埋め込みURLを更新
  useEffect(() => {
    console.log('YouTubePlayer: URLが更新されました', url);
    
    // YouTubeのURLからビデオIDを抽出
    const videoId = extractVideoId(url);
    if (!videoId) {
      console.error('無効なYouTube URL:', url);
      return;
    }

    // 埋め込みURLを作成
    let newEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
    
    // クエリパラメータを追加
    const queryParams = [];
    
    if (autoplay) {
      queryParams.push('autoplay=1');
    }
    
    const startTime = extractStartTime(url);
    if (startTime !== null) {
      queryParams.push(`start=${startTime}`);
    }
    
    if (queryParams.length > 0) {
      newEmbedUrl += `?${queryParams.join('&')}`;
    }

    console.log('新しい埋め込みURL:', newEmbedUrl);
    setEmbedUrl(newEmbedUrl);
  }, [url, autoplay]);

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

  if (!embedUrl) {
    return <div className="text-red-500">動画を読み込み中...</div>;
  }

  return (
    <div className="youtube-player-container" style={{ height: typeof height === 'string' && height.endsWith('px') ? height : typeof height === 'number' ? `${height}px` : height }}>
      <iframe
        key={embedUrl} // URLが変わるたびに再レンダリングされるようにkeyを設定
        width={width}
        height="100%"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ height: '100%', width: '100%' }}
      ></iframe>
    </div>
  );
};

export default YouTubePlayer; 