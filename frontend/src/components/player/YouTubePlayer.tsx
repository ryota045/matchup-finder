import React, { useEffect, useRef, useState } from 'react';
import { createEmbedUrl, extractStartTime } from '../../utils/YouTubeUtils';
import useOrientation from '@/hooks/useOrientation';

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
  // プレーヤーの状態を管理
  const [playerReady, setPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playerId] = useState(`youtube-player-${Math.random().toString(36).substring(2, 9)}`);
  
  // 参照を管理
  const playerRef = useRef<any | null>(null);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const urlRef = useRef<string>(url);
  
  // 画面の向きと寸法を管理するカスタムフック
  const { isLandscape, shortestDimension } = useOrientation();

  // YouTube IFrame APIの読み込み
  useEffect(() => {
    // YouTube IFrame APIがまだ読み込まれていない場合は読み込む
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // APIが読み込まれたときのコールバック
      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      // 既にAPIが読み込まれている場合
      setPlayerReady(true);
    }

    // クリーンアップ
    return () => {
      cleanupPlayer();
    };
  }, []);

  // URLからビデオIDを抽出
  useEffect(() => {
    if (!url) {
      setVideoId(null);
      return;
    }

    // URLからビデオIDを抽出
    let newVideoId: string | null = null;
    if (url.includes('v=')) {
      newVideoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      newVideoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('/embed/')) {
      newVideoId = url.split('/embed/')[1].split('?')[0];
    }

    setVideoId(newVideoId);
    urlRef.current = url;
    setIsLoading(true);
  }, [url]);

  // プレーヤーの初期化と更新
  useEffect(() => {
    // プレーヤーAPIが準備できていない、またはビデオIDがない場合は何もしない
    if (!playerReady || !videoId) {
      return;
    }

    // 既存のプレーヤーをクリーンアップ
    cleanupPlayer();

    // 少し遅延させてから初期化（DOMの更新を待つ）
    const initializationTimeout = setTimeout(() => {
      try {
        // プレーヤーを初期化
        playerRef.current = new window.YT.Player(playerId, {
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: handlePlayerReady,
            onStateChange: handlePlayerStateChange,
            onError: handlePlayerError,
          },
        });
      } catch (error) {
        console.error('YouTube Player initialization error:', error);
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(initializationTimeout);
    };
  }, [playerReady, videoId, autoplay, playerId]);

  // プレーヤーのクリーンアップ関数
  const cleanupPlayer = () => {
    // インターバルをクリア
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }

    // プレーヤーを破棄
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.error('Error destroying YouTube player:', error);
      }
      playerRef.current = null;
    }
  };

  // プレーヤーの準備完了時の処理
  const handlePlayerReady = (event: any) => {
    setIsLoading(false);

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
        try {
          const time = playerRef.current.getCurrentTime();
          // 前回の時間と異なる場合のみ更新
          if (Math.abs(time - lastTimeRef.current) > 0.1) {
            lastTimeRef.current = time;
            if (onTimeUpdate) {
              onTimeUpdate(time);
            }
          }
        } catch (error) {
          console.error('Error getting current time:', error);
        }
      }
    }, 500); // 500ミリ秒ごとに更新
  };

  // 再生状態が変化したときの処理
  const handlePlayerStateChange = (event: any) => {
    // 再生中の場合は現在の再生時間を取得
    if (event.data === window.YT.PlayerState.PLAYING) {
      try {
        const time = event.target.getCurrentTime();
        lastTimeRef.current = time;
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
      } catch (error) {
        console.error('Error in player state change:', error);
      }
    }
  };

  // プレーヤーエラー時の処理
  const handlePlayerError = (event: any) => {
    console.error('YouTube Player Error:', event.data);
    setIsLoading(false);
  };

  // プレイヤーコンテナのスタイルを動的に生成
  const containerStyle = {
    height: isLandscape && window.innerWidth < 768 ? `${shortestDimension}px` : '100%',
  };

  return (
    <div className="youtube-player-container border border-border dark:border-gray-800 bg-black aspect-ratio-16/9 w-full h-full" style={containerStyle}>
      {isLoading && <LoadingIndicator />}
      <div id={playerId} className="w-full h-full" key={`player-${videoId}`}></div>
    </div>
  );
};

/**
 * 読み込み中を表示するコンポーネント
 */
const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full absolute top-0 left-0 z-10 bg-black/70">
      <div className="text-primary animate-pulse flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>読み込み中...</span>
      </div>
    </div>
  );
};

export default YouTubePlayer; 