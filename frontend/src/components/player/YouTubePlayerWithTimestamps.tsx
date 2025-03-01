import React, { useState, useEffect, useRef } from 'react';
import YouTubePlayer from './YouTubePlayer';
import YouTubeTimestamp from '../timestamp/YouTubeTimestamp';
import { extractVideoId } from '../utils/YouTubeUtils';
import { TimestampItem } from '../timestamp/TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';

/**
 * YouTubeプレーヤーとタイムスタンプを組み合わせたコンポーネントのプロパティ
 * @interface YouTubePlayerWithTimestampsProps
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 * @property {string} [selectedCharacter] - 選択されたキャラクター名（英語）
 * @property {string[]} [selectedOpponentCharacters=[]] - 選択された対戦キャラクター名の配列（英語）
 */
interface YouTubePlayerWithTimestampsProps {
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[]; // 検索結果で絞られる前の全ての動画リスト
  selectedCharacter?: string;
  selectedOpponentCharacters?: string[];
}

/**
 * YouTube動画プレーヤーとタイムスタンプリストを組み合わせたコンポーネント
 * 
 * タイムスタンプをクリックすると、動画の該当時間にジャンプします。
 * 関連動画のリストも表示でき、動画を切り替えることができます。
 * 
 * @component
 * @example
 * ```tsx
 * <YouTubePlayerWithTimestamps
 *   url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *   timestamps={[
 *     { time: 0, label: "イントロ", videoTitle: "動画タイトル" },
 *     { time: 30, label: "サビ", videoTitle: "動画タイトル" }
 *   ]}
 *   videos={relatedVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
 */
const YouTubePlayerWithTimestamps: React.FC<YouTubePlayerWithTimestampsProps> = ({
  videos = [],
  allVideos = [], // 検索結果で絞られる前の全ての動画リスト
  selectedCharacter,
  selectedOpponentCharacters = [],
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<MatchupVideo | null>(null);
  
  // プレイリストとタイムスタンプの開閉状態を管理
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true); // 初期状態でプレイリストを開く
  const [isTimestampOpen, setIsTimestampOpen] = useState(false);
  
  // プレーヤーの高さを参照するためのref
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // 使用キャラクターと対戦キャラクターの両方が選択されているかチェック
  const hasRequiredCharacters = !!selectedCharacter && selectedOpponentCharacters.length > 0;

  // プレイリストの開閉を制御する関数
  const handlePlaylistToggle = (isOpen: boolean) => {
    setIsPlaylistOpen(isOpen);
    // プレイリストが開かれたら、タイムスタンプを閉じる
    if (isOpen) {
      setIsTimestampOpen(false);
    }
  };

  // タイムスタンプの開閉を制御する関数
  const handleTimestampToggle = (isOpen: boolean) => {
    setIsTimestampOpen(isOpen);
    // タイムスタンプが開かれたら、プレイリストを閉じる
    if (isOpen) {
      setIsPlaylistOpen(false);
    }
  };

  // キャラクターが選択されたときにプレイリストを開く
  useEffect(() => {
    if (hasRequiredCharacters) {
      setIsPlaylistOpen(true);
      setIsTimestampOpen(false);
    }
  }, [selectedCharacter, selectedOpponentCharacters, hasRequiredCharacters]);

  // コンポーネントのマウント時に初期動画を設定
  useEffect(() => {
    // 必要なキャラクターが選択されていない場合は何もしない
    if (!hasRequiredCharacters) {
      setCurrentUrl('');
      setCurrentVideo(null);
      return;
    }
    
    // 動画リストが空でない場合でも、自動的に動画を選択しない
    // ユーザーがプレイリストから選択するまで待機
    setCurrentUrl('');
    setCurrentVideo(null);
  }, [videos, allVideos, hasRequiredCharacters]);

  // URLが変更されたときに対応する動画情報を更新
  useEffect(() => {
    if (currentUrl && !currentVideo) {
      // URLからビデオIDを抽出
      const videoId = extractVideoId(currentUrl);
      if (!videoId) return;

      // 全ての動画から一致するものを探す
      const allAvailableVideos = [...videos, ...allVideos];
      const matchingVideo = allAvailableVideos.find(video => {
        const videoIdFromList = extractVideoId(video.url);
        return videoIdFromList === videoId;
      });

      if (matchingVideo) {
        setCurrentVideo(matchingVideo);
      }
    }
  }, [currentUrl, currentVideo, videos, allVideos]);

  /**
   * タイムスタンプがクリックされたときの処理
   * @param time クリックされたタイムスタンプの時間（秒）
   */
  const handleTimestampClick = (time: number) => {
    // 現在のURLからビデオIDを抽出
    const videoId = extractVideoId(currentUrl);
    if (!videoId) return;
    
    // 新しいURLを生成（タイムスタンプ付き、自動再生有効）
    const newUrl = `https://www.youtube.com/watch?v=${videoId}&t=${time}`;
    setCurrentUrl(newUrl);
    setCurrentTime(time);
    
    // 現在の動画情報は維持（URLが変わっても同じ動画なので）
    // currentVideoの状態は変更しない
  };

  /**
   * 動画が選択されたときの処理
   * @param index 選択された動画のインデックス
   */
  const handleVideoSelect = (url: string) => {
    console.log('YouTubePlayerWithTimestamps: 動画選択ハンドラーが呼び出されました', url);
    
    // 選択された動画のURLを直接設定
    if (url) {
      setCurrentUrl(url);
      
      // URLに一致する動画を検索
      const foundVideo = [...videos, ...allVideos].find(video => video.url === url);
      if (foundVideo) {
        setCurrentVideo(foundVideo);
      }
    }
  };

  // 動画が選択されているかどうか
  const isVideoSelected = !!currentUrl && !!currentVideo;

  return (
    <div className="flex flex-col player-md:flex-row gap-4 justify-center w-full max-w-screen-2xl mx-auto px-4">
      <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-4 w-full player-md:w-3/4 player-lg:w-4/5">
        <div className="flex items-center justify-between mb-4">
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
      
        <div className="youtube-player-with-timestamps bg-background dark:bg-background flex justify-center">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* 動画プレーヤーを固定高さのコンテナで囲む */}
            <div 
              ref={playerContainerRef}
              className="flex-grow rounded-lg overflow-hidden border border-border dark:border-gray-800 bg-card/5 dark:bg-black/30 shadow-sm dark:shadow-xl
                        max-h-[80vh] min-h-[480px] w-full flex items-center justify-center" 
            >
              {!selectedCharacter ? (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">👾</div>
                  <h3 className="text-xl font-semibold mb-2">キャラクターを選択してください</h3>
                  <p className="text-muted-foreground">
                    上部のキャラクターセレクターから使用キャラクターを選択すると、
                    対応する動画が表示されます。
                  </p>
                </div>
              ) : !selectedOpponentCharacters.length ? (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">🆚</div>
                  <h3 className="text-xl font-semibold mb-2">対戦キャラクターを選択してください</h3>
                  <p className="text-muted-foreground">
                    上部のキャラクターセレクターから対戦キャラクターを1体以上選択すると、
                    マッチアップ動画が表示されます。
                  </p>
                </div>
              ) : isVideoSelected ? (
                <div className="h-full w-full">
                  <YouTubePlayer 
                    url={currentUrl} 
                    autoplay={true} 
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="text-4xl mb-4">🎬</div>
                  <h3 className="text-xl font-semibold mb-2">動画を選択してください</h3>
                  <p className="text-muted-foreground">
                    右側のプレイリストから再生したい動画を選択してください。<br />
                    プレイリストが閉じている場合は「プレイリスト」ボタンをクリックして開いてください。
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="md:w-1/4 player-md:w-1/4 player-lg:w-1/5 w-full">
        <YouTubeTimestamp 
          onTimestampClick={handleTimestampClick}
          currentTime={currentTime}
          videos={hasRequiredCharacters ? videos : []}
          allVideos={hasRequiredCharacters ? allVideos : []} // 全ての動画リストを渡す
          onVideoSelect={handleVideoSelect}
          url={currentUrl}
          isOpen={isTimestampOpen}
          setIsOpen={handleTimestampToggle}
          isPlaylistOpen={isPlaylistOpen}
          setIsPlaylistOpen={handlePlaylistToggle}
          playerContainerRef={playerContainerRef}
          selectedCharacter={selectedCharacter}
        />
      </div>
    </div>
  );
};

export default YouTubePlayerWithTimestamps; 