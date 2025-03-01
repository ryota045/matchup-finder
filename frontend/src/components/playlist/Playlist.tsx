import React from 'react';
import DirectoryGroup from './DirectoryGroup';
import { MatchupVideo } from './VideoItem';
import { CharacterIcon } from './CharacterIconPair';
import { AccordionHeader } from '../ui/Accordion';

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
 */
interface PlaylistProps {
  videos: MatchupVideo[];
  groupedVideos: {[key: string]: MatchupVideo[]};
  expandedDirectories: {[key: string]: boolean};
  expandedGroups: {[key: string]: boolean};
  isOpen: boolean;
  toggleDirectoryAccordion: (directory: string) => void;
  toggleAccordion: (directory: string, charKey: string) => void;
  selectedVideoIndex: number;
  onVideoSelect: (index: number) => void;
  getCharacterGroupedVideos: (videos: MatchupVideo[]) => {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[]}};
  setIsOpen: (isOpen: boolean) => void;
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
  selectedVideoIndex,
  onVideoSelect,
  getCharacterGroupedVideos,
  setIsOpen
}) => {
  if (videos.length === 0) return null;
  
  return (
    <div className="bg-gray-100 rounded overflow-hidden mb-4">
      <AccordionHeader
        title="プレイリスト"
        count={videos.length}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
          {Object.entries(groupedVideos).map(([directory, directoryVideos]) => (
            <DirectoryGroup
              key={directory}
              directory={directory}
              directoryVideos={directoryVideos}
              isExpanded={expandedDirectories[directory] || false}
              toggleDirectoryAccordion={toggleDirectoryAccordion}
              expandedGroups={expandedGroups}
              toggleAccordion={toggleAccordion}
              videos={videos}
              selectedVideoIndex={selectedVideoIndex}
              onVideoSelect={onVideoSelect}
              getCharacterGroupedVideos={getCharacterGroupedVideos}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Playlist; 