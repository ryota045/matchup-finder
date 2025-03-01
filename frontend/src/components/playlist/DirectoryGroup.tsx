import React from 'react';
import CharacterGroup from './CharacterGroup';
import { MatchupVideo } from './VideoItem';
import { CharacterIcon } from './CharacterIconPair';

/**
 * ディレクトリグループコンポーネントのプロパティ
 * @interface DirectoryGroupProps
 * @property {string} directory - ディレクトリ名
 * @property {MatchupVideo[]} videos - ディレクトリに属する動画リスト
 * @property {boolean} isExpanded - ディレクトリが展開されているかどうか
 * @property {() => void} toggleDirectoryAccordion - ディレクトリアコーディオンの開閉を切り替える関数
 * @property {Object} expandedGroups - 展開されているキャラクターグループの状態
 * @property {(directory: string, charKey: string) => void} toggleAccordion - キャラクターグループアコーディオンの開閉を切り替える関数
 * @property {number} selectedVideoIndex - 選択されている動画のインデックス
 * @property {(index: number) => void} onVideoSelect - 動画が選択されたときのコールバック関数
 * @property {(videos: MatchupVideo[]) => Object} getCharacterGroupedVideos - 動画をキャラクターごとにグループ化する関数
 */
interface DirectoryGroupProps {
  directory: string;
  videos: MatchupVideo[];
  isExpanded: boolean;
  toggleDirectoryAccordion: () => void;
  expandedGroups: {[key: string]: boolean};
  toggleAccordion: (directory: string, charKey: string) => void;
  selectedVideoIndex: number;
  onVideoSelect: (index: number) => void;
  getCharacterGroupedVideos: (videos: MatchupVideo[]) => {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[]}};
}

/**
 * ディレクトリごとに動画をグループ化して表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <DirectoryGroup
 *   directory="SF6"
 *   videos={sf6Videos}
 *   isExpanded={true}
 *   toggleDirectoryAccordion={() => toggleDirectoryAccordion("SF6")}
 *   expandedGroups={expandedGroups}
 *   toggleAccordion={toggleAccordion}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 *   getCharacterGroupedVideos={getCharacterGroupedVideos}
 * />
 * ```
 */
const DirectoryGroup: React.FC<DirectoryGroupProps> = ({
  directory,
  videos,
  isExpanded,
  toggleDirectoryAccordion,
  expandedGroups,
  toggleAccordion,
  selectedVideoIndex,
  onVideoSelect,
  getCharacterGroupedVideos
}) => {
  return (
    <div className="mb-2 border border-border rounded-md overflow-hidden mx-2 my-2">
      {/* ディレクトリアコーディオンヘッダー */}
      <button
        className="w-full flex items-center justify-between p-2 bg-muted/30 hover:bg-muted/50"
        onClick={toggleDirectoryAccordion}
      >
        <h4 className="font-medium text-foreground text-sm">{directory}</h4>
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      
      {/* ディレクトリアコーディオンコンテンツ */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-y-auto ${
          isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2">
          {Object.entries(getCharacterGroupedVideos(videos)).map(([charKey, group]) => {
            // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
            const uniqueKey = `${directory}-${charKey}`;
            const isGroupExpanded = expandedGroups[uniqueKey] || false;
            
            return (
              <CharacterGroup
                key={`${directory}-${charKey}`}
                charKey={charKey}
                directory={directory}
                group={group}
                isExpanded={isGroupExpanded}
                toggleAccordion={toggleAccordion}
                videos={videos}
                selectedVideoIndex={selectedVideoIndex}
                onVideoSelect={onVideoSelect}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DirectoryGroup; 