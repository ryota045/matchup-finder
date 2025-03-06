import React, { useEffect, useRef, useState } from 'react';
import { createEmbedUrl, extractStartTime } from '../../utils/YouTubeUtils';

/**
 * YouTubeプレーヤーコンポーネントのプロパティ
 * @interface YouTubePlayerProps
 * @property {string} url - YouTube動画のURL
 * @property {boolean} [autoplay=false] - 自動再生するかどうか
 * @property {(time: number) => void} [onTimeUpdate] - 再生時間が更新されたときのコールバック関数
 */
interface YouTubePlayerProps {
  url: string;
  autoplay?: boolean;
  onTimeUpdate?: (time: number) => void;
}

// グローバルウィンドウオブジェクトに型を拡張
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
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
  onTimeUpdate
}) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<any | null>(null);
  const playerInitializedRef = useRef<boolean>(false);
  const urlRef = useRef<string>(url);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // URLが変更されたときに埋め込みURLを更新
  useEffect(() => {
    // console.log('YouTubePlayer: URLが更新されました', url);
    const newEmbedUrl = createEmbedUrl(url, autoplay);
    setEmbedUrl(newEmbedUrl);
    urlRef.current = url;
    
    // URLが変更されたら、プレーヤーを再初期化する
    if (window.YT && window.YT.Player && playerInitializedRef.current) {
      // 既存のプレーヤーを破棄
      if (playerRef.current) {
        playerRef.current.destroy();
        playerInitializedRef.current = false;
      }
      
      // 少し遅延させてから再初期化
      setTimeout(() => {
        const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
        if (!videoId) return;
        
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: videoId,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            rel: 0,
            modestbranding: 1,
          }
        });
        
        playerInitializedRef.current = true;
      }, 100);
    }
  }, [url, autoplay]);

  // YouTube IFrame APIの読み込みと初期化
  useEffect(() => {
    // YouTube IFrame APIがまだ読み込まれていない場合は読み込む
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    // プレーヤーの初期化関数
    const initializePlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy(); // 既存のプレーヤーを破棄
      }

      const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      
      if (!videoId) return;

      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
        }
      });

      playerInitializedRef.current = true;
    };

    // YouTube IFrame APIが読み込まれたときに呼び出される関数
    window.onYouTubeIframeAPIReady = () => {
      initializePlayer();
    };

    // YouTube IFrame APIが既に読み込まれている場合は直接初期化
    if (window.YT && window.YT.Player) {
      initializePlayer();
    }

    // コンポーネントのクリーンアップ
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [url, autoplay]);

  // プレーヤーの準備完了時の処理
  const onPlayerReady = (event: any) => {
    // URLからスタート時間を抽出して、その時間からスタート
    const startTime = extractStartTime(urlRef.current);
    if (startTime) {
      event.target.seekTo(startTime);
    }

    // 定期的に再生時間を更新するインターバルを設定
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
    }

    timeUpdateIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const time = playerRef.current.getCurrentTime();
        // 前回の時間と異なる場合のみ更新
        if (Math.abs(time - lastTimeRef.current) > 0.1) {
          setCurrentTime(time);
          lastTimeRef.current = time;
          // console.log("現在の再生時間:", time);
          if (onTimeUpdate) {
            onTimeUpdate(time);
          }
        }
      }
    }, 500); // 500ミリ秒ごとに更新
  };

  // 再生状態が変化したときの処理
  const onPlayerStateChange = (event: any) => {
    // 再生中の場合は現在の再生時間を取得
    if (event.data === window.YT.PlayerState.PLAYING) {
      const time = event.target.getCurrentTime();
      setCurrentTime(time);
      lastTimeRef.current = time;
      // console.log("再生開始時の時間:", time);
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };

  return (
    <div className="youtube-player-container border border-border dark:border-gray-800 bg-black aspect-ratio-16/9 w-full h-full">
      {embedUrl ? (
        <div id="youtube-player" className="w-full h-full"></div>
      ) : (
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-primary animate-pulse flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            動画を読み込み中...
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubePlayer; 