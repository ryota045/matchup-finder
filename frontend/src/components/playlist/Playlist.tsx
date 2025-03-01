import React, { useRef, useEffect, useState } from 'react';
import DirectoryGroup from './DirectoryGroup';
import { MatchupVideo } from './VideoItem';
import { CharacterIcon } from './CharacterIconPair';
import { AccordionHeader } from '../ui/Accordion';
import { motion } from 'framer-motion';

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
  onVideoSelect: (url: string) => void;
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
  onVideoSelect,
  getCharacterGroupedVideos,
  setIsOpen
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const [isInitialRender, setIsInitialRender] = useState(true);

  // 初回レンダリング後にフラグを更新
  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);

  // コンテンツの高さを再計算する関数
  const updateContentHeight = () => {
    if (contentRef.current && isOpen) {
      // 最大高さを400pxに制限
      const calculatedHeight = Math.min(contentRef.current.scrollHeight, 400);
      setContentHeight(calculatedHeight);
    }
  };

  // プレイリストが開かれたとき、またはディレクトリやグループの展開状態が変わったときに高さを更新
  useEffect(() => {
    updateContentHeight();
  }, [isOpen, expandedDirectories, expandedGroups]);

  // ResizeObserverを使用してコンテンツの高さ変更を監視
  useEffect(() => {
    if (!contentRef.current || !isOpen) return;

    const resizeObserver = new ResizeObserver(() => {
      updateContentHeight();
    });

    resizeObserver.observe(contentRef.current);

    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [isOpen]);

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
    <div className="playlist-container mb-4">
      <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 overflow-hidden">
        <AccordionHeader
          title={`プレイリスト (${videos.length})`}
          isOpen={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        />
        
        <motion.div
          className={`overflow-hidden ${isInitialRender ? '' : 'transition-all duration-300 ease-in-out'}`}
          animate={{ 
            height: isOpen ? (typeof contentHeight === "number" ? contentHeight : 400) : 0,
            opacity: isOpen ? 1 : 0
          }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            visibility: isOpen ? 'visible' : 'hidden'
          }}
        >
          <div 
            ref={contentRef}
            className="max-h-[400px] overflow-y-auto custom-scrollbar bg-card dark:bg-card/95 border-t border-border dark:border-gray-800"
          >
            {renderDirectoryGroups()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Playlist; 