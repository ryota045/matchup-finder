import React, { useState, useRef, useEffect } from 'react';

export interface TimestampItem {
  time: number; // 秒単位
  label: string;
}

interface YouTubeTimestampProps {
  timestamps: TimestampItem[];
  onTimestampClick: (time: number) => void;
  currentTime?: number;
}

const YouTubeTimestamp: React.FC<YouTubeTimestampProps> = ({
  timestamps,
  onTimestampClick,
  currentTime = 0,
}) => {
  // アコーディオンの開閉状態を管理
  const [isOpen, setIsOpen] = useState(true);
  
  // コンテンツの高さを測定するためのref
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

  // 秒を「時:分:秒」形式に変換する関数
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="youtube-timestamp bg-gray-100 rounded overflow-hidden">
      {/* ヘッダー部分（クリックで開閉） */}
      <div 
        className="flex items-center justify-between p-3 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
        aria-label="タイムスタンプを開閉"
      >
        <h3 className="text-lg font-semibold">タイムスタンプ</h3>
        <span 
          className={`text-gray-600 transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </div>

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
              <li 
                key={index}
                className={`
                  p-2 rounded cursor-pointer hover:bg-gray-200 transition-colors
                  ${currentTime >= item.time ? 'text-blue-600 font-medium' : ''}
                `}
                onClick={() => onTimestampClick(item.time)}
                role="button"
                tabIndex={0}
                aria-label={`${formatTime(item.time)} - ${item.label}`}
              >
                <span className="inline-block w-12 text-gray-600">{formatTime(item.time)}</span>
                <span className="ml-2">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default YouTubeTimestamp; 