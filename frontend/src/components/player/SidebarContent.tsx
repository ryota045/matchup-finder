import React, { RefObject } from 'react';
import AnimatedAccordion from '../ui/AnimatedAccordion';
import TimestampList from '../timestamp/TimestampList';
import Playlist from '../playlist/Playlist';
import YouTubeTimestamp from '../timestamp/YouTubeTimestamp';
import { MatchupVideo } from '../playlist/VideoItem';
import { TimestampItem } from '../timestamp/TimestampItem';
import { extractVideoId } from '@/utils/YouTubeUtils';
import { CharacterIcon } from '../playlist/CharacterIconPair';

/**
 * サイドバーコンテンツのプロパティ
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
  expandedCharacters: { [key: string]: boolean };
  expandedDirectories: { [key: string]: boolean };
  toggleCharacterAccordion: (charKey: string) => void;
  toggleDirectoryAccordion: (charKey: string, directory: string) => void;
  characterGroupedVideos: {
    [charKey: string]: {
      icon1: CharacterIcon | null;
      icon2: CharacterIcon | null;
      useChara?: string;
      directories: { [directory: string]: MatchupVideo[] };
      videos: MatchupVideo[];
    };
  };
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
  expandedCharacters,
  expandedDirectories,
  toggleCharacterAccordion,
  toggleDirectoryAccordion,
  characterGroupedVideos,
  selectedVideoUrl,
}) => {
  /**
   * 現在の動画のタイムスタンプを取得
   */
  const getCurrentVideoTimestamps = (): TimestampItem[] => {
    if (!hasRequiredCharacters || !currentUrl) {
      return [];
    }

    return (allVideos || []).flatMap(video => {
      const videoId = extractVideoId(video.url);
      const currentVideoId = extractVideoId(currentUrl);
      if (videoId === currentVideoId) {
        return video.timestamps.map(timestamp => ({
          ...timestamp,
          sourceVideo: video.title,
          chara1: video.chara1,
          chara2: video.chara2,
        }));
      }
      return [];
    }).sort((a, b) => a.time - b.time);
  };

  const handleTimestampAccordionToggle = (isOpen: boolean) => {
    handleTimestampToggle(isOpen);
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      handlePlaylistToggle(false);
    }
  };

  const handlePlaylistAccordionToggle = (isOpen: boolean) => {
    handlePlaylistToggle(isOpen);
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      handleTimestampToggle(false);
    }
  };

  return (
    <div className="w-full">
      <div className="player-md:block">
        {/* タブレット以上の表示時は横並び、デスクトップ表示時は縦並び */}
        <div className="hidden xs:flex xs:flex-row md:flex-row player-md:flex-col xs:gap-2 md:gap-3 player-md:gap-0">
          <TimestampSection
            isTimestampOpen={isTimestampOpen}
            handleTimestampAccordionToggle={handleTimestampAccordionToggle}
            playerContainerRef={playerContainerRef}
            timestamps={getCurrentVideoTimestamps()}
            handleTimestampClick={handleTimestampClick}
            currentTime={currentTime}
            selectedCharacter={selectedCharacter}
          />
          <PlaylistSection
            videos={videos}
            characterGroupedVideos={characterGroupedVideos}
            expandedCharacters={expandedCharacters}
            expandedDirectories={expandedDirectories}
            isPlaylistOpen={isPlaylistOpen}
            toggleCharacterAccordion={toggleCharacterAccordion}
            toggleDirectoryAccordion={toggleDirectoryAccordion}
            handleVideoSelect={handleVideoSelect}
            handlePlaylistAccordionToggle={handlePlaylistAccordionToggle}
            playerContainerRef={playerContainerRef}
            selectedVideoUrl={selectedVideoUrl}
          />
        </div>

        {/* スマホ表示用のレイアウト */}
        <div className="xs:hidden">
          <YouTubeTimestamp
            onTimestampClick={handleTimestampClick}
            currentTime={currentTime}
            videos={hasRequiredCharacters ? videos : []}
            allVideos={hasRequiredCharacters ? allVideos : []}
            onVideoSelect={handleVideoSelect}
            url={currentUrl}
            isOpen={isTimestampOpen}
            setIsOpen={handleTimestampToggle}
            isPlaylistOpen={isPlaylistOpen}
            setIsPlaylistOpen={handlePlaylistToggle}
            playerContainerRef={playerContainerRef}
            selectedCharacter={selectedCharacter}
            activeTab={activeTab}
            independentMode={false}
            selectedVideoUrl={selectedVideoUrl}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * タイムスタンプセクションのプロパティ
 */
interface TimestampSectionProps {
  isTimestampOpen: boolean;
  handleTimestampAccordionToggle: (isOpen: boolean) => void;
  playerContainerRef: RefObject<HTMLDivElement | null>;
  timestamps: TimestampItem[];
  handleTimestampClick: (time: number) => void;
  currentTime: number;
  selectedCharacter?: string;
}

const TimestampSection: React.FC<TimestampSectionProps> = ({
  isTimestampOpen,
  handleTimestampAccordionToggle,
  playerContainerRef,
  timestamps,
  handleTimestampClick,
  currentTime,
  selectedCharacter,
}) => {
  return (
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
          <h3 className="text-sm font-medium text-primary/80">現在の動画: {timestamps.length}件</h3>
        </div>
        <TimestampList
          timestamps={timestamps}
          onTimestampClick={handleTimestampClick}
          currentTime={currentTime}
          selectedCharacter={selectedCharacter}
        />
      </AnimatedAccordion>
    </div>
  );
};

/**
 * プレイリストセクションのプロパティ
 */
interface PlaylistSectionProps {
  videos: MatchupVideo[];
  characterGroupedVideos: {
    [charKey: string]: {
      icon1: CharacterIcon | null;
      icon2: CharacterIcon | null;
      useChara?: string;
      directories: { [directory: string]: MatchupVideo[] };
      videos: MatchupVideo[];
    };
  };
  expandedCharacters: { [key: string]: boolean };
  expandedDirectories: { [key: string]: boolean };
  isPlaylistOpen: boolean;
  toggleCharacterAccordion: (charKey: string) => void;
  toggleDirectoryAccordion: (charKey: string, directory: string) => void;
  handleVideoSelect: (url: string) => void;
  handlePlaylistAccordionToggle: (isOpen: boolean) => void;
  playerContainerRef: RefObject<HTMLDivElement | null>;
  selectedVideoUrl: string;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  videos,
  characterGroupedVideos,
  expandedCharacters,
  expandedDirectories,
  isPlaylistOpen,
  toggleCharacterAccordion,
  toggleDirectoryAccordion,
  handleVideoSelect,
  handlePlaylistAccordionToggle,
  playerContainerRef,
  selectedVideoUrl,
}) => {
  return (
    <div className="xs:w-1/2 md:w-1/2 player-md:w-full flex-shrink-0 flex-grow">
      <Playlist
        videos={videos}
        characterGroupedVideos={characterGroupedVideos}
        expandedCharacters={expandedCharacters}
        expandedDirectories={expandedDirectories}
        isOpen={isPlaylistOpen}
        toggleCharacterAccordion={toggleCharacterAccordion}
        toggleDirectoryAccordion={toggleDirectoryAccordion}
        onVideoSelect={handleVideoSelect}
        setIsOpen={handlePlaylistAccordionToggle}
        playerContainerRef={playerContainerRef}
        className="mb-2"
        selectedVideoUrl={selectedVideoUrl}
      />
    </div>
  );
};

export default SidebarContent;
