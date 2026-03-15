import React, { useRef, useEffect, useState, useCallback } from 'react';
import CharacterIconPair, { CharacterIcon } from './CharacterIconPair';
import VideoItem, { MatchupVideo } from './VideoItem';

/**
 * キャラクタートップグループコンポーネントのプロパティ
 * @interface CharacterTopGroupProps
 * @property {string} charKey - キャラクターグループの一意のキー
 * @property {Object} group - グループデータ
 * @property {CharacterIcon | null} group.icon1 - 1つ目のキャラクターアイコン
 * @property {CharacterIcon | null} group.icon2 - 2つ目のキャラクターアイコン
 * @property {string} [group.useChara] - 使用キャラクター名（英語）
 * @property {Object} group.directories - ディレクトリごとの動画リスト
 * @property {MatchupVideo[]} group.videos - 全動画リスト
 * @property {boolean} isExpanded - グループが展開されているかどうか
 * @property {(charKey: string) => void} toggleCharacterAccordion - キャラクターアコーディオンの開閉を切り替える関数
 * @property {{[key: string]: boolean}} expandedDirectories - 展開されているディレクトリの状態（キー: charKey-directory）
 * @property {(charKey: string, directory: string) => void} toggleDirectoryAccordion - ディレクトリアコーディオンの開閉を切り替える関数
 * @property {(url: string) => void} onVideoSelect - 動画が選択されたときのコールバック関数
 * @property {string} selectedVideoUrl - 選択された動画のURL
 */
interface CharacterTopGroupProps {
  charKey: string;
  group: {
    icon1: CharacterIcon | null;
    icon2: CharacterIcon | null;
    useChara?: string;
    directories: { [directory: string]: MatchupVideo[] };
    videos: MatchupVideo[];
  };
  isExpanded: boolean;
  toggleCharacterAccordion: (charKey: string) => void;
  expandedDirectories: { [key: string]: boolean };
  toggleDirectoryAccordion: (charKey: string, directory: string) => void;
  onVideoSelect: (url: string) => void;
  onHeightChange?: () => void;
  selectedVideoUrl: string;
}

/**
 * キャラクターの組み合わせを最上位に、チャンネルを2階層目に表示するコンポーネント
 * キャラクター → チャンネル → 動画 の階層で表示します
 *
 * @component
 */
const CharacterTopGroup: React.FC<CharacterTopGroupProps> = ({
  charKey,
  group,
  isExpanded,
  toggleCharacterAccordion,
  expandedDirectories,
  toggleDirectoryAccordion,
  onVideoSelect,
  onHeightChange,
  selectedVideoUrl,
}) => {
  const totalVideos = group.videos.length;
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);

  const updateContentHeight = useCallback(() => {
    if (contentRef.current && isExpanded) {
      const calculatedHeight = Math.min(contentRef.current.scrollHeight, 500);
      setContentHeight(calculatedHeight);
      if (onHeightChange) onHeightChange();
    }
  }, [isExpanded, onHeightChange]);

  useEffect(() => {
    updateContentHeight();
  }, [updateContentHeight, expandedDirectories]);

  useEffect(() => {
    if (!contentRef.current || !isExpanded) return;
    const resizeObserver = new ResizeObserver(() => {
      updateContentHeight();
    });
    resizeObserver.observe(contentRef.current);
    return () => {
      if (contentRef.current) resizeObserver.unobserve(contentRef.current);
    };
  }, [isExpanded, updateContentHeight]);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleCharacterAccordion(charKey);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="mb-2 border border-border rounded-md overflow-hidden custom-scrollbar mx-1 my-1">
      {/* キャラクターアコーディオンヘッダー */}
      <button
        className="w-full flex items-center justify-between p-2 bg-muted/30 hover:bg-muted/50"
        onClick={handleToggle}
        disabled={isAnimating}
      >
        <div className="flex items-center gap-2">
          <CharacterIconPair icon1={group.icon1} icon2={group.icon2} useChara={group.useChara} />
          <span className="text-xs text-muted-foreground">{totalVideos}件</span>
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

      {/* キャラクターアコーディオンコンテンツ */}
      <div
        className={`overflow-hidden transition-all custom-scrollbar ${isInitialRender ? '' : 'duration-300'} ease-in-out`}
        style={{
          maxHeight: isExpanded
            ? typeof contentHeight === 'number'
              ? `${contentHeight}px`
              : contentHeight
            : '0px',
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? 'visible' : 'hidden',
        }}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        <div ref={contentRef} className="space-y-2 overflow-y-auto custom-scrollbar max-h-[500px]">
          {Object.entries(group.directories)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([directory, dirVideos]) => {
              const dirKey = `${charKey}-${directory}`;
              const isDirExpanded = expandedDirectories[dirKey] || false;
              return (
                <DirectorySubGroup
                  key={dirKey}
                  directory={directory}
                  videos={dirVideos}
                  isExpanded={isDirExpanded}
                  onToggle={() => toggleDirectoryAccordion(charKey, directory)}
                  onVideoSelect={onVideoSelect}
                  selectedVideoUrl={selectedVideoUrl}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

/**
 * キャラクター内のチャンネル（ディレクトリ）サブグループコンポーネントのプロパティ
 */
interface DirectorySubGroupProps {
  directory: string;
  videos: MatchupVideo[];
  isExpanded: boolean;
  onToggle: () => void;
  onVideoSelect: (url: string) => void;
  selectedVideoUrl: string;
}

/**
 * キャラクターグループ内のチャンネルサブアコーディオンコンポーネント
 */
const DirectorySubGroup: React.FC<DirectorySubGroupProps> = ({
  directory,
  videos,
  isExpanded,
  onToggle,
  onVideoSelect,
  selectedVideoUrl,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | 'auto'>('auto');
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
    }
  }, []);

  useEffect(() => {
    if (contentRef.current && isExpanded) {
      const calculatedHeight = Math.min(contentRef.current.scrollHeight, 300);
      setContentHeight(calculatedHeight);
    }
  }, [isExpanded]);

  return (
    <div className="border border-border rounded-md overflow-hidden mx-1 my-1">
      {/* チャンネルアコーディオンヘッダー */}
      <button
        className="w-full flex items-center justify-between p-2 bg-muted/20 hover:bg-muted/40"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground text-sm">{directory}</h4>
          <span className="text-xs text-muted-foreground">{videos.length}件</span>
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
          maxHeight: isExpanded
            ? typeof contentHeight === 'number'
              ? `${contentHeight}px`
              : contentHeight
            : '0px',
          opacity: isExpanded ? 1 : 0,
          visibility: isExpanded ? 'visible' : 'hidden',
        }}
      >
        <div ref={contentRef} className="space-y-1 p-2 overflow-y-auto custom-scrollbar max-h-[300px]">
          {videos.map((video, index) => (
            <VideoItem
              key={`${video.directory}-${video.matchupKey}-${index}-${video.url}`}
              video={video}
              isSelected={video.url === selectedVideoUrl}
              onClick={() => onVideoSelect(video.url)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterTopGroup;
