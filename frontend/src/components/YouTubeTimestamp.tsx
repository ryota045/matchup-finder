import React, { useState, useRef, useEffect } from 'react';
import { characterIcons } from '../data/characterData';

export interface TimestampItem {
  time: number; // 秒単位
  label: string;
}

export interface MatchupVideo {
  url: string;
  timestamps: TimestampItem[];
  title: string;
  matchupKey: string;
  directory: string;
  chara1: string;
  chara2: string;
}

interface YouTubeTimestampProps {
  timestamps: TimestampItem[];
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  videos?: MatchupVideo[];
  onVideoSelect?: (videoIndex: number) => void;
  selectedVideoIndex?: number;
}

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
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});
  
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

  // キャラクターアイコンの組み合わせごとにビデオをグループ化する関数
  const getCharacterGroupedVideos = (videos: MatchupVideo[]) => {
    const charGroups: {[key: string]: {icon1: any, icon2: any, videos: MatchupVideo[]}} = {};
    
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
  
  // アコーディオンの開閉を切り替える関数
  const toggleAccordion = (directory: string, charKey: string) => {
    // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
    const uniqueKey = `${directory}-${charKey}`;
    setExpandedGroups(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey]
    }));
  };
  
  // ディレクトリアコーディオンの開閉を切り替える関数
  const toggleDirectoryAccordion = (directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  };

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

  // プレイリスト表示
  const renderPlaylist = () => {
    if (videos.length === 0) return null;
    
    return (
      <div className="bg-gray-100 rounded overflow-hidden mb-4">
        <div 
          className="flex items-center justify-between p-3 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          role="button"
          tabIndex={0}
          aria-label="プレイリストを開閉"
        >
          <h3 className="text-lg font-semibold">プレイリスト ({videos.length}件)</h3>
          <span 
            className={`text-gray-600 transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            aria-hidden="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        
        <div 
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
            {Object.entries(groupedVideos).map(([directory, directoryVideos]) => (
              <div key={directory} className="mb-2 border rounded-md overflow-hidden mx-2 my-2">
                {/* ディレクトリアコーディオンヘッダー */}
                <button
                  className="w-full flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => toggleDirectoryAccordion(directory)}
                >
                  <h4 className="font-medium text-gray-700 text-sm">{directory}</h4>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${expandedDirectories[directory] ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {/* ディレクトリアコーディオンコンテンツ */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-y-auto ${
                    expandedDirectories[directory] ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="space-y-2">
                    {Object.entries(getCharacterGroupedVideos(directoryVideos)).map(([charKey, group]) => {
                      // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
                      const uniqueKey = `${directory}-${charKey}`;
                      const isExpanded = expandedGroups[uniqueKey] || false;
                      const totalTimestamps = group.videos.reduce((sum, video) => sum + video.timestamps.length, 0);
                      
                      return (
                        <div key={`${directory}-${charKey}`} className="border rounded-md overflow-hidden mx-2 my-2">
                          {/* アコーディオンヘッダー */}
                          <button
                            className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                            onClick={() => toggleAccordion(directory, charKey)}
                          >
                            <div className="flex items-center">
                              {/* キャラクターアイコン */}
                              {group.icon1 && group.icon2 ? (
                                <div className="flex items-center mr-2">
                                  {(() => {
                                    // アルファベット順に並べる
                                    const sortedIcons = [
                                      { icon: group.icon1, eng: group.icon1.eng },
                                      { icon: group.icon2, eng: group.icon2.eng }
                                    ].sort((a, b) => a.eng.localeCompare(b.eng));
                                    
                                    return (
                                      <>
                                        <img 
                                          src={sortedIcons[0].icon.path} 
                                          alt={sortedIcons[0].icon.eng} 
                                          className="w-5 h-5 rounded-full mr-1"
                                        />
                                        <span className="mx-1 text-xs">vs</span>
                                        <img 
                                          src={sortedIcons[1].icon.path} 
                                          alt={sortedIcons[1].icon.eng} 
                                          className="w-5 h-5 rounded-full"
                                        />
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : (
                                <span className="mr-2 text-xs">その他</span>
                              )}
                              <span className="text-xs text-gray-500">
                                {group.videos.length}件 ({totalTimestamps}タイムスタンプ)
                              </span>
                            </div>
                            <svg 
                              className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                          
                          {/* 動画リスト */}
                          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="space-y-1 p-2">
                              {group.videos.map((video, videoIndex) => {
                                // 全体の動画リスト（親コンポーネントから渡されたvideos）から正確なインデックスを検索
                                const videoIndexInAllVideos = videos.findIndex(v => 
                                  v.url === video.url && 
                                  v.matchupKey === video.matchupKey && 
                                  v.directory === video.directory
                                );
                                
                                const isSelected = videoIndexInAllVideos === selectedVideoIndex;
                                
                                return (
                                  <div 
                                    key={`${video.directory}-${video.matchupKey}-${videoIndex}-${video.url}`}
                                    className={`p-2 rounded cursor-pointer transition-colors ${
                                      isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : 'hover:bg-gray-100'
                                    }`}
                                    onClick={() => {
                                      console.log('動画選択: インデックス', videoIndexInAllVideos, 'を選択');
                                      console.log('選択した動画:', video.title, video.directory, video.url);
                                      if (onVideoSelect && videoIndexInAllVideos !== -1) {
                                        onVideoSelect(videoIndexInAllVideos);
                                      }
                                    }}
                                  >
                                    <div className="text-sm font-medium mb-1 truncate">{video.title || video.matchupKey}</div>
                                    <div className="text-xs text-gray-500">{video.timestamps.length} タイムスタンプ</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // タイムスタンプ表示
  const renderTimestamps = () => {
    if (timestamps.length === 0) return null;
    
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
            className={`text-gray-600 transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
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

  return (
    <div className="youtube-timestamp-container">
      {videos.length > 0 && renderPlaylist()}
      {timestamps.length > 0 && renderTimestamps()}
    </div>
  );
};

export default YouTubeTimestamp; 