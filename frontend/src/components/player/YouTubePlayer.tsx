import React, { useEffect, useState } from 'react';
import { createEmbedUrl } from '../utils/YouTubeUtils';

/**
 * YouTubeプレーヤーコンポーネントのプロパティ
 * @interface YouTubePlayerProps
 * @property {string} url - YouTube動画のURL
 * @property {number|string} [width='100%'] - プレーヤーの幅
 * @property {number|string} [height='100%'] - プレーヤーの高さ
 * @property {boolean} [autoplay=false] - 自動再生するかどうか
 */
interface YouTubePlayerProps {
  url: string;
  width?: number | string;
  height?: number | string;
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
  width = '100%',
  height = '100%',
  autoplay = false,
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');

  // URLが変更されたときに埋め込みURLを更新
  useEffect(() => {
    console.log('YouTubePlayer: URLが更新されました', url);
    const newEmbedUrl = createEmbedUrl(url, autoplay);
    setEmbedUrl(newEmbedUrl);
  }, [url, autoplay]);

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