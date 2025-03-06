import React, { RefObject, useEffect, useState } from 'react';
import YouTubePlayer from './YouTubePlayer';

/**
 * プレイヤーコンテンツのプロパティ
 * @interface PlayerContentProps
 * @property {boolean} isVideoSelected - 動画が選択されているかどうか
 * @property {string} currentUrl - 現在の動画URL
 * @property {RefObject<HTMLDivElement | null>} playerContainerRef - プレーヤーコンテナへの参照
 * @property {boolean} isSelectedCharacter - キャラクターが選択されているかどうか
 * @property {boolean} isSelectedOpponentCharacters - 対戦キャラクターが選択されているかどうか
 * @property {(time: number) => void} [onTimeUpdate] - 再生時間が更新されたときのコールバック関数
 */
interface PlayerContentProps {
  isVideoSelected: boolean;
  currentUrl: string;
  playerContainerRef: RefObject<HTMLDivElement | null>;
  isSelectedCharacter: boolean;
  isSelectedOpponentCharacters: boolean;
  onTimeUpdate?: (time: number) => void;
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
  onTimeUpdate
}) => {
  // 画面が横向きかどうかを検出するステート
  const [isLandscape, setIsLandscape] = useState(false);
  // 画面の短い方の寸法を保持するステート
  const [shortestDimension, setShortestDimension] = useState(0);

  // 画面の向きと寸法を検出するための関数
  const checkOrientation = () => {
    // window.innerWidthとwindow.innerHeightを比較して横向きかどうかを判定
    const isLandscapeMode = window.innerWidth > window.innerHeight;
    // 短い方の寸法を取得
    const shortest = Math.min(window.innerWidth, window.innerHeight);
    
    setIsLandscape(isLandscapeMode);
    setShortestDimension(shortest);
  };

  // コンポーネントマウント時と画面サイズ変更時に向きをチェック
  useEffect(() => {
    // 初期チェック
    checkOrientation();
    
    // リサイズイベントリスナーを追加
    window.addEventListener('resize', checkOrientation);
    
    // 向き変更イベントリスナーを追加（モバイルデバイス用）
    window.addEventListener('orientationchange', checkOrientation);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

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
          {isVideoSelected ? (
            <div className="h-full w-full">
              <YouTubePlayer 
                url={currentUrl} 
                autoplay={true}
                onTimeUpdate={onTimeUpdate}
              />
            </div>
          ) : !isSelectedCharacter ? (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">👾</div>
              <h3 className="text-xl font-semibold mb-2">キャラクターを選択してください</h3>
              <p className="text-muted-foreground">
                上部のキャラクターセレクターから使用キャラクターを選択すると、
                対応する動画が表示されます。
              </p>
            </div>
          ) : !isSelectedOpponentCharacters ? (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">🆚</div>
              <h3 className="text-xl font-semibold mb-2">対戦キャラクターを選択してください</h3>
              <p className="text-muted-foreground">
                上部のキャラクターセレクターから対戦キャラクターを1体以上選択すると、
                マッチアップ動画が表示されます。
              </p>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold mb-2">動画を選択してください</h3>
              <p className="text-muted-foreground text-xs xs:text-sm md:text-base">
                検索結果から再生したい動画を選択してください。<br />                
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerContent; 