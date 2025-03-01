import React from 'react';
import { TimestampItem } from './TimestampItem';
import CharacterIconPair, { CharacterIcon } from '../playlist/CharacterIconPair';
import { characterIcons } from '../../data/characterData';
import { formatTime } from '../utils/YouTubeUtils';

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
      characterIcons.find(c => c.eng.toLowerCase() === selectedCharacter.toLowerCase()) : null;
    
    // 選択されたキャラクターが存在し、character2と一致する場合はswapする
    if (selectedCharacterIcon && character2 && 
        selectedCharacterIcon.eng === character2.eng && 
        character1) {
      // character1とcharacter2を入れ替える
      return { icon1: character2, icon2: character1 };
    }
    
    return { icon1: character1 || null, icon2: character2 || null };
  };

  return (
    <div className="timestamp-list-container bg-card dark:bg-card/95 border-border dark:border-gray-800">
      <div className="p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {timestamps.map((timestamp, index) => (
          <div 
            key={`timestamp-${index}`}
            className={`
              p-2 rounded cursor-pointer hover:bg-accent/10
              ${timestamp.time === currentTime ? 'bg-primary/10 dark:bg-primary/5 text-primary font-medium border-l-2 border-primary' : ''}
            `}
            onClick={() => onTimestampClick(timestamp.time)}
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
  );
};

export default TimestampList; 