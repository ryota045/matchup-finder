import { useState, useCallback } from 'react';
import { MatchupVideo } from '@/components/playlist/VideoItem';
import { extractTimestampFromUrl, extractVideoId } from '@/utils/YouTubeUtils';

/**
 * 動画選択に関連する状態とロジックを管理するカスタムフック
 * 
 * @param videos 表示する動画リスト
 * @param allVideos 全ての動画リスト（検索結果で絞られる前）
 * @returns 動画選択に関連する状態と関数
 */
const useVideoSelection = (videos: MatchupVideo[], allVideos: MatchupVideo[]) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<MatchupVideo | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');

  /**
   * タイムスタンプがクリックされたときの処理
   * @param time クリックされたタイムスタンプの時間（秒）
   */
  const handleTimestampClick = useCallback((time: number) => {
    // 現在のURLからビデオIDを抽出
    const videoId = extractVideoId(currentUrl);
    if (!videoId) return;
    
    // 新しいURLを生成（タイムスタンプ付き、自動再生有効）
    const newUrl = `https://www.youtube.com/watch?v=${videoId}&t=${time}`;
    setCurrentUrl(newUrl);
    
    // 現在の再生時間を即座に更新
    setCurrentTime(time);
    
    // 現在の動画情報は維持（URLが変わっても同じ動画なので）
  }, [currentUrl]);

  /**
   * 動画が選択されたときの処理
   * @param url 選択された動画のURL
   */
  const handleVideoSelect = useCallback((url: string) => {
    // 選択された動画のURLを直接設定
    if (url) {
      // 現在のURLと同じ場合でも、強制的に再読み込みするために一度空にする
      setCurrentUrl('');
      
      // 非同期で実行して、URLの変更が反映されるようにする
      setTimeout(() => {
        setCurrentUrl(url);
        setSelectedVideoUrl(url); // 選択された動画のURLを保存

        // url からtimestampを取得
        const timestamp = extractTimestampFromUrl(url);
        setCurrentTime(timestamp || 0);
        
        // URLに一致する動画を検索
        const foundVideo = [...videos, ...allVideos].find(video => video.url === url);
        if (foundVideo) {
          setCurrentVideo(foundVideo);
        }
      }, 300);
    }
  }, [videos, allVideos]);

  return {
    currentUrl,
    currentTime,
    currentVideo,
    selectedVideoUrl,
    setCurrentUrl,
    setCurrentTime,
    setCurrentVideo,
    setSelectedVideoUrl,
    handleTimestampClick,
    handleVideoSelect
  };
};

export default useVideoSelection; 