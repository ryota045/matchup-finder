import React, { useState, useEffect, RefObject } from 'react';
import { characterIcons } from '../../data/characterData';
import TimestampList from './TimestampList';
import Playlist from '../playlist/Playlist';
import { TimestampItem } from './TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';
import AnimatedAccordion from '../ui/AnimatedAccordion';
import { getCharacterGroupedVideos, getMatchingTimestamps } from '../../utils/videoUtils';
import DirectoryGroup from '../playlist/DirectoryGroup';

/**
 * YouTubeタイムスタンプコンポーネントのプロパティ
 * @interface YouTubeTimestampProps
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {number} [currentTime=0] - 現在の再生時間（秒）
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 * @property {(url: string) => void} [onVideoSelect] - 動画が選択されたときのコールバック関数
 * @property {string} [url] - 現在の動画URL
 * @property {boolean} [isOpen=true] - タイムスタンプリストが開いているかどうか
 * @property {(isOpen: boolean) => void} [setIsOpen] - タイムスタンプリストの開閉状態を設定する関数
 * @property {boolean} [isPlaylistOpen=true] - プレイリストが開いているかどうか
 * @property {(isOpen: boolean) => void} [setIsPlaylistOpen] - プレイリストの開閉状態を設定する関数
 * @property {RefObject<HTMLDivElement | null>} [playerContainerRef] - プレーヤーコンテナへの参照
 * @property {string} [selectedCharacter] - 選択されたキャラクター名（英語）
 * @property {'playlist' | 'timestamp'} [activeTab='playlist'] - モバイル表示時のアクティブなタブ
 * @property {boolean} [independentMode=false] - 横並び表示時に片方が開いても他方が閉じないモード
 * @property {string} [selectedVideoUrl] - 選択された動画のURL
 */
interface YouTubeTimestampProps {
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[]; // 検索結果で絞られる前の全ての動画リスト
  onVideoSelect?: (url: string) => void;
  url?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isPlaylistOpen?: boolean;
  setIsPlaylistOpen?: (isOpen: boolean) => void;
  playerContainerRef?: RefObject<HTMLDivElement | null>;
  selectedCharacter?: string;
  activeTab?: 'playlist' | 'timestamp';
  independentMode?: boolean;
  selectedVideoUrl?: string;
}

/**
 * YouTube動画のタイムスタンプとプレイリストを表示するコンポーネント
 * 
 * @component
 */
const YouTubeTimestamp: React.FC<YouTubeTimestampProps> = ({
  onTimestampClick,
  currentTime = 0,
  videos = [],
  allVideos = [], // 検索結果で絞られる前の全ての動画リスト
  onVideoSelect,
  url,
  isOpen = true,
  setIsOpen,
  isPlaylistOpen = true,
  setIsPlaylistOpen,
  playerContainerRef,
  selectedCharacter,
  activeTab = 'playlist',
  independentMode = false,
  selectedVideoUrl
}) => {
  // 内部状態として使用するための状態を作成
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [internalIsPlaylistOpen, setInternalIsPlaylistOpen] = useState(isPlaylistOpen);
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const [isMobile, setIsMobile] = useState(false);
  const [prevIsMobile, setPrevIsMobile] = useState(false);
  
  // モバイル判定
  useEffect(() => {
    const checkIfMobile = () => {
      const newIsMobile = window.innerWidth < 480;
      setPrevIsMobile(isMobile);
      setIsMobile(newIsMobile);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [isMobile]);
  
  // 画面サイズ変更時の処理
  useEffect(() => {
    // モバイルからタブレット以上に変更された場合
    if (prevIsMobile && !isMobile) {
      // タブの状態に応じてアコーディオンの状態を設定
      if (internalActiveTab === 'timestamp') {
        setInternalIsOpen(true);
        if (setIsOpen) setIsOpen(true);
      } else if (internalActiveTab === 'playlist') {
        setInternalIsPlaylistOpen(true);
        if (setIsPlaylistOpen) setIsPlaylistOpen(true);
      }
    }
  }, [isMobile, prevIsMobile, internalActiveTab, setIsOpen, setIsPlaylistOpen]);
  
  // 親から渡された状態と同期させる
  useEffect(() => {
    setInternalIsOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    setInternalIsPlaylistOpen(isPlaylistOpen);
  }, [isPlaylistOpen]);
  
  useEffect(() => {
    setInternalActiveTab(activeTab);
  }, [activeTab]);
  
  // アコーディオンの開閉状態を管理
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});
  const [allMatchingTimestamps, setAllMatchingTimestamps] = useState<TimestampItem[]>([]);
  
  // 動画をディレクトリごとにグループ化
  useEffect(() => {
    if (videos.length === 0 || !selectedCharacter) {
      setGroupedVideos({});
      setExpandedDirectories({});
      setExpandedGroups({});
      return;
    }
    
    // ディレクトリごとにグループ化
    const grouped: {[key: string]: MatchupVideo[]} = {};
    videos.forEach(video => {
      if (!grouped[video.directory]) {
        grouped[video.directory] = [];
      }
      grouped[video.directory].push(video);
    });
    
    setGroupedVideos(grouped);
    
    // ディレクトリごとのアコーディオンの初期状態を設定
    // 既存の状態を保持するため、初期化は一度だけ行う
    setExpandedDirectories(prev => {
      // 既存のディレクトリの状態を保持
      const newState = { ...prev };
      
      // 新しいディレクトリがあれば追加
      Object.keys(grouped).forEach((directory) => {
        if (newState[directory] === undefined) {
          newState[directory] = false;
        }
      });
      
      return newState;
    });
    
    // キャラクターの組み合わせごとにアコーディオンの初期状態を設定
    // 既存の状態を保持するため、初期化は一度だけ行う
    setExpandedGroups(prev => {
      // 既存のグループの状態を保持
      const newState = { ...prev };
      
      // 新しいグループがあれば追加
      videos.forEach(video => {
        const character1 = characterIcons.find(c => 
          c.eng.toLowerCase() === video.chara1.toLowerCase() || 
          c.anotation.some(a => a.toLowerCase() === video.chara1.toLowerCase())
        );
        const character2 = characterIcons.find(c => 
          c.eng.toLowerCase() === video.chara2.toLowerCase() || 
          c.anotation.some(a => a.toLowerCase() === video.chara2.toLowerCase())
        );
        
        if (character1 && character2) {
          // キャラクター名をアルファベット順にソートして、AvsB と BvsA を同じグループにする
          const sortedChars = [character1.eng, character2.eng].sort();
          const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
          // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
          const uniqueKey = `${video.directory}-${charKey}`;
          
          // 新しいグループの場合のみ初期化
          if (newState[uniqueKey] === undefined) {
            newState[uniqueKey] = false;
          }
        }
      });
      
      return newState;
    });
  }, [videos, selectedCharacter]);

  // 現在選択されている動画のURLと同じURLを持つすべてのマッチアップのタイムスタンプを収集
  useEffect(() => {
    if (!selectedCharacter || !url) {
      setAllMatchingTimestamps([]);
      return;
    }
    
    const matchingTimestamps = getMatchingTimestamps(url, videos, allVideos);
    setAllMatchingTimestamps(matchingTimestamps);
  }, [videos, allVideos, url, selectedCharacter]);

  /**
   * アコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   * @param charKey キャラクターグループのキー
   */
  const toggleAccordion = (directory: string, charKey: string) => {
    // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
    const uniqueKey = `${directory}-${charKey}`;
    setExpandedGroups(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey]
    }));
  };
  
  /**
   * ディレクトリアコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   */
  const toggleDirectoryAccordion = (directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  };

  // タブを切り替える関数
  const handleTabChange = (tab: 'playlist' | 'timestamp') => {
    setInternalActiveTab(tab);
    
    // タブ切り替え時に対応するアコーディオンの状態も更新
    if (tab === 'timestamp') {
      setInternalIsOpen(true);
      if (setIsOpen) setIsOpen(true);
      
      if (!independentMode && window.innerWidth < 640) {
        setInternalIsPlaylistOpen(false);
        if (setIsPlaylistOpen) setIsPlaylistOpen(false);
      }
    } else {
      setInternalIsPlaylistOpen(true);
      if (setIsPlaylistOpen) setIsPlaylistOpen(true);
      
      if (!independentMode && window.innerWidth < 640) {
        setInternalIsOpen(false);
        if (setIsOpen) setIsOpen(false);
      }
    }
  };

  // キャラクターが選択されていない場合はメッセージを表示
  if (!selectedCharacter || videos.length === 0) {
    return (
      <div className="youtube-timestamp" style={{ position: 'relative' }}>
        <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-6 mb-4">
          <div className="text-center">
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold mb-2">キャラクターを選択してください</h3>
            <p className="text-muted-foreground text-sm">
              上部のキャラクターセレクターから使用キャラクターを選択すると、
              タイムスタンプとプレイリストが表示されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // スマホサイズ時はタブUIを表示
  if (isMobile) {
    return (
      <div className="youtube-timestamp" style={{ position: 'relative' }}>
        {/* タブヘッダー */}
        <div className="flex border-b border-border dark:border-gray-800 mb-4">
          <button
            className={`flex-1 py-2 px-4 text-center font-medium ${
              internalActiveTab === 'timestamp' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => handleTabChange('timestamp')}
          >
            タイムスタンプ
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-medium ${
              internalActiveTab === 'playlist' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => handleTabChange('playlist')}
          >
            検索結果 ({videos.length})
          </button>
        </div>
        
        {/* タブコンテンツ */}
        <div className="relative">
          {/* タイムスタンプコンテンツ */}
          <div 
            className={`${internalActiveTab === 'timestamp' ? 'block' : 'hidden'} custom-scrollbar`}
            style={{ 
              maxHeight: playerContainerRef?.current 
                ? `${Math.max(500, playerContainerRef.current.clientHeight - 50)}px` 
                : '500px',
              overflowY: 'auto'
            }}
          >
            <div className="px-4">
              <TimestampList 
                timestamps={allMatchingTimestamps}
                onTimestampClick={onTimestampClick}
                currentTime={currentTime}
                selectedCharacter={selectedCharacter}
              />
            </div>
          </div>
          
          {/* プレイリストコンテンツ */}
          <div 
            className={`${internalActiveTab === 'playlist' ? 'block' : 'hidden'} custom-scrollbar`}
            style={{ 
              maxHeight: playerContainerRef?.current 
                ? `${Math.max(500, playerContainerRef.current.clientHeight - 50)}px` 
                : '500px',
              overflowY: 'auto'
            }}
          >
            <div className="divide-y divide-border dark:divide-gray-800">
              {Object.keys(groupedVideos).sort((a, b) => groupedVideos[b].length - groupedVideos[a].length)
              .map(directory => (
                <DirectoryGroup
                  key={directory}
                  directory={directory}
                  videos={groupedVideos[directory]}
                  isExpanded={expandedDirectories[directory]}
                  toggleDirectoryAccordion={() => toggleDirectoryAccordion(directory)}
                  expandedGroups={expandedGroups}
                  toggleAccordion={toggleAccordion}
                  onVideoSelect={onVideoSelect || (() => {})}
                  getCharacterGroupedVideos={(videos) => getCharacterGroupedVideos(videos, selectedCharacter)}
                  selectedVideoUrl={selectedVideoUrl || ''}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // タブレット以上のサイズではアコーディオンを使用
  return (
    <div className="youtube-timestamp bg-red-500" style={{ position: 'relative' }}>
      <AnimatedAccordion
        title="タイムスタンプ"
        isOpen={internalIsOpen}
        onToggle={(isOpen) => {
          setInternalIsOpen(isOpen);
          if (setIsOpen) {
            setIsOpen(isOpen);
          }
          // player-md以上の場合は、タイムスタンプを開くとプレイリストを閉じる
          if (isOpen && window.matchMedia('(min-width: 1024px)').matches) {
            setInternalIsPlaylistOpen(false);
            if (setIsPlaylistOpen) {
              setIsPlaylistOpen(false);
            }
          }
        }}
        className="mb-4 player-md:block"
        contentClassName="px-4"
        playerContainerRef={playerContainerRef}
        disableAnimationOnMobile={true}
      >
        <TimestampList 
          timestamps={allMatchingTimestamps}
          onTimestampClick={onTimestampClick}
          currentTime={currentTime}
          selectedCharacter={selectedCharacter}
        />
      </AnimatedAccordion>

      <Playlist
        videos={videos}
        groupedVideos={groupedVideos}
        expandedDirectories={expandedDirectories}
        expandedGroups={expandedGroups}
        isOpen={internalIsPlaylistOpen}
        toggleDirectoryAccordion={toggleDirectoryAccordion}
        toggleAccordion={toggleAccordion}
        onVideoSelect={onVideoSelect || (() => {})}
        getCharacterGroupedVideos={(videos) => getCharacterGroupedVideos(videos, selectedCharacter)}
        setIsOpen={(newIsOpen: boolean) => {
          setInternalIsPlaylistOpen(newIsOpen);
          if (setIsPlaylistOpen) {
            setIsPlaylistOpen(newIsOpen);
          }
          // player-md以上の場合は、プレイリストを開くとタイムスタンプを閉じる
          if (newIsOpen && window.matchMedia('(min-width: 1024px)').matches) {
            setInternalIsOpen(false);
            if (setIsOpen) {
              setIsOpen(false);
            }
          }
        }}
        playerContainerRef={playerContainerRef}
        className="player-md:block"
        selectedVideoUrl={selectedVideoUrl || ''}
      />
    </div>
  );
};

export default React.memo(YouTubeTimestamp); 