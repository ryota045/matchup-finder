import React, { RefObject } from 'react';
import YouTubePlayer from './YouTubePlayer';
import useOrientation from '@/hooks/useOrientation';

/**
 * プレイヤーコンテンツのプロパティ
 * @interface PlayerContentProps
 * @property {boolean} isVideoSelected - 動画が選択されているかどうか
 * @property {string} currentUrl - 現在の動画URL
 * @property {RefObject<HTMLDivElement | null>} playerContainerRef - プレーヤーコンテナへの参照
 * @property {boolean} isSelectedCharacter - キャラクターが選択されているかどうか
 * @property {boolean} isSelectedOpponentCharacters - 対戦キャラクターが選択されているかどうか
 * @property {(time: number) => void} [onTimeUpdate] - 再生時間が更新されたときのコールバック関数
 * @property {boolean} [isChangingVideo] - 動画切り替え中かどうか
 */
interface PlayerContentProps {
  isVideoSelected: boolean;
  currentUrl: string;
  playerContainerRef: RefObject<HTMLDivElement | null>;
  isSelectedCharacter: boolean;
  isSelectedOpponentCharacters: boolean;
  onTimeUpdate?: (time: number) => void;
  isChangingVideo?: boolean;
}

/**
 * プレイヤーコンテンツコンポーネント
 * 
 * 動画プレーヤーまたは動画選択メッセージを表示します。
 * 
 * @component
 */
const PlayerContent: React.FC<PlayerContentProps> = ({
  isVideoSelected,
  currentUrl,
  playerContainerRef,
  isSelectedCharacter,
  isSelectedOpponentCharacters,
  onTimeUpdate,
  isChangingVideo = false
}) => {
  // 画面の向きと寸法を管理するカスタムフック
  const { isLandscape, shortestDimension } = useOrientation();

  // プレイヤーコンテナのスタイルを動的に生成
  const playerContainerStyle = {
    height: isLandscape && window.innerWidth < 768 ? `${shortestDimension}px` : undefined,
    maxHeight: isLandscape && window.innerWidth < 768 ? `${shortestDimension}px` : undefined
  };

  return (
    <div className="youtube-player-with-timestamps bg-background dark:bg-background flex justify-center">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* 動画プレーヤーを固定高さのコンテナで囲む */}
        <div 
          ref={playerContainerRef}
          className="flex-grow rounded-lg overflow-hidden border border-border dark:border-gray-800 bg-card/5 dark:bg-black/30 shadow-sm dark:shadow-xl
                    xs:max-h-[80vh] xs:min-h-[480px] w-full flex items-center justify-center" 
          style={playerContainerStyle}
        >
          {isChangingVideo ? (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">動画を切り替え中...</h3>
              <div className="flex justify-center mt-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : isVideoSelected ? (
            <div className="h-full w-full">
              <YouTubePlayer 
                url={currentUrl} 
                autoplay={true}
                onTimeUpdate={onTimeUpdate}
              />
            </div>
          ) : (
            <SelectionPrompt 
              isSelectedCharacter={isSelectedCharacter}
              isSelectedOpponentCharacters={isSelectedOpponentCharacters}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 選択プロンプトのプロパティ
 * @interface SelectionPromptProps
 * @property {boolean} isSelectedCharacter - キャラクターが選択されているかどうか
 * @property {boolean} isSelectedOpponentCharacters - 対戦キャラクターが選択されているかどうか
 */
interface SelectionPromptProps {
  isSelectedCharacter: boolean;
  isSelectedOpponentCharacters: boolean;
}

/**
 * 選択プロンプトコンポーネント
 * 
 * キャラクター選択や動画選択を促すメッセージを表示します。
 * 
 * @component
 */
const SelectionPrompt: React.FC<SelectionPromptProps> = ({
  isSelectedCharacter,
  isSelectedOpponentCharacters
}) => {
  if (!isSelectedCharacter) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">👾</div>
        <h3 className="text-xl font-semibold mb-2">キャラクターを選択してください</h3>
        <p className="text-muted-foreground">
          上部のキャラクターセレクターから使用キャラクターを選択すると、
          対応する動画が表示されます。
        </p>
      </div>
    );
  } else if (!isSelectedOpponentCharacters) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🆚</div>
        <h3 className="text-xl font-semibold mb-2">対戦キャラクターを選択してください</h3>
        <p className="text-muted-foreground">
          上部のキャラクターセレクターから対戦キャラクターを1体以上選択すると、
          マッチアップ動画が表示されます。
        </p>
      </div>
    );
  } else {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">🎬</div>
        <h3 className="text-xl font-semibold mb-2">動画を選択してください</h3>
        <p className="text-muted-foreground text-xs xs:text-sm md:text-base">
          検索結果から再生したい動画を選択してください。<br />                
        </p>
      </div>
    );
  }
};

export default PlayerContent; 