import React from 'react';
import { MatchupVideo } from '../playlist/VideoItem';

/**
 * プレイヤーコントロールのプロパティ
 * @interface PlayerControlsProps
 * @property {boolean} isVideoSelected - 動画が選択されているかどうか
 * @property {MatchupVideo | null} currentVideo - 現在選択されている動画
 * @property {string | undefined} selectedCharacter - 選択されたキャラクター名（英語）
 * @property {string[]} selectedOpponentCharacters - 選択された対戦キャラクター名の配列（英語）
 */
interface PlayerControlsProps {
  isVideoSelected: boolean;
  currentVideo: MatchupVideo | null;
  selectedCharacter?: string;
  selectedOpponentCharacters: string[];
}

/**
 * プレイヤーコントロールコンポーネント
 * 
 * プレイヤーの上部に表示されるタイトルと情報を表示します。
 * 
 * @component
 */
const PlayerControls: React.FC<PlayerControlsProps> = ({
  isVideoSelected,
  currentVideo,
  selectedCharacter,
  selectedOpponentCharacters
}) => {
  return (
    <div className="flex items-center justify-between sm:mb-4 mb-1 p-2">
      <h3 className="text-lg font-semibold truncate mr-2">
        {!selectedCharacter 
          ? 'キャラクターを選択してください'
          : !selectedOpponentCharacters.length
            ? '対戦キャラクターを選択してください'
            : isVideoSelected 
              ? (currentVideo?.title || 'タイトルなし')
              : 'プレイリストから動画を選択してください'}
      </h3>
      {isVideoSelected && currentVideo?.directory && (
        <span className="text-sm bg-muted/30 dark:bg-muted/10 px-2 py-1 rounded whitespace-nowrap">
          {currentVideo.directory}
        </span>
      )}
    </div>
  );
};

export default PlayerControls; 