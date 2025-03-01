import React from 'react';
import CharacterIconPair, { CharacterIcon } from './CharacterIconPair';
import VideoItem, { MatchupVideo } from './VideoItem';

/**
 * キャラクターグループコンポーネントのプロパティ
 * @interface CharacterGroupProps
 * @property {string} charKey - キャラクターグループの一意のキー
 * @property {string} directory - グループが属するディレクトリ
 * @property {Object} group - グループデータ
 * @property {CharacterIcon | null} group.icon1 - 1つ目のキャラクターアイコン
 * @property {CharacterIcon | null} group.icon2 - 2つ目のキャラクターアイコン
 * @property {MatchupVideo[]} group.videos - グループ内の動画リスト
 * @property {boolean} isExpanded - グループが展開されているかどうか
 * @property {(directory: string, charKey: string) => void} toggleAccordion - アコーディオンの開閉を切り替える関数
 * @property {MatchupVideo[]} videos - 全ての動画リスト
 * @property {number} selectedVideoIndex - 選択されている動画のインデックス
 * @property {(index: number) => void} onVideoSelect - 動画が選択されたときのコールバック関数
 */
interface CharacterGroupProps {
  charKey: string;
  directory: string;
  group: {
    icon1: CharacterIcon | null;
    icon2: CharacterIcon | null;
    videos: MatchupVideo[];
  };
  isExpanded: boolean;
  toggleAccordion: (directory: string, charKey: string) => void;
  videos: MatchupVideo[];
  selectedVideoIndex: number;
  onVideoSelect: (index: number) => void;
}

/**
 * キャラクターの組み合わせごとに動画をグループ化して表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <CharacterGroup
 *   charKey="ryu-ken"
 *   directory="SF6"
 *   group={characterGroup}
 *   isExpanded={true}
 *   toggleAccordion={toggleAccordion}
 *   videos={allVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
 */
const CharacterGroup: React.FC<CharacterGroupProps> = ({
  charKey,
  directory,
  group,
  isExpanded,
  toggleAccordion,
  videos,
  selectedVideoIndex,
  onVideoSelect
}) => {
  const totalTimestamps = group.videos.reduce((sum, video) => sum + video.timestamps.length, 0);
  
  return (
    <div className="border rounded-md overflow-hidden mx-2 my-2">
      {/* アコーディオンヘッダー */}
      <button
        className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
        onClick={() => toggleAccordion(directory, charKey)}
      >
        <div className="flex items-center">
          {/* キャラクターアイコン */}
          <CharacterIconPair icon1={group.icon1} icon2={group.icon2} />
          <span className="text-xs text-gray-500">
            {group.videos.length}件 ({totalTimestamps}タイムスタンプ)
          </span>
        </div>
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
      
      {/* 動画リスト */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="space-y-1 p-2">
          {group.videos.map((video, videoIndex) => {
            // 全体の動画リスト（親コンポーネントから渡されたvideos）から正確なインデックスを検索
            const videoIndexInAllVideos = videos.findIndex(v => 
              v.url === video.url && 
              v.matchupKey === video.matchupKey && 
              v.directory === video.directory
            );
            
            const isSelected = videoIndexInAllVideos === selectedVideoIndex;
            
            return (
              <VideoItem
                key={`${video.directory}-${video.matchupKey}-${videoIndex}-${video.url}`}
                video={video}
                isSelected={isSelected}
                onClick={() => {
                  console.log('動画選択: インデックス', videoIndexInAllVideos, 'を選択');
                  console.log('選択した動画:', video.title, video.directory, video.url);
                  if (onVideoSelect && videoIndexInAllVideos !== -1) {
                    onVideoSelect(videoIndexInAllVideos);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterGroup; 