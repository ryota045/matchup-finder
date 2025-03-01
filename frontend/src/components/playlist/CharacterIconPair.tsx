import React from 'react';

/**
 * キャラクターアイコンのデータ構造
 * @interface CharacterIcon
 * @property {string} eng - 英語名
 * @property {string} jp - 日本語名
 * @property {string[]} anotation - 検索用の別名リスト
 * @property {string} path - アイコン画像のパス
 */
export interface CharacterIcon {
  eng: string;
  jp: string;
  anotation: string[];
  path: string;
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
 * 2つのキャラクターアイコンを並べて表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <CharacterIconPair
 *   icon1={ryuIcon}
 *   icon2={kenIcon}
 * />
 * ```
 */
const CharacterIconPair: React.FC<CharacterIconPairProps> = ({ icon1, icon2 }) => {
  return (
    <div className="flex items-center mr-2">
      {/* 1つ目のアイコン */}
      <div className="w-8 h-8 rounded-md overflow-hidden border border-border bg-card">
        {icon1 ? (
          <img
            src={icon1.path}
            alt={icon1.jp || icon1.eng}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            <span className="text-xs">?</span>
          </div>
        )}
      </div>
      
      {/* VS表示 */}
      <div className="mx-1 text-xs font-medium text-muted-foreground">VS</div>
      
      {/* 2つ目のアイコン */}
      <div className="w-8 h-8 rounded-md overflow-hidden border border-border bg-card">
        {icon2 ? (
          <img
            src={icon2.path}
            alt={icon2.jp || icon2.eng}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            <span className="text-xs">?</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterIconPair; 