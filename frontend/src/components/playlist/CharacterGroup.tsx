import React, { useRef, useEffect, useState } from 'react';
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
 * @property {string} [group.useChara] - 使用キャラクター名（英語）
 * @property {boolean} isExpanded - グループが展開されているかどうか
 * @property {(directory: string, charKey: string) => void} toggleAccordion - アコーディオンの開閉を切り替える関数
 * @property {MatchupVideo[]} videos - 全ての動画リスト
 * @property {(url: string) => void} onVideoSelect - 動画が選択されたときのコールバック関数
 * @property {() => void} [onHeightChange] - 高さが変更されたときに呼び出されるコールバック関数
 */
interface CharacterGroupProps {
  charKey: string;
  directory: string;
  group: {
    icon1: CharacterIcon | null;
    icon2: CharacterIcon | null;
    videos: MatchupVideo[];
    useChara?: string;
  };
  isExpanded: boolean;
  toggleAccordion: (directory: string, charKey: string) => void;
  videos: MatchupVideo[];
  onVideoSelect: (url: string) => void;
  onHeightChange?: () => void;
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
 *   onHeightChange={updateContentHeight}
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
  onVideoSelect,
  onHeightChange
}) => {
  const totalTimestamps = group.videos.reduce((sum, video) => sum + video.timestamps.length, 0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(-1);
  
  // デバッグ用ログ
  useEffect(() => {
    // console.log('CharacterGroup mounted:', {
    //   charKey,
    //   useChara: group.useChara,
    //   icon1: group.icon1?.eng,
    //   icon2: group.icon2?.eng
    // });
  }, [charKey, group.useChara, group.icon1, group.icon2]);
  
  // 初回レンダリング後にフラグを更新
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);
  
  // コンテンツの高さを計算
  useEffect(() => {
    if (contentRef.current && isExpanded) {
      // 最大高さを300pxに制限
      const calculatedHeight = Math.min(contentRef.current.scrollHeight, 300);
      setContentHeight(calculatedHeight);
      // 親コンポーネントに高さの変更を通知
      if (onHeightChange) {
        onHeightChange();
      }
    }
  }, [isExpanded, onHeightChange]);
  
  // 事前にコンテンツをレンダリングしておく
  const renderVideoItems = () => {
    return group.videos.map((video, videoIndex) => {
      // 全体の動画リスト（親コンポーネントから渡されたvideos）から正確なインデックスを検索
      const videoIndexInAllVideos = videos.findIndex(v => 
        v.url === video.url && 
        v.matchupKey === video.matchupKey && 
        v.directory === video.directory
      );
      
      const isSelected = videoIndex === selectedVideoIndex;      
      
      return (
        <VideoItem
          key={`${video.directory}-${video.matchupKey}-${videoIndex}-${video.url}`}
          video={video}
          isSelected={isSelected}
          onClick={() => {
            // console.log('動画選択: インデックス', videoIndexInAllVideos, 'を選択');
            // console.log('選択した動画:', video.title, video.directory, video.url);
            if (onVideoSelect && videoIndexInAllVideos !== -1) {
              setSelectedVideoIndex(videoIndex);
              console.log("video.url", video.url);
              // onVideoSelect(videoIndexInAllVideos);
              onVideoSelect(video.url);
            }
          }}
        />
      );
    });
  };
  
  return (
    <div className="border border-border rounded-md overflow-hidden mx-2 my-2">
      {/* アコーディオンヘッダー */}
      <button
        className="w-full flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/40"
        onClick={() => toggleAccordion(directory, charKey)}
      >
        <div className="flex items-center">
          {/* キャラクターアイコン */}
          <CharacterIconPair icon1={group.icon1} icon2={group.icon2} useChara={group.useChara} />
          <span className="text-xs text-muted-foreground">
            {group.videos.length}件
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
      <div 
        className={`overflow-hidden transition-all ${isInitialRender ? '' : 'duration-300'} ease-in-out`}
        style={{ 
          maxHeight: isExpanded ? (typeof contentHeight === "number" ? `${contentHeight}px` : contentHeight) : "0px",
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? 'visible' : 'hidden'
        }}
      >
        <div ref={contentRef} className="space-y-1 p-2 overflow-y-auto max-h-[300px]">
          {renderVideoItems()}
        </div>
      </div>
    </div>
  );
};

export default CharacterGroup; 