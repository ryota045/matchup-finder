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

// グローバル変数
let youtubeApiLoaded = false;
let youtubeApiLoading = false;
let youtubeApiCallbacks: (() => void)[] = [];

// YouTube IFrame APIを読み込む関数
function loadYouTubeApi() {
  if (youtubeApiLoaded) return Promise.resolve();
  
  if (youtubeApiLoading) {
    return new Promise<void>((resolve) => {
      youtubeApiCallbacks.push(resolve);
    });
  }
  
  return new Promise<void>((resolve) => {
    youtubeApiLoading = true;
    youtubeApiCallbacks.push(resolve);
    
    // グローバルコールバックを設定
    window.onYouTubeIframeAPIReady = () => {
      youtubeApiLoaded = true;
      youtubeApiLoading = false;
      
      // 登録されたすべてのコールバックを実行
      youtubeApiCallbacks.forEach(callback => callback());
      youtubeApiCallbacks = [];
    };
    
    // スクリプトタグを作成
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.id = 'youtube-iframe-api';
    
    // スクリプトをDOMに追加
    document.head.appendChild(script);
  });
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
  const [isLoading, setIsLoading] = useState(true);
  const [videoId, setVideoId] = useState<string | null>(null);
  
  // 参照を管理
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any | null>(null);
  const playerElementId = useRef<string>(`youtube-player-${Math.random().toString(36).substring(2, 9)}`);
  const timeUpdateIntervalRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const urlRef = useRef<string>(url);
  
  // 画面の向きと寸法を管理するカスタムフック
  const { isLandscape, shortestDimension } = useOrientation();

  // URLからビデオIDを抽出
  useEffect(() => {
    if (!url) {
      setVideoId(null);
      setIsLoading(false);
      return;
    }

    try {
      // URLからビデオIDを抽出
      let newVideoId: string | null = null;
      
      // URLパターンに基づいてビデオIDを抽出
      if (url.includes('v=')) {
        const match = url.match(/[?&]v=([^&#]*)/);
        newVideoId = match && match[1] ? match[1] : null;
      } else if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?&#]*)/);
        newVideoId = match && match[1] ? match[1] : null;
      } else if (url.includes('/embed/')) {
        const match = url.match(/\/embed\/([^?&#]*)/);
        newVideoId = match && match[1] ? match[1] : null;
      }

      // 有効なビデオIDが抽出できた場合のみ設定
      if (newVideoId && newVideoId.length > 0) {
        // 同じビデオIDの場合は、setVideoIdを呼ばない（再初期化を防ぐ）
        if (newVideoId !== videoId) {
          setVideoId(newVideoId);
          setIsLoading(true);
        }
        urlRef.current = url;
      } else {
        console.error('Invalid YouTube URL or could not extract video ID:', url);
        setVideoId(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error extracting video ID from URL:', error);
      setVideoId(null);
      setIsLoading(false);
    }
  }, [url, videoId]);
  
  // URL変更時のタイムスタンプシーク処理（同じビデオID内での移動）
  useEffect(() => {
    if (!url || !playerRef.current || !videoId) return;
    
    const currentVideoId = playerRef.current.getVideoData?.()?.video_id;
    if (currentVideoId !== videoId) return; // 別の動画の場合はスキップ
    
    try {
      const startTime = extractStartTime(url);
      if (startTime !== null && startTime !== undefined) {
        // 同じ動画内でのシーク
        playerRef.current.seekTo(startTime, true);
      }
    } catch (error) {
      console.error('Error seeking to timestamp:', error);
    }
  }, [url, videoId]);

  // プレーヤーの初期化と更新
  useEffect(() => {
    if (!videoId) return;
    
    // 既存のプレーヤーをクリーンアップ
    cleanupPlayer();
    
    // YouTube APIを読み込み、プレーヤーを初期化
    const initializePlayer = async () => {
      try {
        // APIが読み込まれるのを待つ
        await loadYouTubeApi();
        
        // コンポーネントがアンマウントされていないか確認
        if (!containerRef.current) return;
        
        // プレーヤー要素が存在するか確認
        const playerElement = document.getElementById(playerElementId.current);
        if (!playerElement) {
          console.error(`Player element with ID ${playerElementId.current} not found`);
          setIsLoading(false);
          return;
        }
        
        // 既存のプレーヤーがある場合は新しいビデオをロード
        if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
          try {
            // 現在のURLからタイムスタンプを抽出
            const startTime = extractStartTime(urlRef.current) || 0;
            
            // 同じビデオIDの場合は、シークのみ行う
            const currentVideoId = playerRef.current.getVideoData?.()?.video_id;
            if (currentVideoId === videoId) {
              // シークのみ行い、読み込み状態は変更しない
              playerRef.current.seekTo(startTime, true); // allowSeekAhead を true に設定
              // isLoading状態は変更しない（シームレスな遷移のため）
              return;
            }
            
            // 異なるビデオIDの場合は、新しいビデオをロード
            playerRef.current.loadVideoById({
              videoId: videoId,
              startSeconds: startTime
            });
            
            // 少し遅延させてから読み込み完了とする
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            
            return;
          } catch (error) {
            console.error('Error loading new video:', error);
            // エラーが発生した場合は新しいプレーヤーを作成
            cleanupPlayer();
          }
        }
        
        // 新しいプレーヤーを初期化
        playerRef.current = new window.YT.Player(playerElementId.current, {
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            start: extractStartTime(urlRef.current) || 0
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
    };
    
    // プレーヤーを初期化
    initializePlayer();
    
    // クリーンアップ
    return () => {
      cleanupPlayer();
    };
  }, [videoId, autoplay]);

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
        // プレーヤーが初期化されている場合のみ破棄を試みる
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
        }
      } catch (error) {
        console.error('Error destroying YouTube player:', error);
      } finally {
        playerRef.current = null;
      }
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
    <div 
      ref={containerRef}
      className="youtube-player-container border border-border dark:border-gray-800 bg-black aspect-ratio-16\/9 w-full h-full" 
      style={containerStyle}
    >
      {isLoading && <LoadingIndicator />}
      <div id={playerElementId.current} className="w-full h-full"></div>
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
        読み込み中...
      </div>
    </div>
  );
};

export default YouTubePlayer; 