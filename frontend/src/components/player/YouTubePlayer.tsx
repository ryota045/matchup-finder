import React, { useEffect, useState } from 'react';
import { createEmbedUrl } from '../utils/YouTubeUtils';

/**
 * YouTubeプレーヤーコンポーネントのプロパティ
 * @interface YouTubePlayerProps
 * @property {string} url - YouTube動画のURL
 * @property {boolean} [autoplay=false] - 自動再生するかどうか
 */
interface YouTubePlayerProps {
  url: string;
  autoplay?: boolean;
}

/**
 * YouTube動画を埋め込み表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <YouTubePlayer 
 *   url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
 *   width="100%" 
 *   height="480px" 
 *   autoplay={true} 
 * />
 * ```
 */
const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  url,
  autoplay = false,
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');

  // URLが変更されたときに埋め込みURLを更新
  useEffect(() => {
    // console.log('YouTubePlayer: URLが更新されました', url);
    const newEmbedUrl = createEmbedUrl(url, autoplay);
    setEmbedUrl(newEmbedUrl);
  }, [url, autoplay]);

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/10 dark:bg-muted/5 rounded-lg">
        <div className="text-primary animate-pulse flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          動画を読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-player-container border border-border dark:border-gray-800 bg-black aspect-ratio-16/9 w-full h-full">
      <iframe
        key={embedUrl} // URLが変わるたびに再レンダリングされるようにkeyを設定
        width="100%"
        height="100%"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg w-full h-full"
      ></iframe>
    </div>
  );
};

export default YouTubePlayer; 