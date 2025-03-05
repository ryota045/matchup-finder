import React, { useEffect, useRef, useCallback } from 'react';
import { TimestampItem } from './TimestampItem';
import CharacterIconPair, { CharacterIcon } from '../playlist/CharacterIconPair';
import { characterIcons } from '../../data/characterData';
import { formatTime } from '../../utils/YouTubeUtils';

/**
 * タイムスタンプリストのプロパティ
 * @interface TimestampListProps
 * @property {TimestampItem[]} timestamps - タイムスタンプのリスト
 * @property {number} [currentTime=0] - 現在の再生時間（秒）
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 */
interface TimestampListProps {
  timestamps: TimestampItem[];
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  selectedCharacter?: string;
}

/**
 * タイムスタンプのリストを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <TimestampList
 *   timestamps={[
 *     { time: 0, label: "イントロ", videoTitle: "動画タイトル" },
 *     { time: 30, label: "サビ", videoTitle: "動画タイトル" }
 *   ]}
 *   currentTime={15}
 *   onTimestampClick={handleTimestampClick}
 * />
 * ```
 */
const TimestampList: React.FC<TimestampListProps> = ({
  timestamps,
  onTimestampClick,
  currentTime = 0,
  selectedCharacter,
}) => {
  // スクロール用のコンテナ参照
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // 現在のタイムスタンプ要素の参照
  const currentTimestampRef = useRef<HTMLDivElement>(null);
  // 前回の再生時間を保持するref
  const prevTimeRef = useRef<number>(currentTime);
  // 最後にクリックされたタイムスタンプの時間
  const lastClickedTimeRef = useRef<number | null>(null);

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
    
    // 選択されたキャラクターのアイコンを取得
    const selectedCharacterIcon = selectedCharacter ? 
      characterIcons.find(c => c.anotation.some(a => selectedCharacter.toLowerCase().includes(a.toLowerCase()))) : null;
    
    // 選択されたキャラクターが存在し、character2と一致する場合はswapする
    if (selectedCharacterIcon && character2 && 
        selectedCharacterIcon.eng === character2.eng && 
        character1) {
      // character1とcharacter2を入れ替える
      return { icon1: character2, icon2: character1 };
    }
    
    return { icon1: character1 || null, icon2: character2 || null };
  };

  // 現在の再生時間に最も近いタイムスタンプを見つける
  const findNearestTimestamp = useCallback((time: number, timestamps: TimestampItem[]): number => {
    if (timestamps.length === 0) return -1;
    
    // 現在の時間以前の最も近いタイムスタンプを探す
    let nearestIndex = 0;
    let minDiff = Number.MAX_SAFE_INTEGER;
    
    timestamps.forEach((timestamp, index) => {
      // 現在の時間以前のタイムスタンプの中で最も近いものを探す
      if (timestamp.time <= time) {
        const diff = time - timestamp.time;
        if (diff < minDiff) {
          minDiff = diff;
          nearestIndex = index;
        }
      }
    });
    
    // 現在の時間以前のタイムスタンプがない場合は、最初のタイムスタンプを選択
    if (minDiff === Number.MAX_SAFE_INTEGER && timestamps.length > 0) {
      return 0;
    }
    
    return nearestIndex;
  }, []);

  // 指定されたタイムスタンプにスクロールする関数
  const scrollToTimestamp = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    
    const timestampElements = scrollContainerRef.current.querySelectorAll('[data-timestamp-index]');
    if (index < timestampElements.length) {
      const element = timestampElements[index] as HTMLElement;
      if (element) {
        // スムーズにスクロール
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, []);

  // タイムスタンプがクリックされたときの処理
  const handleTimestampClick = useCallback((time: number) => {
    // 最後にクリックされたタイムスタンプの時間を記録
    lastClickedTimeRef.current = time;
    
    // 親コンポーネントのコールバックを呼び出す
    onTimestampClick(time);
    
    // 対応するタイムスタンプにスクロール
    const index = findNearestTimestamp(time, timestamps);
    if (index !== -1) {
      scrollToTimestamp(index);
    }
  }, [onTimestampClick, timestamps, findNearestTimestamp, scrollToTimestamp]);

  // 現在の再生時間が変わったときに、対応するタイムスタンプにスクロールする
  useEffect(() => {
    if (timestamps.length === 0 || !scrollContainerRef.current) return;
    
    // 現在の再生時間に最も近いタイムスタンプのインデックスを取得
    const nearestIndex = findNearestTimestamp(currentTime, timestamps);
    if (nearestIndex === -1) return;
    
    // 再生時間が大きく変わった場合（ユーザーがタイムスタンプをクリックした場合など）
    // または初回レンダリング時にスクロールする
    const timeDiff = Math.abs(currentTime - prevTimeRef.current);
    const isTimeJump = timeDiff > 5;
    const isClickedTime = lastClickedTimeRef.current !== null && 
                          Math.abs(currentTime - lastClickedTimeRef.current) < 2;
    
    if (isTimeJump || prevTimeRef.current === 0 || isClickedTime) {
      scrollToTimestamp(nearestIndex);
      
      // クリックされたタイムスタンプの時間をリセット
      if (isClickedTime) {
        lastClickedTimeRef.current = null;
      }
    }
    
    // 現在の時間を保存
    prevTimeRef.current = currentTime;
  }, [currentTime, timestamps, findNearestTimestamp, scrollToTimestamp]);

  return (
    <div className="timestamp-list-container bg-card dark:bg-card/95 border-border dark:border-gray-800 select-none w-full rounded-lg overflow-hidden shadow-sm">
      <div 
        ref={scrollContainerRef}
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent bg-gradient-to-b from-card/50 to-card p-2"
        // style={{ maxHeight: '300px' }}
      >
        {timestamps.map((timestamp, index) => {
          // 現在の再生時間に最も近いタイムスタンプを判定
          const isNearest = index === findNearestTimestamp(currentTime, timestamps);
          
          return (
            <div 
              key={`timestamp-${index}`}
              data-timestamp-index={index}
              data-timestamp-time={timestamp.time}
              ref={isNearest ? currentTimestampRef : null}
              className={`
                p-2 rounded cursor-pointer hover:bg-accent/10
                ${isNearest ? 'bg-primary/10 dark:bg-primary/5 text-primary font-medium border-l-2 border-primary' : ''}
              `}
              onClick={() => handleTimestampClick(timestamp.time)}
            >
              <div className="flex items-center justify-between w-full px-[10%]">
                <span className="inline-block w-16 text-sm font-mono text-muted-foreground bg-muted/20 dark:bg-muted/10 rounded px-1 py-0.5 text-center">
                  {timestamp.originalDetectTime || formatTime(timestamp.time)}
                </span>
                
                {/* キャラクターアイコンを表示 */}
                {timestamp.chara1 && timestamp.chara2 && (
                  <div className="flex-shrink-0 ml-4">
                    <CharacterIconPair 
                      {...getCharacterIcons(timestamp.chara1, timestamp.chara2)} 
                      useChara={selectedCharacter}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimestampList; 