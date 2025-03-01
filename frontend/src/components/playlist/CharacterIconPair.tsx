import React from 'react';

/**
 * キャラクターアイコンのデータ構造
 * @interface CharacterIcon
 * @property {string} eng - 英語名
 * @property {string} path - アイコン画像のパス
 * @property {string[]} anotation - 代替名のリスト
 */
export interface CharacterIcon {
  eng: string;
  path: string;
  anotation: string[];
}

/**
 * キャラクターアイコンペアコンポーネントのプロパティ
 * @interface CharacterIconPairProps
 * @property {CharacterIcon | null} icon1 - 1つ目のキャラクターアイコン
 * @property {CharacterIcon | null} icon2 - 2つ目のキャラクターアイコン
 */
interface CharacterIconPairProps {
  icon1: CharacterIcon | null;
  icon2: CharacterIcon | null;
}

/**
 * 2つのキャラクターアイコンを対戦形式で表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <CharacterIconPair
 *   icon1={characterIcons.find(c => c.eng === 'ryu')}
 *   icon2={characterIcons.find(c => c.eng === 'ken')}
 * />
 * ```
 */
const CharacterIconPair: React.FC<CharacterIconPairProps> = ({ icon1, icon2 }) => {
  if (!icon1 || !icon2) {
    return <span className="mr-2 text-xs">その他</span>;
  }

  // アルファベット順に並べる
  const sortedIcons = [
    { icon: icon1, eng: icon1.eng },
    { icon: icon2, eng: icon2.eng }
  ].sort((a, b) => a.eng.localeCompare(b.eng));
  
  return (
    <div className="flex items-center mr-2">
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
    </div>
  );
};

export default CharacterIconPair; 