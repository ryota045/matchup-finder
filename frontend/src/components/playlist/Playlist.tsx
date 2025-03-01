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
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
    <div className="playlist-container mb-4">
      <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 overflow-hidden">
        <AccordionHeader
          title={`プレイリスト (${videos.length})`}
          isOpen={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        />
        
        {isOpen && (
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {Object.keys(groupedVideos).length > 0 ? (
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
                    selectedVideoIndex={selectedVideoIndex}
                    onVideoSelect={onVideoSelect}
                    getCharacterGroupedVideos={getCharacterGroupedVideos}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                プレイリストが空です
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist; 