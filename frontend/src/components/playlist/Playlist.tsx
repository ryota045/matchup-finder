import React, { RefObject } from 'react';
import DirectoryGroup from './DirectoryGroup';
import { MatchupVideo } from './VideoItem';
import { CharacterIcon } from './CharacterIconPair';
import AnimatedAccordion from '../ui/AnimatedAccordion';

/**
 * プレイリストコンポーネントのプロパティ
 * @interface PlaylistProps
 * @property {MatchupVideo[]} videos - 全ての動画リスト
 * @property {Object} groupedVideos - ディレクトリごとにグループ化された動画
 * @property {Object} expandedDirectories - 展開されているディレクトリの状態
 * @property {Object} expandedGroups - 展開されているキャラクターグループの状態
 * @property {boolean} isOpen - プレイリストが開いているかどうか
 * @property {(directory: string) => void} toggleDirectoryAccordion - ディレクトリアコーディオンの開閉を切り替える関数
 * @property {(directory: string, charKey: string) => void} toggleAccordion - キャラクターグループアコーディオンの開閉を切り替える関数
 * @property {number} selectedVideoIndex - 選択されている動画のインデックス
 * @property {(index: number) => void} onVideoSelect - 動画が選択されたときのコールバック関数
 * @property {(videos: MatchupVideo[]) => Object} getCharacterGroupedVideos - 動画をキャラクターごとにグループ化する関数
 * @property {(isOpen: boolean) => void} setIsOpen - プレイリストの開閉状態を設定する関数
 * @property {RefObject<HTMLDivElement | null>} [playerContainerRef] - プレーヤーコンテナへの参照
 */
interface PlaylistProps {
  videos: MatchupVideo[];
  groupedVideos: {[key: string]: MatchupVideo[]};
  expandedDirectories: {[key: string]: boolean};
  expandedGroups: {[key: string]: boolean};
  isOpen: boolean;
  toggleDirectoryAccordion: (directory: string) => void;
  toggleAccordion: (directory: string, charKey: string) => void;
  onVideoSelect: (url: string) => void;
  getCharacterGroupedVideos: (videos: MatchupVideo[]) => {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[]}};
  setIsOpen: (isOpen: boolean) => void;
  playerContainerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * 動画のプレイリストを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <Playlist
 *   videos={allVideos}
 *   groupedVideos={groupedVideos}
 *   expandedDirectories={expandedDirectories}
 *   expandedGroups={expandedGroups}
 *   isOpen={isOpen}
 *   toggleDirectoryAccordion={toggleDirectoryAccordion}
 *   toggleAccordion={toggleAccordion}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 *   getCharacterGroupedVideos={getCharacterGroupedVideos}
 *   setIsOpen={setIsOpen}
 * />
 * ```
 */
const Playlist: React.FC<PlaylistProps> = ({
  videos,
  groupedVideos,
  expandedDirectories,
  expandedGroups,
  isOpen,
  toggleDirectoryAccordion,
  toggleAccordion,
  onVideoSelect,
  getCharacterGroupedVideos,
  setIsOpen,
  playerContainerRef
}) => {
  // 事前にコンテンツをレンダリングしておく
  const renderDirectoryGroups = () => {
    return Object.keys(groupedVideos).length > 0 ? (
      <div className="divide-y divide-border dark:divide-gray-800">
        {Object.keys(groupedVideos).map(directory => (
          <DirectoryGroup
            key={directory}
            directory={directory}
            videos={groupedVideos[directory]}
            isExpanded={expandedDirectories[directory]}
            toggleDirectoryAccordion={() => toggleDirectoryAccordion(directory)}
            expandedGroups={expandedGroups}
            toggleAccordion={toggleAccordion}
            onVideoSelect={onVideoSelect}
            getCharacterGroupedVideos={getCharacterGroupedVideos}
          />
        ))}
      </div>
    ) : (
      <div className="p-4 text-center text-muted-foreground">
        プレイリストが空です
      </div>
    );
  };

  if (videos.length === 0) return null;
  
  return (
    <AnimatedAccordion
      title={`プレイリスト (${videos.length})`}
      isOpen={isOpen}
      onToggle={setIsOpen}
      playerContainerRef={playerContainerRef as RefObject<HTMLDivElement | null>}
    >
      {renderDirectoryGroups()}
    </AnimatedAccordion>
  );
};

export default Playlist; 