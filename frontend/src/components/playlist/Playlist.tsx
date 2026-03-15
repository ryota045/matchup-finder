import React, { RefObject } from 'react';
import CharacterTopGroup from './CharacterTopGroup';
import { MatchupVideo } from './VideoItem';
import { CharacterIcon } from './CharacterIconPair';
import AnimatedAccordion from '../ui/AnimatedAccordion';

/**
 * プレイリストコンポーネントのプロパティ
 * @interface PlaylistProps
 * @property {MatchupVideo[]} videos - 全ての動画リスト
 * @property {Object} characterGroupedVideos - キャラクターの組み合わせごとにグループ化された動画（チャンネル情報を含む）
 * @property {Object} expandedCharacters - 展開されているキャラクターグループの状態（キー: charKey）
 * @property {Object} expandedDirectories - 展開されているチャンネルの状態（キー: charKey-directory）
 * @property {boolean} isOpen - プレイリストが開いているかどうか
 * @property {(charKey: string) => void} toggleCharacterAccordion - キャラクターグループアコーディオンの開閉を切り替える関数
 * @property {(charKey: string, directory: string) => void} toggleDirectoryAccordion - チャンネルアコーディオンの開閉を切り替える関数
 * @property {(url: string) => void} onVideoSelect - 動画が選択されたときのコールバック関数
 * @property {(isOpen: boolean) => void} setIsOpen - プレイリストの開閉状態を設定する関数
 * @property {RefObject<HTMLDivElement | null>} [playerContainerRef] - プレーヤーコンテナへの参照
 * @property {string} [className] - 追加のCSSクラス名
 * @property {string} selectedVideoUrl - 選択された動画のURL
 */
interface PlaylistProps {
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
  isOpen: boolean;
  toggleCharacterAccordion: (charKey: string) => void;
  toggleDirectoryAccordion: (charKey: string, directory: string) => void;
  onVideoSelect: (url: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  playerContainerRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  selectedVideoUrl: string;
}

/**
 * 動画のプレイリストを表示するコンポーネント
 * キャラクター → チャンネル → 動画 の階層で表示します
 *
 * @component
 */
const Playlist: React.FC<PlaylistProps> = ({
  videos,
  characterGroupedVideos,
  expandedCharacters,
  expandedDirectories,
  isOpen,
  toggleCharacterAccordion,
  toggleDirectoryAccordion,
  onVideoSelect,
  setIsOpen,
  playerContainerRef,
  className = '',
  selectedVideoUrl,
}) => {
  const renderCharacterGroups = () => {
    const entries = Object.entries(characterGroupedVideos);
    if (entries.length === 0) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          プレイリストが空です
        </div>
      );
    }

    return (
      <div className="divide-y divide-border dark:divide-gray-800">
        {entries
          .sort(([, a], [, b]) => b.videos.length - a.videos.length)
          .map(([charKey, group]) => (
            <CharacterTopGroup
              key={charKey}
              charKey={charKey}
              group={group}
              isExpanded={expandedCharacters[charKey] || false}
              toggleCharacterAccordion={toggleCharacterAccordion}
              expandedDirectories={expandedDirectories}
              toggleDirectoryAccordion={toggleDirectoryAccordion}
              onVideoSelect={onVideoSelect}
              selectedVideoUrl={selectedVideoUrl}
            />
          ))}
      </div>
    );
  };

  if (videos.length === 0) return null;

  return (
    <AnimatedAccordion
      title={`検索結果 (${videos.length})`}
      isOpen={isOpen}
      onToggle={setIsOpen}
      playerContainerRef={playerContainerRef as RefObject<HTMLDivElement | null>}
      className={className}
      disableAnimationOnMobile={true}
    >
      {renderCharacterGroups()}
    </AnimatedAccordion>
  );
};

export default Playlist;
