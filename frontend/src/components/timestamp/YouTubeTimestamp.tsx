import React, { useState, useEffect, RefObject } from 'react';
import TimestampList from './TimestampList';
import Playlist from '../playlist/Playlist';
import { TimestampItem } from './TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';
import AnimatedAccordion from '../ui/AnimatedAccordion';
import { groupVideosByCharacter, getMatchingTimestamps } from '../../utils/videoUtils';

/**
 * YouTubeタイムスタンプコンポーネントのプロパティ
 */
interface YouTubeTimestampProps {
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[];
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
  allVideos = [],
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
  selectedVideoUrl,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [internalIsPlaylistOpen, setInternalIsPlaylistOpen] = useState(isPlaylistOpen);
  const [internalActiveTab, setInternalActiveTab] = useState(activeTab);
  const [isMobile, setIsMobile] = useState(false);
  const [prevIsMobile, setPrevIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const newIsMobile = window.innerWidth < 480;
      setPrevIsMobile(isMobile);
      setIsMobile(newIsMobile);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [isMobile]);

  useEffect(() => {
    if (prevIsMobile && !isMobile) {
      if (internalActiveTab === 'timestamp') {
        setInternalIsOpen(true);
        if (setIsOpen) setIsOpen(true);
      } else if (internalActiveTab === 'playlist') {
        setInternalIsPlaylistOpen(true);
        if (setIsPlaylistOpen) setIsPlaylistOpen(true);
      }
    }
  }, [isMobile, prevIsMobile, internalActiveTab, setIsOpen, setIsPlaylistOpen]);

  useEffect(() => { setInternalIsOpen(isOpen); }, [isOpen]);
  useEffect(() => { setInternalIsPlaylistOpen(isPlaylistOpen); }, [isPlaylistOpen]);
  useEffect(() => { setInternalActiveTab(activeTab); }, [activeTab]);

  // キャラクター → チャンネル → 動画 の階層でグループ化
  const [expandedCharacters, setExpandedCharacters] = useState<{ [key: string]: boolean }>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{ [key: string]: boolean }>({});
  const [allMatchingTimestamps, setAllMatchingTimestamps] = useState<TimestampItem[]>([]);

  const characterGroupedVideos = React.useMemo(
    () => groupVideosByCharacter(videos, selectedCharacter),
    [videos, selectedCharacter]
  );

  // キャラクターグループが変わったとき、新しいキーを expandedCharacters に追加
  useEffect(() => {
    if (videos.length === 0 || !selectedCharacter) {
      setExpandedCharacters({});
      setExpandedDirectories({});
      return;
    }

    setExpandedCharacters(prev => {
      const newState = { ...prev };
      Object.keys(characterGroupedVideos).forEach(charKey => {
        if (newState[charKey] === undefined) {
          newState[charKey] = false;
        }
      });
      return newState;
    });

    setExpandedDirectories(prev => {
      const newState = { ...prev };
      Object.entries(characterGroupedVideos).forEach(([charKey, group]) => {
        Object.keys(group.directories).forEach(directory => {
          const key = `${charKey}-${directory}`;
          if (newState[key] === undefined) {
            newState[key] = false;
          }
        });
      });
      return newState;
    });
  }, [videos, selectedCharacter, characterGroupedVideos]);

  useEffect(() => {
    if (!selectedCharacter || !url) {
      setAllMatchingTimestamps([]);
      return;
    }
    setAllMatchingTimestamps(getMatchingTimestamps(url, videos, allVideos));
  }, [videos, allVideos, url, selectedCharacter]);

  const toggleCharacterAccordion = (charKey: string) => {
    setExpandedCharacters(prev => ({ ...prev, [charKey]: !prev[charKey] }));
  };

  const toggleDirectoryAccordion = (charKey: string, directory: string) => {
    const key = `${charKey}-${directory}`;
    setExpandedDirectories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTabChange = (tab: 'playlist' | 'timestamp') => {
    setInternalActiveTab(tab);
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

  if (!selectedCharacter || videos.length === 0) {
    return null;
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
          <div
            className={`${internalActiveTab === 'timestamp' ? 'block' : 'hidden'} custom-scrollbar`}
            style={{
              maxHeight: playerContainerRef?.current
                ? `${Math.max(500, playerContainerRef.current.clientHeight - 50)}px`
                : '500px',
              overflowY: 'auto',
            }}
          >
            <div className="px-2 sm:px-3 md:px-4 w-full">
              <TimestampList
                timestamps={allMatchingTimestamps}
                onTimestampClick={onTimestampClick}
                currentTime={currentTime}
                selectedCharacter={selectedCharacter}
              />
            </div>
          </div>

          <div
            className={`${internalActiveTab === 'playlist' ? 'block' : 'hidden'} custom-scrollbar`}
            style={{
              maxHeight: playerContainerRef?.current
                ? `${Math.max(500, playerContainerRef.current.clientHeight - 50)}px`
                : '500px',
              overflowY: 'auto',
            }}
          >
            <Playlist
              videos={videos}
              characterGroupedVideos={characterGroupedVideos}
              expandedCharacters={expandedCharacters}
              expandedDirectories={expandedDirectories}
              isOpen={internalIsPlaylistOpen}
              toggleCharacterAccordion={toggleCharacterAccordion}
              toggleDirectoryAccordion={toggleDirectoryAccordion}
              onVideoSelect={onVideoSelect || (() => {})}
              setIsOpen={(newIsOpen: boolean) => {
                setInternalIsPlaylistOpen(newIsOpen);
                if (setIsPlaylistOpen) setIsPlaylistOpen(newIsOpen);
                if (newIsOpen && window.matchMedia('(min-width: 1024px)').matches) {
                  setInternalIsOpen(false);
                  if (setIsOpen) setIsOpen(false);
                }
              }}
              playerContainerRef={playerContainerRef}
              className="player-md:block"
              selectedVideoUrl={selectedVideoUrl || ''}
            />
          </div>
        </div>
      </div>
    );
  }

  // タブレット以上のサイズではアコーディオンを使用
  return (
    <div className="youtube-timestamp" style={{ position: 'relative' }}>
      <AnimatedAccordion
        title="タイムスタンプ"
        isOpen={internalIsOpen}
        onToggle={(isOpen) => {
          setInternalIsOpen(isOpen);
          if (setIsOpen) setIsOpen(isOpen);
          if (isOpen && window.matchMedia('(min-width: 1024px)').matches) {
            setInternalIsPlaylistOpen(false);
            if (setIsPlaylistOpen) setIsPlaylistOpen(false);
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
        characterGroupedVideos={characterGroupedVideos}
        expandedCharacters={expandedCharacters}
        expandedDirectories={expandedDirectories}
        isOpen={internalIsPlaylistOpen}
        toggleCharacterAccordion={toggleCharacterAccordion}
        toggleDirectoryAccordion={toggleDirectoryAccordion}
        onVideoSelect={onVideoSelect || (() => {})}
        setIsOpen={(newIsOpen: boolean) => {
          setInternalIsPlaylistOpen(newIsOpen);
          if (setIsPlaylistOpen) setIsPlaylistOpen(newIsOpen);
          if (newIsOpen && window.matchMedia('(min-width: 1024px)').matches) {
            setInternalIsOpen(false);
            if (setIsOpen) setIsOpen(false);
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
