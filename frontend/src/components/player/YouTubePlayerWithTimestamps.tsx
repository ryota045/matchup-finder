import React, { useState, useEffect, useRef, useMemo } from 'react';
import { extractTimestampFromUrl, extractVideoId } from '../../utils/YouTubeUtils';
import { MatchupVideo } from '../playlist/VideoItem';
import PlayerControls from './PlayerControls';
import PlayerContent from './PlayerContent';
import SidebarContent from './SidebarContent';
import { getCharacterGroupedVideos, groupVideosByDirectory } from '@/utils/videoUtils';
import useVideoSelection from '@/hooks/useVideoSelection';
import usePlayerLayout from '@/hooks/usePlayerLayout';

/**
 * YouTubeプレーヤーとタイムスタンプリストのプロパティ
 * @interface YouTubePlayerWithTimestampsProps
 * @property {MatchupVideo[]} [videos=[]] - 表示する動画リスト
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 * @property {string} [selectedCharacter] - 選択されたキャラクター名（英語）
 * @property {string[]} [selectedOpponentCharacters=[]] - 選択された対戦キャラクター名の配列（英語）
 */
interface YouTubePlayerWithTimestampsProps {
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[];
  selectedCharacter?: string;
  selectedOpponentCharacters?: string[];
}

/**
 * YouTube動画プレーヤーとタイムスタンプリストを組み合わせたコンポーネント
 * 
 * タイムスタンプをクリックすると、動画の該当時間にジャンプします。
 * 関連動画のリストも表示でき、動画を切り替えることができます。
 * 
 * @component
 */
const YouTubePlayerWithTimestamps: React.FC<YouTubePlayerWithTimestampsProps> = ({
  videos = [],
  allVideos = [],
  selectedCharacter,
  selectedOpponentCharacters = [],
}) => {
  // プレーヤーの状態管理
  const {
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
  } = useVideoSelection(videos, allVideos);

  // レイアウト状態管理
  const {
    isPlaylistOpen,
    isTimestampOpen,
    activeTab,
    playerContainerRef,
    expandedGroups,
    expandedDirectories,
    setIsPlaylistOpen,
    setIsTimestampOpen,
    setActiveTab,
    setExpandedGroups,
    setExpandedDirectories,
    handlePlaylistToggle,
    handleTimestampToggle,
    handleTabChange,
    toggleDirectoryAccordion,
    toggleAccordion
  } = usePlayerLayout();
  
  // 使用キャラクターと対戦キャラクターの両方が選択されているかチェック
  const hasRequiredCharacters = !!selectedCharacter && selectedOpponentCharacters.length > 0;
  const isSelectedCharacter = !!selectedCharacter;
  const isSelectedOpponentCharacters = !!selectedOpponentCharacters.length;
  
  // アップロード日でソートされた動画リストを作成
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      // upload_dateがない場合は後ろに配置
      if (!a.upload_date) return 1;
      if (!b.upload_date) return -1;
      
      // 降順（最新順）でソート
      return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
    });
  }, [videos]);

  // 必要なキャラクターが選択されていない場合、プレイリストとタイムスタンプを閉じる
  useEffect(() => {
    if (hasRequiredCharacters) {
      setIsPlaylistOpen(true);
      // モバイル表示の場合のみタイムスタンプを閉じる
      if (window.innerWidth < 640) {
        setIsTimestampOpen(false);
        setActiveTab('playlist');
      }
    }
  }, [selectedCharacter, selectedOpponentCharacters, hasRequiredCharacters, setIsPlaylistOpen, setIsTimestampOpen, setActiveTab]);

  // URLが変更されたときに対応する動画情報を更新
  useEffect(() => {
    // 必要なキャラクターが選択されていない場合は何もしない
    if (!hasRequiredCharacters) {
      setCurrentUrl('');
      setCurrentVideo(null);
      setSelectedVideoUrl('');
      return;
    }
    
    // 動画リストが空でない場合でも、自動的に動画を選択しない
    // ユーザーがプレイリストから選択するまで待機
    setCurrentUrl('');
    setCurrentVideo(null);
    setSelectedVideoUrl('');
  }, [videos, allVideos, hasRequiredCharacters, setCurrentUrl, setCurrentVideo, setSelectedVideoUrl]);

  // URLが変更されたときに対応する動画情報を更新
  useEffect(() => {
    if (currentUrl && !currentVideo) {
      // URLからビデオIDを抽出
      const videoId = extractVideoId(currentUrl);
      if (!videoId) return;

      // 全ての動画から一致するものを探す
      const allAvailableVideos = [...videos, ...allVideos];
      const matchingVideo = allAvailableVideos.find(video => {
        const videoIdFromList = extractVideoId(video.url);
        return videoIdFromList === videoId;
      });

      if (matchingVideo) {
        setCurrentVideo(matchingVideo);
      }
    }
  }, [currentUrl, currentVideo, videos, allVideos, setCurrentVideo]);

  // 動画が選択されているかどうか
  const isVideoSelected = !!currentUrl && !!currentVideo && !isChangingVideo;
  
  // グループ化された動画
  const groupedVideosByDirectory = groupVideosByDirectory(videos);

  return (
    <div className="youtube-player-with-timestamps flex flex-col md:flex-row gap-4 w-full">
      <div className="flex flex-col w-full">
        {/* プレーヤーコントロール */}
        <PlayerControls 
          isVideoSelected={isVideoSelected}
          currentVideo={currentVideo}
          selectedCharacter={selectedCharacter}
          selectedOpponentCharacters={selectedOpponentCharacters}
        />
        
        <div className="flex flex-col player-md:flex-row gap-4 w-full">
          {/* プレーヤーコンテンツ */}
          <div className="w-full player-md:w-2/3 xl:w-3/4">
            <PlayerContent 
              isVideoSelected={isVideoSelected}
              currentUrl={currentUrl}
              playerContainerRef={playerContainerRef}
              isSelectedCharacter={isSelectedCharacter}
              isSelectedOpponentCharacters={isSelectedOpponentCharacters}
              onTimeUpdate={handleTimeUpdate}
              isChangingVideo={isChangingVideo}
            />
          </div>
          
          {/* サイドバーコンテンツ */}
          <div className="w-full player-md:w-1/3 xl:w-1/4">
            <SidebarContent 
              isPlaylistOpen={isPlaylistOpen}
              isTimestampOpen={isTimestampOpen}
              handlePlaylistToggle={handlePlaylistToggle}
              handleTimestampToggle={handleTimestampToggle}
              activeTab={activeTab}
              playerContainerRef={playerContainerRef}
              hasRequiredCharacters={hasRequiredCharacters}
              currentUrl={currentUrl}
              currentTime={currentTime}
              handleTimestampClick={handleTimestampClick}
              handleVideoSelect={handleVideoSelect}
              videos={sortedVideos}
              allVideos={allVideos}
              selectedCharacter={selectedCharacter}
              expandedDirectories={expandedDirectories}
              expandedGroups={expandedGroups}
              toggleDirectoryAccordion={toggleDirectoryAccordion}
              toggleAccordion={toggleAccordion}
              groupedVideos={groupedVideosByDirectory}
              getCharacterGroupedVideos={(videos) => getCharacterGroupedVideos(videos, selectedCharacter)}
              selectedVideoUrl={selectedVideoUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  /**
   * 再生時間が更新されたときの処理
   * @param time 現在の再生時間（秒）
   */
  function handleTimeUpdate(time: number) {
    setCurrentTime(time);
  }
};

export default YouTubePlayerWithTimestamps; 