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
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {number} [currentTime=0] - 現在の再生時間（秒）
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 * @property {(videoIndex: number) => void} [onVideoSelect] - 動画が選択されたときのコールバック関数
 * @property {number} [selectedVideoIndex=-1] - 選択されている動画のインデックス
 */
interface YouTubeTimestampProps {
  // timestamps: TimestampItem[];
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[]; // 検索結果で絞られる前の全ての動画リスト
  onVideoSelect?: (url: string) => void;
  url?: string;
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
  onTimestampClick,
  currentTime = 0,
  videos = [],
  allVideos = [], // 検索結果で絞られる前の全ての動画リスト
  onVideoSelect,
  url,
}) => {
  // console.log("allVideos", allVideos);
  // console.log("videos", videos);
  // console.log("selectedVideoIndex", selectedVideoIndex);
  // console.log("currentTime", currentTime);
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

  // 現在選択されている動画のURLと同じURLを持つすべてのマッチアップのタイムスタンプを収集
  useEffect(() => {
    // if (selectedVideoIndex >= 0 && selectedVideoIndex < videos.length) {
      // const currentVideo = videos[selectedVideoIndex];
      // console.log("現在選択されている動画:", currentVideo.title, currentVideo.directory, currentVideo.url);
      
    if(url) {
      // URLからタイムスタンプ部分を除去する関数
      const removeTimestampFromUrl = (url: string): string => {
        // URLからタイムスタンプパラメータ（&t=〇〇s）を除去
        return url.replace(/[&?]t=\d+s?/, '');
      };
      
      const currentUrl = removeTimestampFromUrl(url);

      console.log("currentUrl:", currentUrl);
      
      // すべての動画からURLが一致するタイムスタンプを収集
      const matchingTimestamps: TimestampItem[] = [];

      console.log("allVideos length:", allVideos?.length || 0);
      
      // 検索結果で絞られる前の全ての動画から検索
      const videosToSearch = allVideos && allVideos.length > 0 ? allVideos : videos;
      
      console.log("videosToSearch length:", videosToSearch.length);
      console.log("currentUrl:", currentUrl);
      
      // まず、現在選択されている動画と完全に一致する動画のタイムスタンプを追加
      videosToSearch.forEach(video => {
        // 動画のURLからタイムスタンプを除去して比較
        const videoUrl = removeTimestampFromUrl(video.url);
        
        // URLが一致し、かつタイトルとディレクトリも一致する場合のみタイムスタンプを追加
        if (videoUrl === currentUrl) {
          console.log("完全一致 (URL, タイトル, ディレクトリ):", video.title, video.directory, videoUrl);
          
          video.timestamps.forEach(timestamp => {
            // 元の動画情報を保持するために新しいプロパティを追加
            // sourceVideoIndexは検索結果の配列（videos）内でのインデックスを計算
            const sourceVideoIndex = videos.findIndex(v => {
              // URLからタイムスタンプを除去して比較
              const vUrl = removeTimestampFromUrl(v.url);
              // URLとタイトルとディレクトリが一致する動画を探す
              return vUrl === videoUrl && v.title === video.title && v.directory === video.directory;
            });
            
            console.log(`タイムスタンプ追加: ${timestamp.time}秒, 動画: ${video.title}, インデックス: ${sourceVideoIndex}`);
            
            matchingTimestamps.push({
              ...timestamp,
              sourceVideo: video.title,
              sourceVideoIndex: sourceVideoIndex, // 検索結果内での対応するインデックス
              // キャラクター情報も追加
              chara1: video.chara1,
              chara2: video.chara2
            });
          });
        } else if (videoUrl === currentUrl) {
          console.log("URLは一致するが、タイトルまたはディレクトリが異なる:", video.title, video.directory);
        }
      });
      
      // タイムスタンプをtimeの値が小さい順に並べ替え
      matchingTimestamps.sort((a, b) => a.time - b.time);
      
      setAllMatchingTimestamps(matchingTimestamps);
    } 
    // else {
    //   setAllMatchingTimestamps([]);
    // }
  }, [videos, allVideos, url]);

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
  const handleRelatedTimestampClick = (time: number) => {
    // console.log('タイムスタンプクリック:', { time, selectedVideoIndex });

    onTimestampClick(time);
    
    // // sourceVideoIndexが有効な値（0以上）で、現在選択されている動画と異なる場合のみ動画を切り替える
    // if (sourceVideoIndex !== undefined && sourceVideoIndex >= 0 && sourceVideoIndex !== selectedVideoIndex && onVideoSelect) {
    //   console.log('動画切り替え:', sourceVideoIndex);
      
    //   // 動画を切り替える前に、選択しようとしている動画が実際に存在するか確認
    //   if (sourceVideoIndex < videos.length) {
    //     const targetVideo = videos[sourceVideoIndex];
    //     console.log('切り替え先の動画:', targetVideo.title, targetVideo.directory, targetVideo.url);
        
    //     // 動画を切り替え
    //     // onVideoSelect(sourceVideoIndex);
        
    //     // 少し遅延させてから時間を設定（動画の読み込みを待つ）
    //     setTimeout(() => {
    //       onTimestampClick(time);
    //     }, 500);
    //   } else {
    //     console.error('無効な動画インデックス:', sourceVideoIndex, '利用可能な動画数:', videos.length);
    //     // 無効なインデックスの場合は、現在の動画内でタイムスタンプジャンプ
    //     onTimestampClick(time);
    //   }
    // } else {
    //   // 同じ動画内のタイムスタンプの場合、または無効なインデックスの場合は通常通り処理
    //   console.log('同じ動画内のタイムスタンプ再生:', time);
    //   onTimestampClick(time);
    // }
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
          <motion.div
            className="overflow-hidden"
            animate={{ 
              height: isOpen ? (matchingTimestampsHeight !== "auto" ? matchingTimestampsHeight : "auto") : 0,
              opacity: isOpen ? 1 : 0
            }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div 
              ref={matchingTimestampsRef} 
              className="timestamp-list-container bg-card dark:bg-card/95 border-t border-border dark:border-gray-800"
            >
              <div className="p-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {allMatchingTimestamps.map((timestamp, index) => (
                  <div 
                    key={`related-timestamp-${index}`}
                    className={`
                      p-2 rounded cursor-pointer hover:bg-accent/10
                      ${timestamp.time === currentTime ? 'bg-primary/10 dark:bg-primary/5 text-primary font-medium border-l-2 border-primary' : ''}
                    `}
                    onClick={() => handleRelatedTimestampClick(timestamp.time)}
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

export default React.memo(YouTubeTimestamp); 