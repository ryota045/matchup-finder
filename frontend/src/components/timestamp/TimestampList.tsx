import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TimestampItemComponent, { TimestampItem } from './TimestampItem';
import { Timestamp } from '../../types/timestamp';

/**
 * タイムスタンプリストのプロパティ
 * @interface TimestampListProps
 * @property {TimestampItem[]} timestamps - タイムスタンプのリスト
 * @property {number} [currentTime=0] - 現在の再生時間（秒）
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {boolean} [isOpen=true] - リストが開いているかどうか
 */
interface TimestampListProps {
  timestamps: TimestampItem[];
  currentTime?: number;
  onTimestampClick: (time: number) => void;
  isOpen?: boolean;
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
 *   isOpen={true}
 * />
 * ```
 */
const TimestampList: React.FC<TimestampListProps> = ({
  timestamps,
  currentTime = 0,
  onTimestampClick,
  isOpen = true
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  // コンテンツの高さを計算
  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => {
        if (contentRef.current) {
          resizeObserver.unobserve(contentRef.current);
        }
      };
    }
  }, []);

  // ウィンドウのリサイズ時にも高さを再計算
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 現在の再生時間に最も近いタイムスタンプを見つける
  const findActiveTimestamp = () => {
    if (!timestamps.length) return -1;
    
    let activeIndex = -1;
    let minDiff = Number.MAX_SAFE_INTEGER;
    
    timestamps.forEach((timestamp, index) => {
      // 現在の再生時間以下で最も近いタイムスタンプを選択
      if (timestamp.time <= currentTime) {
        const diff = currentTime - timestamp.time;
        if (diff < minDiff) {
          minDiff = diff;
          activeIndex = index;
        }
      }
    });
    
    return activeIndex;
  };
  
  const activeIndex = findActiveTimestamp();

  // タイムスタンプをビデオタイトルでグループ化
  const groupedByTitle: { [title: string]: TimestampItem[] } = {};
  timestamps.forEach(timestamp => {
    const title = timestamp.videoTitle || '不明な動画';
    if (!groupedByTitle[title]) {
      groupedByTitle[title] = [];
    }
    groupedByTitle[title].push(timestamp);
  });

  // タイムスタンプがない場合は、デフォルトのタイムスタンプを作成
  if (timestamps.length === 0) {
    return (
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: height !== "auto" ? height : "auto",
              opacity: 1
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-card dark:bg-card/90"
          >
            <div ref={contentRef} className="p-2">
              <div className="p-4 text-center text-muted-foreground">
                タイムスタンプがありません
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ 
            height: height !== "auto" ? height : "auto",
            opacity: 1
          }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden bg-card dark:bg-card/90"
        >
          <div ref={contentRef} className="p-2">
            <div className="timestamp-list divide-y divide-border">
              {Object.entries(groupedByTitle).map(([title, items]) => (
                <div key={title} className="py-2">
                  <h3 className="text-sm font-medium px-2 py-1 bg-muted/10 rounded mb-1">{title}</h3>
                  <ul>
                    {items.map((timestamp, index) => (
                      <TimestampItemComponent
                        key={`${timestamp.time}-${timestamp.label || "タイムスタンプ"}-${index}`}
                        timestamp={{
                          ...timestamp,
                          label: timestamp.label || "タイムスタンプ"
                        }}
                        isActive={timestamps.indexOf(timestamp) === activeIndex}
                        onClick={onTimestampClick}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimestampList; 