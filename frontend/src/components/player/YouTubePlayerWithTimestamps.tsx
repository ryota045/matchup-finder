import React, { useState, useEffect, useRef } from 'react';
import YouTubePlayer from './YouTubePlayer';
import YouTubeTimestamp from '../timestamp/YouTubeTimestamp';
import { extractVideoId } from '../utils/YouTubeUtils';
import { TimestampItem } from '../timestamp/TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';
import AnimatedAccordion from '../ui/AnimatedAccordion';
import TimestampList from '../timestamp/TimestampList';
import { characterIcons } from '../../data/characterData';
import Playlist from '../playlist/Playlist';
import { CharacterIcon } from '../playlist/CharacterIconPair';

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
 * @example
 * ```tsx
 * <YouTubePlayerWithTimestamps
 *   url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   timestamps={[
 *     { time: 0, label: "イントロ", videoTitle: "動画タイトル" },
 *     { time: 30, label: "サビ", videoTitle: "動画タイトル" }
 *   ]}
 *   videos={relatedVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
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
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});
  
  // 使用キャラクターと対戦キャラクターの両方が選択されているかチェック
  const hasRequiredCharacters = !!selectedCharacter && selectedOpponentCharacters.length > 0;

  // プレイリストの開閉を制御する関数
  const handlePlaylistToggle = (isOpen: boolean) => {
    setIsPlaylistOpen(isOpen);
    // モバイル表示の場合はタブも切り替える
    if (isOpen) {
      setActiveTab('playlist');
    }
    
    // player-md以上の場合は、プレイリストを開くとタイムスタンプを閉じる
    const isPlayerMdOrLarger = window.matchMedia('(min-width: 1024px)').matches;
    if (isPlayerMdOrLarger && isOpen) {
      setIsTimestampOpen(false);
    }
  };

  // タイムスタンプの開閉を制御する関数
  const handleTimestampToggle = (isOpen: boolean) => {
    setIsTimestampOpen(isOpen);
    // モバイル表示の場合はタブも切り替える
    if (isOpen) {
      setActiveTab('timestamp');
    }
    
    // player-md以上の場合は、タイムスタンプを開くとプレイリストを閉じる
    const isPlayerMdOrLarger = window.matchMedia('(min-width: 1024px)').matches;
    if (isPlayerMdOrLarger && isOpen) {
      setIsPlaylistOpen(false);
    }
  };

  // キャラクターが選択されたときにプレイリストを開く
  useEffect(() => {
    if (hasRequiredCharacters) {
      setIsPlaylistOpen(true);
      setIsTimestampOpen(false);
      setActiveTab('playlist');
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

  // 動画をディレクトリごとにグループ化する関数
  const groupVideosByDirectory = () => {
    if (!hasRequiredCharacters || videos.length === 0) {
      return {};
    }
    
    const grouped: {[key: string]: MatchupVideo[]} = {};
    videos.forEach(video => {
      if (!grouped[video.directory]) {
        grouped[video.directory] = [];
      }
      grouped[video.directory].push(video);
    });
    
    return grouped;
  };

  // キャラクターアイコンの組み合わせごとにビデオをグループ化する関数
  const getCharacterGroupedVideos = (videos: MatchupVideo[]) => {
    const charGroups: {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[], useChara?: string}} = {};
    
    // 選択されたキャラクターのアイコンを取得
    const selectedCharacterIcon = selectedCharacter ? 
      characterIcons.find(c => c.eng.toLowerCase() === selectedCharacter.toLowerCase()) : null;
    
    videos.forEach(video => {
      // 使用キャラクター（chara1）と対戦相手（chara2）のアイコンを取得
      const useCharacter = characterIcons.find(c => 
        c.anotation.some(a => video.chara1.toLowerCase().includes(a.toLowerCase()))
      );
      const opponentCharacter = characterIcons.find(c => 
        c.anotation.some(a => video.chara2.toLowerCase().includes(a.toLowerCase()))
      );
      
      if (useCharacter && opponentCharacter) {
        // キャラクター名をアルファベット順にソートしてグループキーを作成
        // これにより、AvsB と BvsA を同じグループにする
        const sortedChars = [useCharacter.eng, opponentCharacter.eng].sort();
        const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
        
        if (!charGroups[charKey]) {
          charGroups[charKey] = {
            icon1: useCharacter,
            icon2: opponentCharacter,
            videos: [],
            useChara: selectedCharacter
          };
        }
        
        charGroups[charKey].videos.push(video);
      }
    });
    
    return charGroups;
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
  const groupedVideosByDirectory = groupVideosByDirectory();

  return (
    <div className="container flex flex-col player-md:flex-row gap-4 justify-center w-full mx-auto md:px-4">
      <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-4 w-full md:w-full player-md:w-3/4 player-lg:w-4/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold truncate mr-2">
            {!selectedCharacter 
              ? 'キャラクターを選択してください'
              : !selectedOpponentCharacters.length
                ? '対戦キャラクターを選択してください'
                : isVideoSelected 
                  ? (currentVideo?.title || 'タイトルなし')
                  : 'プレイリストから動画を選択してください'}
          </h3>
          {isVideoSelected && currentVideo?.directory && (
            <span className="text-sm bg-muted/30 dark:bg-muted/10 px-2 py-1 rounded whitespace-nowrap">
              {currentVideo.directory}
            </span>
          )}
        </div>
      
        <div className="youtube-player-with-timestamps bg-background dark:bg-background flex justify-center">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* 動画プレーヤーを固定高さのコンテナで囲む */}
            <div 
              ref={playerContainerRef}
              className="flex-grow rounded-lg overflow-hidden border border-border dark:border-gray-800 bg-card/5 dark:bg-black/30 shadow-sm dark:shadow-xl
                        max-h-[80vh] min-h-[480px] w-full flex items-center justify-center" 
            >
              {isVideoSelected ? (
                <div className="h-full w-full">
                  <YouTubePlayer 
                    url={currentUrl} 
                    autoplay={true} 
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold mb-2">動画を選択してください</h3>
                  <p className="text-muted-foreground">
                    右側のプレイリストから再生したい動画を選択してください。<br />
                    プレイリストが閉じている場合は「プレイリスト」ボタンをクリックして開いてください。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* タイムスタンプとプレイリスト */}
      <div className="md:w-full player-md:w-1/4 player-lg:w-1/5 w-full">
        {/* スマホ表示時のみ表示するタブ切り替えUI */}
        <div className="flex sm:hidden mb-2 border-b border-border dark:border-gray-800 bg-card dark:bg-card/95 rounded-t-lg shadow-md dark:shadow-xl">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium rounded-tl-lg transition-colors ${
              activeTab === 'playlist' 
                ? 'text-primary border-b-2 border-primary bg-background/50 dark:bg-background/20' 
                : 'text-muted-foreground hover:bg-background/30 dark:hover:bg-background/10'
            }`}
            onClick={() => {
              setActiveTab('playlist');
              setIsPlaylistOpen(true);
              setIsTimestampOpen(false);
            }}
          >
            プレイリスト
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium rounded-tr-lg transition-colors ${
              activeTab === 'timestamp' 
                ? 'text-primary border-b-2 border-primary bg-background/50 dark:bg-background/20' 
                : 'text-muted-foreground hover:bg-background/30 dark:hover:bg-background/10'
            }`}
            onClick={() => {
              setActiveTab('timestamp');
              setIsPlaylistOpen(false);
              setIsTimestampOpen(true);
            }}
          >
            タイムスタンプ
          </button>
        </div>
        
        {/* タイムスタンプとプレイリスト - スマホ表示時はタブ切り替え、タブレット表示時は横並び、デスクトップ表示時は縦並び */}
        <div className="player-md:block">
          {/* スマホ表示時はタブ切り替え、タブレット表示時は横並び、デスクトップ表示時は縦並び */}
          <div className="hidden sm:flex sm:flex-row md:flex-row player-md:flex-col sm:gap-2 md:gap-3 player-md:gap-0">
            <div className="sm:w-1/2 md:w-1/2 player-md:w-full flex-shrink-0 flex-grow">
              <AnimatedAccordion
                title="タイムスタンプ"
                isOpen={isTimestampOpen}
                onToggle={handleTimestampToggle}
                className="mb-2 player-md:mb-4"
                contentClassName="px-4"
                playerContainerRef={playerContainerRef}
                maxHeight="300px"
              >
                <TimestampList 
                  timestamps={hasRequiredCharacters && currentUrl ? 
                    (allVideos || []).flatMap(video => {
                      // 現在の動画のタイムスタンプのみを表示
                      const videoId = extractVideoId(video.url);
                      const currentVideoId = extractVideoId(currentUrl);
                      if (videoId === currentVideoId) {
                        return video.timestamps.map(timestamp => ({
                          ...timestamp,
                          sourceVideo: video.title,
                          chara1: video.chara1,
                          chara2: video.chara2
                        }));
                      }
                      return [];
                    }).sort((a, b) => a.time - b.time) : []
                  }
                  onTimestampClick={handleTimestampClick}
                  currentTime={currentTime}
                  selectedCharacter={selectedCharacter}
                />
              </AnimatedAccordion>
            </div>
            <div className="sm:w-1/2 md:w-1/2 player-md:w-full flex-shrink-0 flex-grow">
              {/* キャラクターアイコン付きプレイリスト */}
              <Playlist
                videos={videos}
                groupedVideos={groupedVideosByDirectory}
                expandedDirectories={expandedDirectories}
                expandedGroups={expandedGroups}
                isOpen={isPlaylistOpen}
                toggleDirectoryAccordion={toggleDirectoryAccordion}
                toggleAccordion={toggleAccordion}
                onVideoSelect={handleVideoSelect}
                getCharacterGroupedVideos={getCharacterGroupedVideos}
                setIsOpen={handlePlaylistToggle}
                playerContainerRef={playerContainerRef}
                className="mb-2"
              />
            </div>
          </div>
          
          {/* スマホ表示時のみ表示 */}
          <div className="sm:hidden">
            <YouTubeTimestamp 
              onTimestampClick={handleTimestampClick}
              currentTime={currentTime}
              videos={hasRequiredCharacters ? videos : []}
              allVideos={hasRequiredCharacters ? allVideos : []} // 全ての動画リストを渡す
              onVideoSelect={handleVideoSelect}
              url={currentUrl}
              isOpen={isTimestampOpen}
              setIsOpen={handleTimestampToggle}
              isPlaylistOpen={isPlaylistOpen}
              setIsPlaylistOpen={handlePlaylistToggle}
              playerContainerRef={playerContainerRef}
              selectedCharacter={selectedCharacter}
              // モバイル表示用のタブ状態を渡す
              activeTab={activeTab}
              // 横並び表示時は片方が開いても他方が閉じないようにする
              independentMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 