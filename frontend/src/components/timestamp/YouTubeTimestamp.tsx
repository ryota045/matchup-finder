import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characterIcons } from '../../data/characterData';
import { AccordionHeader } from '../ui/Accordion';
import TimestampList from './TimestampList';
import Playlist from '../playlist/Playlist';
import { TimestampItem } from './TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';
import CharacterIconPair, { CharacterIcon } from '../playlist/CharacterIconPair';

/**
 * YouTubeタイムスタンプコンポーネントのプロパティ
 * @interface YouTubeTimestampProps
 * @property {TimestampItem[]} timestamps - タイムスタンプのリスト
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {number} [currentTime=0] - 現在の再生時間（秒）
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト
 * @property {(videoIndex: number) => void} [onVideoSelect] - 動画が選択されたときのコールバック関数
 * @property {number} [selectedVideoIndex=-1] - 選択されている動画のインデックス
 */
interface YouTubeTimestampProps {
  timestamps: TimestampItem[];
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  videos?: MatchupVideo[];
  onVideoSelect?: (videoIndex: number) => void;
  selectedVideoIndex?: number;
}

/**
 * YouTube動画のタイムスタンプとプレイリストを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <YouTubeTimestamp
 *   timestamps={[
 *     { time: 0, label: "イントロ" },
 *     { time: 30, label: "サビ" }
 *   ]}
 *   onTimestampClick={handleTimestampClick}
 *   currentTime={15}
 *   videos={relatedVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
 */
const YouTubeTimestamp: React.FC<YouTubeTimestampProps> = ({
  timestamps,
  onTimestampClick,
  currentTime = 0,
  videos = [],
  onVideoSelect,
  selectedVideoIndex = -1,
}) => {
  // アコーディオンの開閉状態を管理
  const [isOpen, setIsOpen] = useState(true);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});
  const [allMatchingTimestamps, setAllMatchingTimestamps] = useState<TimestampItem[]>([]);
  
  // アニメーション用のref
  const matchingTimestampsRef = useRef<HTMLDivElement>(null);
  const [matchingTimestampsHeight, setMatchingTimestampsHeight] = useState<number | "auto">("auto");
  
  // 動画をディレクトリごとにグループ化
  useEffect(() => {
    if (videos.length === 0) return;
    
    // ディレクトリごとにグループ化
    const grouped: {[key: string]: MatchupVideo[]} = {};
    videos.forEach(video => {
      if (!grouped[video.directory]) {
        grouped[video.directory] = [];
      }
      grouped[video.directory].push(video);
    });
    
    setGroupedVideos(grouped);
    
    // ディレクトリごとのアコーディオンの初期状態を設定
    const initialDirectoryState: {[key: string]: boolean} = {};
    Object.keys(grouped).forEach((directory, index) => {
      // 最初のディレクトリだけを開いた状態にする
      initialDirectoryState[directory] = index === 0;
    });
    setExpandedDirectories(initialDirectoryState);
    
    // キャラクターの組み合わせごとにアコーディオンの初期状態を設定
    const initialExpandedState: {[key: string]: boolean} = {};
    videos.forEach(video => {
      const character1 = characterIcons.find(c => 
        c.anotation.some(a => video.chara1.toLowerCase().includes(a.toLowerCase()))
      );
      const character2 = characterIcons.find(c => 
        c.anotation.some(a => video.chara2.toLowerCase().includes(a.toLowerCase()))
      );
      
      if (character1 && character2) {
        // キャラクター名をアルファベット順にソートして、AvsB と BvsA を同じグループにする
        const sortedChars = [character1.eng, character2.eng].sort();
        const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
        // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
        const uniqueKey = `${video.directory}-${charKey}`;
        // 初期状態では最初のグループだけを開いた状態にする
        initialExpandedState[uniqueKey] = false;
      }
    });
    
    setExpandedGroups(initialExpandedState);
  }, [videos]);

  // 現在選択されている動画のタイトルと一致するすべてのタイムスタンプを収集
  useEffect(() => {
    if (selectedVideoIndex >= 0 && selectedVideoIndex < videos.length) {
      const currentVideo = videos[selectedVideoIndex];
      const currentTitle = currentVideo.title;
      
      // すべての動画からタイトルが一致するタイムスタンプを収集
      const matchingTimestamps: TimestampItem[] = [];
      
      videos.forEach(video => {
        // 動画のタイトルが一致するタイムスタンプを追加
        video.timestamps.forEach(timestamp => {
          if (timestamp.videoTitle === currentTitle) {
            // 元の動画情報を保持するために新しいプロパティを追加
            matchingTimestamps.push({
              ...timestamp,
              sourceVideo: video.title,
              sourceVideoIndex: videos.indexOf(video),
              // キャラクター情報も追加
              chara1: video.chara1,
              chara2: video.chara2
            });
          }
        });
      });
      
      // タイムスタンプをtimeの値が小さい順に並べ替え
      matchingTimestamps.sort((a, b) => a.time - b.time);
      
      setAllMatchingTimestamps(matchingTimestamps);
    } else {
      setAllMatchingTimestamps([]);
    }
  }, [selectedVideoIndex, videos]);

  // コンテンツの高さを計算
  useEffect(() => {
    if (matchingTimestampsRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setMatchingTimestampsHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(matchingTimestampsRef.current);
      return () => {
        if (matchingTimestampsRef.current) {
          resizeObserver.unobserve(matchingTimestampsRef.current);
        }
      };
    }
  }, [allMatchingTimestamps]);

  /**
   * キャラクターアイコンの組み合わせごとにビデオをグループ化する関数
   * @param videos グループ化する動画リスト
   * @returns キャラクターの組み合わせごとにグループ化された動画
   */
  const getCharacterGroupedVideos = (videos: MatchupVideo[]) => {
    const charGroups: {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[]}} = {};
    
    videos.forEach(video => {
      const character1 = characterIcons.find(c => 
        c.anotation.some(a => video.chara1.toLowerCase().includes(a.toLowerCase()))
      );
      const character2 = characterIcons.find(c => 
        c.anotation.some(a => video.chara2.toLowerCase().includes(a.toLowerCase()))
      );
      
      if (character1 && character2) {
        // キャラクター名をアルファベット順にソートして、AvsB と BvsA を同じグループにする
        const sortedChars = [character1.eng, character2.eng].sort();
        const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
        
        if (!charGroups[charKey]) {
          charGroups[charKey] = {
            icon1: character1,
            icon2: character2,
            videos: []
          };
        }
        
        charGroups[charKey].videos.push(video);
      } else {
        // キャラクターが見つからない場合は「その他」グループに入れる
        const otherKey = 'other';
        if (!charGroups[otherKey]) {
          charGroups[otherKey] = {
            icon1: null,
            icon2: null,
            videos: []
          };
        }
        charGroups[otherKey].videos.push(video);
      }
    });
    
    return charGroups;
  };
  
  /**
   * アコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   * @param charKey キャラクターグループのキー
   */
  const toggleAccordion = (directory: string, charKey: string) => {
    // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
    const uniqueKey = `${directory}-${charKey}`;
    setExpandedGroups(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey]
    }));
  };
  
  /**
   * ディレクトリアコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   */
  const toggleDirectoryAccordion = (directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  };

  /**
   * 関連タイムスタンプがクリックされたときの処理
   * @param time タイムスタンプの時間
   * @param sourceVideoIndex 元の動画のインデックス（オプション）
   */
  const handleRelatedTimestampClick = (time: number, sourceVideoIndex?: number) => {
    // 別の動画のタイムスタンプがクリックされた場合、その動画に切り替える
    if (sourceVideoIndex !== undefined && sourceVideoIndex !== selectedVideoIndex && onVideoSelect) {
      onVideoSelect(sourceVideoIndex);
      // 少し遅延させてから時間を設定（動画の読み込みを待つ）
      setTimeout(() => {
        onTimestampClick(time);
      }, 500);
    } else {
      // 同じ動画内のタイムスタンプの場合は通常通り処理
      onTimestampClick(time);
    }
  };

  /**
   * タイムスタンプのキャラクターアイコンを取得する関数
   * @param chara1 1人目のキャラクター名
   * @param chara2 2人目のキャラクター名
   * @returns キャラクターアイコンのペア
   */
  const getCharacterIcons = (chara1: string, chara2: string) => {
    const character1 = characterIcons.find(c => 
      c.anotation.some(a => chara1.toLowerCase().includes(a.toLowerCase()))
    );
    const character2 = characterIcons.find(c => 
      c.anotation.some(a => chara2.toLowerCase().includes(a.toLowerCase()))
    );
    
    return { icon1: character1 || null, icon2: character2 || null };
  };

  return (
    <div className="youtube-timestamp-container space-y-4">
      {videos.length > 0 && (
        <Playlist
          videos={videos}
          groupedVideos={groupedVideos}
          expandedDirectories={expandedDirectories}
          expandedGroups={expandedGroups}
          isOpen={isPlaylistOpen}
          toggleDirectoryAccordion={toggleDirectoryAccordion}
          toggleAccordion={toggleAccordion}
          selectedVideoIndex={selectedVideoIndex}
          onVideoSelect={onVideoSelect || (() => {})}
          getCharacterGroupedVideos={getCharacterGroupedVideos}
          setIsOpen={setIsPlaylistOpen}
        />
      )}
      
      {allMatchingTimestamps.length > 0 && (
        <div className="youtube-timestamp bg-card dark:bg-card/95 border border-border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm dark:shadow-xl">
          <AccordionHeader
            title={`現在の動画のタイムスタンプ (${allMatchingTimestamps.length})`}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ 
                  height: matchingTimestampsHeight !== "auto" ? matchingTimestampsHeight : "auto",
                  opacity: 1
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div 
                  ref={matchingTimestampsRef} 
                  className="timestamp-list-container"
                >
                  <div className="p-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {allMatchingTimestamps.map((timestamp, index) => (
                      <div 
                        key={`related-timestamp-${index}`}
                        className={`
                          p-2 rounded cursor-pointer hover:bg-accent/10
                          ${timestamp.time === currentTime ? 'bg-primary/10 dark:bg-primary/5 text-primary font-medium border-l-2 border-primary' : ''}
                        `}
                        onClick={() => handleRelatedTimestampClick(timestamp.time, timestamp.sourceVideoIndex)}
                      >
                        <div className="flex items-center">
                          <span className="inline-block w-16 text-sm font-mono text-muted-foreground bg-muted/20 dark:bg-muted/10 rounded px-1 py-0.5 text-center">
                            {timestamp.originalDetectTime || formatTime(timestamp.time)}
                          </span>
                          
                          {/* キャラクターアイコンを表示 */}
                          {timestamp.chara1 && timestamp.chara2 && (
                            <div className="flex-shrink-0 ml-2">
                              <CharacterIconPair 
                                {...getCharacterIcons(timestamp.chara1, timestamp.chara2)} 
                              />
                            </div>
                          )}                          
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      {/* {timestamps.length > 0 && (
        <div className="youtube-timestamp bg-card dark:bg-card/95 border border-border dark:border-gray-800 rounded-lg overflow-hidden shadow-sm dark:shadow-xl">
          <AccordionHeader
            title={`現在の動画のタイムスタンプ (${timestamps.length})`}
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
          <TimestampList
            timestamps={timestamps}
            currentTime={currentTime}
            onTimestampClick={onTimestampClick}
            isOpen={isOpen}
          />
        </div>
      )} */}
    </div>
  );
};

// 時間をフォーマットする関数
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export default YouTubeTimestamp; 