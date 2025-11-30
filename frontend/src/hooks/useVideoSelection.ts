import { useState, useCallback, useRef, useEffect } from 'react';
import { MatchupVideo } from '@/components/playlist/VideoItem';
import { extractTimestampFromUrl, extractVideoId } from '@/utils/YouTubeUtils';

/**
 * 動画選択に関連する状態とロジックを管理するカスタムフック
 * 
 * @param videos 表示する動画リスト
 * @param allVideos 全ての動画リスト（検索結果で絞られる前）
 * @param playerContainerRef プレーヤーコンテナへの参照（オプション）
 * @returns 動画選択に関連する状態と関数
 */
const useVideoSelection = (
  videos: MatchupVideo[], 
  allVideos: MatchupVideo[],
  playerContainerRef?: React.RefObject<HTMLDivElement | null>
) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<MatchupVideo | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
  const [isChangingVideo, setIsChangingVideo] = useState(false);
  
  // タイムアウト参照
  const changeVideoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetChangingFlagTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // コンポーネントのアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (changeVideoTimeoutRef.current) {
        clearTimeout(changeVideoTimeoutRef.current);
        changeVideoTimeoutRef.current = null;
      }
      if (resetChangingFlagTimeoutRef.current) {
        clearTimeout(resetChangingFlagTimeoutRef.current);
        resetChangingFlagTimeoutRef.current = null;
      }
    };
  }, []);

  /**
   * タイムスタンプがクリックされたときの処理
   * @param time クリックされたタイムスタンプの時間（秒）
   */
  const handleTimestampClick = useCallback((time: number) => {
    try {
      // 現在のURLからビデオIDを抽出
      const videoId = extractVideoId(currentUrl);
      if (!videoId) return;
      
      // 新しいURLを生成（タイムスタンプ付き）
      const newUrl = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(time)}`;
      
      // 現在の再生時間を即座に更新
      setCurrentTime(time);
      
      // URLを更新（同じ動画内でのタイムスタンプ変更なので、isChangingVideoフラグは立てない）
      setCurrentUrl(newUrl);
    } catch (error) {
      console.error('Error in handleTimestampClick:', error);
    }
  }, [currentUrl]);

  /**
   * 動画が選択されたときの処理
   * @param url 選択された動画のURL
   */
  const handleVideoSelect = useCallback((url: string) => {
    // 無効なURLや既に動画変更中の場合は処理をスキップ
    if (!url || isChangingVideo) return;
    
    try {
      // 現在のURLと新しいURLのビデオIDを比較
      const currentVideoId = extractVideoId(currentUrl);
      const newVideoId = extractVideoId(url);
      
      // 別の動画に切り替わる場合のみ、動画変更中フラグをセット
      const isDifferentVideo = currentVideoId !== newVideoId;
      
      if (isDifferentVideo) {
        // 前回のタイムアウトがあればクリア
        if (changeVideoTimeoutRef.current) {
          clearTimeout(changeVideoTimeoutRef.current);
          changeVideoTimeoutRef.current = null;
        }
        if (resetChangingFlagTimeoutRef.current) {
          clearTimeout(resetChangingFlagTimeoutRef.current);
          resetChangingFlagTimeoutRef.current = null;
        }
        
        // 動画変更中フラグをセット
        setIsChangingVideo(true);
      }
      
      // URLに一致する動画を検索
      const foundVideo = [...videos, ...allVideos].find(video => video.url === url);
      
      // 選択された動画URLを設定
      setSelectedVideoUrl(url);
      
      // タイムスタンプを取得
      const timestamp = extractTimestampFromUrl(url);
      
      // 新しい動画情報を設定
      setCurrentUrl(url);
      
      if (foundVideo) {
        setCurrentVideo(foundVideo);
      }
      
      // タイムスタンプを設定
      setCurrentTime(timestamp || 0);
      
      // 画面の一番下までスクロール
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 300);
      
      // 別の動画に切り替わった場合のみ、動画変更中フラグをリセット
      if (isDifferentVideo) {
        resetChangingFlagTimeoutRef.current = setTimeout(() => {
          setIsChangingVideo(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error in handleVideoSelect:', error);
      setIsChangingVideo(false);
    }
  }, [videos, allVideos, isChangingVideo, currentUrl]);

  return {
    currentUrl,
    currentTime,
    currentVideo,
    selectedVideoUrl,
    isChangingVideo,
    setCurrentUrl,
    setCurrentTime,
    setCurrentVideo,
    setSelectedVideoUrl,
    handleTimestampClick,
    handleVideoSelect
  };
};

export default useVideoSelection; 