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
 * @property {string} [useChara] - 使用キャラクター名（英語）。このキャラクターが左側に表示されます。
 */
interface CharacterIconPairProps {
  icon1: CharacterIcon | null;
  icon2: CharacterIcon | null;
  useChara?: string;
}

/**
 * 2つのキャラクターアイコンを並べて表示するコンポーネント
 * 使用キャラクターが指定されている場合、そのキャラクターが左側に表示されます。
 * 
 * @component
 * @example
 * ```tsx
 * <CharacterIconPair
 *   icon1={ryuIcon}
 *   icon2={kenIcon}
 *   useChara="ryu"
 * />
 * ```
 */
const CharacterIconPair: React.FC<CharacterIconPairProps> = ({ icon1, icon2, useChara }) => {
  // 使用キャラクターが指定されている場合、アイコンの順序を調整
  let leftIcon = icon1;
  let rightIcon = icon2;

  if (useChara && icon1 && icon2) {
    // デバッグ用ログ
    // console.log('CharacterIconPair:', {
    //   useChara,
    //   icon1: icon1.eng,
    //   icon2: icon2.eng,
    //   match1: icon1.eng.toLowerCase() === useChara.toLowerCase(),
    //   match2: icon2.eng.toLowerCase() === useChara.toLowerCase()
    // });

    // 使用キャラクターが2つ目のアイコンの場合、順序を入れ替える
    if (icon2.anotation.some(a => useChara.toLowerCase().includes(a.toLowerCase()))) {
      // console.log('Swapping icons: useChara matches icon2');
      leftIcon = icon2;
      rightIcon = icon1;
      // console.log("leftIcon", leftIcon);
      // console.log("rightIcon", rightIcon);
    } else if (icon1.anotation.some(a => useChara.toLowerCase().includes(a.toLowerCase()))) {
      // console.log('Warning: useChara does not match either icon');
      // leftIcon = icon1;
      // rightIcon = icon2;
    }
  }

  return (
    <div className="flex items-center">
      {/* 左側のアイコン（使用キャラクター優先） */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md overflow-hidden border-2 border-border/80 dark:border-border/60 bg-card shadow-sm">
        {leftIcon ? (
          <img
            src={leftIcon.path}
            alt={leftIcon.jp || leftIcon.eng}
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
      <div className="mx-1 sm:mx-1.5 text-xs sm:text-sm font-bold text-primary/80 dark:text-primary/70 bg-primary/10 dark:bg-primary/5 px-1.5 py-0.5 rounded-full">VS</div>
      
      {/* 右側のアイコン */}
      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-md overflow-hidden border-2 border-border/80 dark:border-border/60 bg-card shadow-sm">
        {rightIcon ? (
          <img
            src={rightIcon.path}
            alt={rightIcon.jp || rightIcon.eng}
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