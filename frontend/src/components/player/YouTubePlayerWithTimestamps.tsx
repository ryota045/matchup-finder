import React, { useState, useEffect, useRef } from 'react';
import { extractVideoId } from '../../utils/YouTubeUtils';
import { MatchupVideo } from '../playlist/VideoItem';
import { groupVideosByDirectory, getCharacterGroupedVideos } from '../../utils/videoUtils';
import PlayerControls from './PlayerControls';
import PlayerContent from './PlayerContent';
import MobileTabControls from './MobileTabControls';
import SidebarContent from './SidebarContent';

/**
 * YouTubeプレーヤーとタイムスタンプを組み合わせたコンポーネントのプロパティ
 * @interface YouTubePlayerWithTimestampsProps
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 * @property {string} [selectedCharacter] - 選択されたキャラクター名（英語）
 * @property {string[]} [selectedOpponentCharacters=[]] - 選択された対戦キャラクター名の配列（英語）
 */
interface YouTubePlayerWithTimestampsProps {
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[]; // 検索結果で絞られる前の全ての動画リスト
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

  // プレイリストの開閉を制御する関数
  const handlePlaylistToggle = (isOpen: boolean) => {
    setIsPlaylistOpen(isOpen);
    // モバイル表示の場合はタブも切り替える
    if (isOpen && window.innerWidth < 640) { // smブレークポイント未満の場合
      setActiveTab('playlist');
    }
    
    // player-md以上の場合は、プレイリストを開くとタイムスタンプを閉じる
    if (isOpen && window.matchMedia('(min-width: 1024px)').matches) {
      setIsTimestampOpen(false);
    }
  };

  // タイムスタンプの開閉を制御する関数
  const handleTimestampToggle = (isOpen: boolean) => {
    setIsTimestampOpen(isOpen);
    // モバイル表示の場合はタブも切り替える
    if (isOpen && window.innerWidth < 640) { // smブレークポイント未満の場合
      setActiveTab('timestamp');
    }
    
    // player-md以上の場合は、タイムスタンプを開くとプレイリストを閉じる
    if (isOpen && window.matchMedia('(min-width: 1024px)').matches) {
      setIsPlaylistOpen(false);
    }
  };

  // モバイルタブの切り替えを処理する関数
  const handleTabChange = (tab: 'playlist' | 'timestamp') => {
    setActiveTab(tab);
    if (tab === 'playlist') {
      setIsPlaylistOpen(true);
      setIsTimestampOpen(false);
    } else {
      setIsPlaylistOpen(false);
      setIsTimestampOpen(true);
    }
  };

  // キャラクターが選択されたときにプレイリストを開く
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

  // コンポーネントのマウント時に初期動画を設定
  useEffect(() => {
    // 必要なキャラクターが選択されていない場合は何もしない
    if (!hasRequiredCharacters) {
      setCurrentUrl('');
      setCurrentVideo(null);
      return;
    }
    
    // 動画リストが空でない場合でも、自動的に動画を選択しない
    // ユーザーがプレイリストから選択するまで待機
    setCurrentUrl('');
    setCurrentVideo(null);
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
    setCurrentUrl(newUrl);
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
          videos={videos}
          allVideos={allVideos}
          selectedCharacter={selectedCharacter}
          expandedDirectories={expandedDirectories}
          expandedGroups={expandedGroups}
          toggleDirectoryAccordion={toggleDirectoryAccordion}
          toggleAccordion={toggleAccordion}
          groupedVideos={groupedVideosByDirectory}
          getCharacterGroupedVideos={(videos) => getCharacterGroupedVideos(videos, selectedCharacter)}
        />
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 