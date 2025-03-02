import React, { useRef, useEffect, useState } from 'react';
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
 * @property {string} selectedVideoUrl - 選択された動画のURL
 */
interface DirectoryGroupProps {
  directory: string;
  videos: MatchupVideo[];
  isExpanded: boolean;
  toggleDirectoryAccordion: () => void;
  expandedGroups: {[key: string]: boolean};
  toggleAccordion: (directory: string, charKey: string) => void;
  onVideoSelect: (url: string) => void;
  getCharacterGroupedVideos: (videos: MatchupVideo[]) => {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[]}};
  selectedVideoUrl: string;
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
  onVideoSelect,
  getCharacterGroupedVideos,
  selectedVideoUrl
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const [isInitialRender, setIsInitialRender] = useState(true);

  // コンテンツの高さを再計算する関数
  const updateContentHeight = () => {
    if (contentRef.current && isExpanded) {
      // 最大高さを300pxに制限
      const calculatedHeight = Math.min(contentRef.current.scrollHeight, 400);
      setContentHeight(calculatedHeight);
    }
  };

  // 初回レンダリング後にフラグを更新
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);

  // ディレクトリが展開されたとき、または内部のグループの展開状態が変わったときに高さを更新
  useEffect(() => {
    updateContentHeight();
  }, [isExpanded, expandedGroups]);

  // ResizeObserverを使用してコンテンツの高さ変更を監視
  useEffect(() => {
    if (!contentRef.current || !isExpanded) return;

    const resizeObserver = new ResizeObserver(() => {
      updateContentHeight();
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [isExpanded]);

  // 事前にコンテンツをレンダリングしておく
  const renderContent = () => {
    return Object.entries(getCharacterGroupedVideos(videos)).map(([charKey, group]) => {
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
          onVideoSelect={onVideoSelect}
          onHeightChange={updateContentHeight}
          selectedVideoUrl={selectedVideoUrl}
        />
      );
    });
  };

  return (
    <div className="mb-2 border border-border rounded-md overflow-hidden custom-scrollbar mx-1 my-1">
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
        className={`overflow-hidden transition-all custom-scrollbar ${isInitialRender ? '' : 'duration-300'} ease-in-out`}
        style={{ 
          maxHeight: isExpanded ? (typeof contentHeight === "number" ? `${contentHeight}px` : contentHeight) : "0px",
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? 'visible' : 'hidden'
        }}
      >
        <div ref={contentRef} className="space-y-2 overflow-y-auto custom-scrollbar max-h-[400px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DirectoryGroup; 