import React, { useState, useEffect, useRef, useMemo } from 'react';
import { extractTimestampFromUrl, extractVideoId } from '../../utils/YouTubeUtils';
import { MatchupVideo } from '../playlist/VideoItem';
import { CharacterIcon } from '../playlist/CharacterIconPair';
import PlayerControls from './PlayerControls';
import PlayerContent from './PlayerContent';
import MobileTabControls from './MobileTabControls';
import SidebarContent from './SidebarContent';
import { getCharacterGroupedVideos, groupVideosByDirectory } from '@/utils/videoUtils';

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
  allVideos = [], // 検索結果で絞られる前の全ての動画リスト
  selectedCharacter,
  selectedOpponentCharacters = [],
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<MatchupVideo | null>(null);
  // プレイリスト全体で共有する選択状態
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');

  // プレイリストとタイムスタンプの開閉状態を管理
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true); // 初期状態でプレイリストを開く
  const [isTimestampOpen, setIsTimestampOpen] = useState(false);
  
  // モバイル表示用のタブ切り替え状態
  const [activeTab, setActiveTab] = useState<'playlist' | 'timestamp'>('playlist');
  
  // プレーヤーの高さを参照するためのref
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // アコーディオンの開閉状態を管理
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});
  
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

  // プレイリストの開閉を制御する関数
  const handlePlaylistToggle = (isOpen: boolean) => {
    setIsPlaylistOpen(isOpen);
    
    // モバイル表示時はタブを切り替える
    if (isOpen && window.innerWidth < 640) {
      setActiveTab('playlist');
    }
    
    // player-md以上の場合は、プレイリストを開くとタイムスタンプを閉じる
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      setIsTimestampOpen(false);
    }
  };

  // タイムスタンプの開閉を制御する関数
  const handleTimestampToggle = (isOpen: boolean) => {
    setIsTimestampOpen(isOpen);
    
    // モバイル表示時はタブを切り替える
    if (isOpen && window.innerWidth < 640) {
      setActiveTab('timestamp');
    }
    
    // player-md以上の場合は、タイムスタンプを開くとプレイリストを閉じる
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      setIsPlaylistOpen(false);
    }
  };
  
  // タブ切り替えの処理
  const handleTabChange = (tab: 'playlist' | 'timestamp') => {
    setActiveTab(tab);
    
    // タブに合わせてアコーディオンの開閉状態を更新
    if (tab === 'playlist') {
      setIsPlaylistOpen(true);
      setIsTimestampOpen(false);
    } else {
      setIsPlaylistOpen(false);
      setIsTimestampOpen(true);
    }
  };
  
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
  }, [selectedCharacter, selectedOpponentCharacters, hasRequiredCharacters]);

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
  }, [videos, allVideos, hasRequiredCharacters]);

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
  }, [currentUrl, currentVideo, videos, allVideos]);

  /**
   * タイムスタンプがクリックされたときの処理
   * @param time クリックされたタイムスタンプの時間（秒）
   */
  const handleTimestampClick = (time: number) => {
    // 現在のURLからビデオIDを抽出
    const videoId = extractVideoId(currentUrl);
    if (!videoId) return;
    
    // 新しいURLを生成（タイムスタンプ付き、自動再生有効）
    const newUrl = `https://www.youtube.com/watch?v=${videoId}&t=${time}`;
    // console.log("newUrl", newUrl);
    setCurrentUrl(newUrl);
    
    // 現在の再生時間を即座に更新
    setCurrentTime(time);
    
    // 現在の動画情報は維持（URLが変わっても同じ動画なので）
    // currentVideoの状態は変更しない
  };

  /**
   * 動画が選択されたときの処理
   * @param url 選択された動画のURL
   */
  const handleVideoSelect = (url: string) => {
    // 選択された動画のURLを直接設定
    if (url) {
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
    }
  };

  // ディレクトリアコーディオンの開閉を切り替える関数
  const toggleDirectoryAccordion = (directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  };

  // キャラクターグループアコーディオンの開閉を切り替える関数
  const toggleAccordion = (directory: string, charKey: string) => {
    const uniqueKey = `${directory}-${charKey}`;
    setExpandedGroups(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey]
    }));
  };

  // 動画が選択されているかどうか
  const isVideoSelected = !!currentUrl && !!currentVideo;
  
  // グループ化された動画
  const groupedVideosByDirectory = groupVideosByDirectory(videos);

  /**
   * 再生時間が更新されたときの処理
   * @param time 現在の再生時間（秒）
   */
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    // console.log("YouTubePlayerWithTimestamps: 再生時間が更新されました", time);
  };

  return (
    <div className="container flex flex-col player-md:flex-row gap-4 justify-center w-full mx-auto md:px-4">
      <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-4 w-full player-md:w-3/4 player-lg:w-4/5">
        <PlayerControls 
          isVideoSelected={isVideoSelected}
          currentVideo={currentVideo}
          selectedCharacter={selectedCharacter}
          selectedOpponentCharacters={selectedOpponentCharacters}
        />
      
        <PlayerContent 
          isVideoSelected={isVideoSelected}
          currentUrl={currentUrl}
          playerContainerRef={playerContainerRef}
          isSelectedCharacter={isSelectedCharacter}
          isSelectedOpponentCharacters={isSelectedOpponentCharacters}
          onTimeUpdate={handleTimeUpdate}
        />
      </div>
      
      {/* タイムスタンプとプレイリスト */}
      <div className="w-full player-md:w-1/4 player-lg:w-1/5">
        {/* スマホ表示時のみ表示するタブ切り替えUI */}
        <MobileTabControls 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
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
          selectedVideoUrl={selectedVideoUrl} // 選択された動画のURLを渡す
        />
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 