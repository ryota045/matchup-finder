import React, { useState, useEffect } from 'react';
import { characterIcons } from '../../data/characterData';
import { AccordionHeader } from '../ui/Accordion';
import TimestampList from './TimestampList';
import Playlist from '../playlist/Playlist';
import { TimestampItem } from './TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';
import { CharacterIcon } from '../playlist/CharacterIconPair';

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
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});
  
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

  return (
    <div className="youtube-timestamp-container">
      {videos.length > 0 && (
        <Playlist
          videos={videos}
          groupedVideos={groupedVideos}
          expandedDirectories={expandedDirectories}
          expandedGroups={expandedGroups}
          isOpen={isOpen}
          toggleDirectoryAccordion={toggleDirectoryAccordion}
          toggleAccordion={toggleAccordion}
          selectedVideoIndex={selectedVideoIndex}
          onVideoSelect={onVideoSelect || (() => {})}
          getCharacterGroupedVideos={getCharacterGroupedVideos}
          setIsOpen={setIsOpen}
        />
      )}
      
      {timestamps.length > 0 && (
        <div className="youtube-timestamp bg-gray-100 rounded overflow-hidden">
          <AccordionHeader
            title="タイムスタンプ"
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
      )}
    </div>
  );
};

export default YouTubeTimestamp; 