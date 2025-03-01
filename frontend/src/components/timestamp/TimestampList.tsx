import React, { useRef, useState, useEffect } from 'react';
import TimestampItemComponent, { TimestampItem } from './TimestampItem';

/**
 * タイムスタンプリストコンポーネントのプロパティ
 * @interface TimestampListProps
 * @property {TimestampItem[]} timestamps - タイムスタンプのリスト
 * @property {number} currentTime - 現在の再生時間（秒）
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {boolean} isOpen - リストが開いているかどうか
 */
interface TimestampListProps {
  timestamps: TimestampItem[];
  currentTime: number;
  onTimestampClick: (time: number) => void;
  isOpen: boolean;
}

/**
 * タイムスタンプのリストを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <TimestampList
 *   timestamps={[
 *     { time: 0, label: "イントロ" },
 *     { time: 30, label: "サビ" }
 *   ]}
 *   currentTime={15}
 *   onTimestampClick={handleTimestampClick}
 *   isOpen={true}
 * />
 * ```
 */
const TimestampList: React.FC<TimestampListProps> = ({
  timestamps,
  currentTime,
  onTimestampClick,
  isOpen
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  
  // コンポーネントがマウントされたとき、またはタイムスタンプが変更されたときに高さを計算
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [timestamps]);

  // ウィンドウのリサイズ時にも高さを再計算
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (timestamps.length === 0) return null;

  return (
    <div className="youtube-timestamp bg-gray-100 rounded overflow-hidden">
      {/* タイムスタンプリスト（アニメーション付き開閉） */}
      <div 
        ref={contentRef}
        className="transition-all duration-500 ease-in-out overflow-hidden"
        style={{ 
          maxHeight: isOpen ? (contentHeight ? `${contentHeight}px` : '250px') : '0',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
          transformOrigin: 'top'
        }}
      >
        <div className="p-3 max-h-[250px] overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {timestamps.map((item, index) => (
              <TimestampItemComponent
                key={index}
                timestamp={item}
                isActive={currentTime >= item.time}
                onClick={onTimestampClick}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimestampList; 