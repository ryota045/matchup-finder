import React, { RefObject } from 'react';
import AnimatedAccordion from '../ui/AnimatedAccordion';
import TimestampList from '../timestamp/TimestampList';
import Playlist from '../playlist/Playlist';
import YouTubeTimestamp from '../timestamp/YouTubeTimestamp';
import { MatchupVideo } from '../playlist/VideoItem';
import { TimestampItem } from '../timestamp/TimestampItem';

/**
 * サイドバーコンテンツのプロパティ
 * @interface SidebarContentProps
 * @property {boolean} isPlaylistOpen - プレイリストが開いているかどうか
 * @property {boolean} isTimestampOpen - タイムスタンプが開いているかどうか
 * @property {(isOpen: boolean) => void} handlePlaylistToggle - プレイリストの開閉を制御する関数
 * @property {(isOpen: boolean) => void} handleTimestampToggle - タイムスタンプの開閉を制御する関数
 * @property {'playlist' | 'timestamp'} activeTab - モバイル表示時のアクティブなタブ
 * @property {RefObject<HTMLDivElement | null>} playerContainerRef - プレーヤーコンテナへの参照
 * @property {boolean} hasRequiredCharacters - 必要なキャラクターが選択されているかどうか
 * @property {string} currentUrl - 現在の動画URL
 * @property {number} currentTime - 現在の再生時間（秒）
 * @property {(time: number) => void} handleTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {(url: string) => void} handleVideoSelect - 動画が選択されたときのコールバック関数
 * @property {MatchupVideo[]} videos - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} allVideos - 全ての動画リスト（検索結果で絞られる前）
 * @property {string | undefined} selectedCharacter - 選択されたキャラクター名（英語）
 * @property {{[key: string]: boolean}} expandedDirectories - 展開されているディレクトリの状態
 * @property {{[key: string]: boolean}} expandedGroups - 展開されているキャラクターグループの状態
 * @property {(directory: string) => void} toggleDirectoryAccordion - ディレクトリアコーディオンの開閉を切り替える関数
 * @property {(directory: string, charKey: string) => void} toggleAccordion - キャラクターグループアコーディオンの開閉を切り替える関数
 * @property {{[key: string]: MatchupVideo[]}} groupedVideos - ディレクトリごとにグループ化された動画
 * @property {(videos: MatchupVideo[]) => any} getCharacterGroupedVideos - 動画をキャラクターごとにグループ化する関数
 * @property {string} selectedVideoUrl - 選択された動画のURL
 */
interface SidebarContentProps {
  isPlaylistOpen: boolean;
  isTimestampOpen: boolean;
  handlePlaylistToggle: (isOpen: boolean) => void;
  handleTimestampToggle: (isOpen: boolean) => void;
  activeTab: 'playlist' | 'timestamp';
  playerContainerRef: RefObject<HTMLDivElement | null>;
  hasRequiredCharacters: boolean;
  currentUrl: string;
  currentTime: number;
  handleTimestampClick: (time: number) => void;
  handleVideoSelect: (url: string) => void;
  videos: MatchupVideo[];
  allVideos: MatchupVideo[];
  selectedCharacter?: string;
  expandedDirectories: {[key: string]: boolean};
  expandedGroups: {[key: string]: boolean};
  toggleDirectoryAccordion: (directory: string) => void;
  toggleAccordion: (directory: string, charKey: string) => void;
  groupedVideos: {[key: string]: MatchupVideo[]};
  getCharacterGroupedVideos: (videos: MatchupVideo[]) => any;
  selectedVideoUrl: string;
}

/**
 * サイドバーコンテンツコンポーネント
 * 
 * タイムスタンプとプレイリストを表示するサイドバーコンテンツを提供します。
 * 
 * @component
 */
const SidebarContent: React.FC<SidebarContentProps> = ({
  isPlaylistOpen,
  isTimestampOpen,
  handlePlaylistToggle,
  handleTimestampToggle,
  activeTab,
  playerContainerRef,
  hasRequiredCharacters,
  currentUrl,
  currentTime,
  handleTimestampClick,
  handleVideoSelect,
  videos,
  allVideos,
  selectedCharacter,
  expandedDirectories,
  expandedGroups,
  toggleDirectoryAccordion,
  toggleAccordion,
  groupedVideos,
  getCharacterGroupedVideos,
  selectedVideoUrl
}) => {
  // 現在の動画のタイムスタンプを取得
  const getCurrentVideoTimestamps = (): TimestampItem[] => {
    if (!hasRequiredCharacters || !currentUrl) {
      return [];
    }
    
    return (allVideos || []).flatMap(video => {
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
    }).sort((a, b) => a.time - b.time);
  };
  
  // URLからビデオIDを抽出する関数
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // YouTubeの標準的なURL形式からIDを抽出
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // タイムスタンプアコーディオンの開閉を制御する関数
  const handleTimestampAccordionToggle = (isOpen: boolean) => {
    handleTimestampToggle(isOpen);
    
    // player-md以上の場合は、タイムスタンプを開くとプレイリストを閉じる
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      handlePlaylistToggle(false);
    }
  };
  
  // プレイリストアコーディオンの開閉を制御する関数
  const handlePlaylistAccordionToggle = (isOpen: boolean) => {
    handlePlaylistToggle(isOpen);
    
    // player-md以上の場合は、プレイリストを開くとタイムスタンプを閉じる
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      handleTimestampToggle(false);
    }
  };
  
  // アップロード日でソートされた動画リストを作成
  const sortedVideos = [...videos].sort((a, b) => {
    // upload_dateがない場合は後ろに配置
    if (!a.upload_date) return 1;
    if (!b.upload_date) return -1;
    
    // 降順（最新順）でソート
    return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
  });
  
  // ディレクトリごとにソートされた動画をグループ化
  const sortedGroupedVideos: {[key: string]: MatchupVideo[]} = {};
  Object.keys(groupedVideos).forEach(directory => {
    sortedGroupedVideos[directory] = [...groupedVideos[directory]].sort((a, b) => {
      // upload_dateがない場合は後ろに配置
      if (!a.upload_date) return 1;
      if (!b.upload_date) return -1;
      
      // 降順（最新順）でソート
      return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime();
    });
  });

  // console.log("selectedCharacter", selectedCharacter);
  
  return (
    <div className="w-full">
      {/* タイムスタンプとプレイリスト - スマホ表示時はタブ切り替え、タブレット表示時は横並び、デスクトップ表示時は縦並び */}
      <div className="player-md:block">
        {/* タブレット以上の表示時は横並び、デスクトップ表示時は縦並び */}
        <div className="hidden xs:flex xs:flex-row md:flex-row player-md:flex-col xs:gap-2 md:gap-3 player-md:gap-0">
          <div className={`xs:w-1/2 md:w-1/2 player-md:w-full flex-shrink-0 flex-grow`}>
            <AnimatedAccordion
              title="タイムスタンプ"
              isOpen={isTimestampOpen}
              onToggle={handleTimestampAccordionToggle}
              className="mb-2 player-md:mb-4"
              contentClassName="px-2 sm:px-3 md:px-4"
              playerContainerRef={playerContainerRef}              
              disableAnimationOnMobile={true}
            >
              <div className="bg-gradient-to-r from-primary/5 to-transparent p-1 rounded-lg mb-2">
                <h3 className="text-sm font-medium text-primary/80">現在の動画: {getCurrentVideoTimestamps().length}件</h3>
              </div>
              <TimestampList 
                timestamps={getCurrentVideoTimestamps()}
                onTimestampClick={handleTimestampClick}
                currentTime={currentTime}
                selectedCharacter={selectedCharacter}
              />
            </AnimatedAccordion>
          </div>
          <div className="xs:w-1/2 md:w-1/2 player-md:w-full flex-shrink-0 flex-grow">
            {/* キャラクターアイコン付きプレイリスト */}
            <Playlist
              videos={sortedVideos}
              groupedVideos={sortedGroupedVideos}
              expandedDirectories={expandedDirectories}
              expandedGroups={expandedGroups}
              isOpen={isPlaylistOpen}
              toggleDirectoryAccordion={toggleDirectoryAccordion}
              toggleAccordion={toggleAccordion}
              onVideoSelect={handleVideoSelect}
              getCharacterGroupedVideos={getCharacterGroupedVideos}
              setIsOpen={handlePlaylistAccordionToggle}
              playerContainerRef={playerContainerRef}
              className="mb-2"
              selectedVideoUrl={selectedVideoUrl}
            />
          </div>
        </div>
        
        {/* スマホ表示用のレイアウト */}
        <div className="xs:hidden">
          <YouTubeTimestamp 
            onTimestampClick={handleTimestampClick}
            currentTime={currentTime}
            videos={hasRequiredCharacters ? sortedVideos : []}
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
            // スマホ表示時は独立モードを無効に、それ以外は有効にする
            independentMode={false}
            selectedVideoUrl={selectedVideoUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarContent; 