/**
 * キャラクター関連のユーティリティ関数
 */

/**
 * キャラクター名が一致するかどうかをチェックする関数
 * @param characterName チェック対象のキャラクター名
 * @param anotations 検索対象のアノテーション（カンマ区切りの文字列）
 * @returns 一致する場合はtrue、しない場合はfalse
 */
export const isCharacterMatched = (
  characterName: string,
  anotations: string
): boolean => {
  // カンマ区切りのanotation値を配列に分割
  const anotationArray = anotations.split(',');
  
  // いずれかのanotation値がcharacterNameに含まれているかチェック
  return anotationArray.some(anotation => {
    // 単語境界でのマッチをチェック
    const regex = new RegExp(`\\b${anotation.toLowerCase()}\\b`);
    
    // 完全一致検索のための特別な処理
    // 例: "tooklink"で検索した場合、"link"にはマッチしないようにする
    if (anotation.toLowerCase() === characterName.toLowerCase()) {
      return true; // 完全一致の場合は即座にtrueを返す
    }
    
    // 部分一致の場合は単語境界でのマッチをチェック
    return regex.test(characterName.toLowerCase());
  });
};

/**
 * 使用キャラクターが一致するかどうかをチェックする関数
 * @param chara1 1人目のキャラクター名
 * @param chara2 2人目のキャラクター名
 * @param selectedCharacter 選択されたキャラクター（カンマ区切りのアノテーション）
 * @returns 一致する場合はtrue、しない場合はfalse
 */
export const isUserCharacterMatched = (
  chara1: string,
  chara2: string,
  selectedCharacter: string
): boolean => {
  // 選択されたキャラクターがない場合は常にtrue
  if (!selectedCharacter) return true;
  
  // カンマ区切りのanotation値を配列に分割
  const anotations = selectedCharacter.split(',');
  
  // 自分対自分の場合（例：RyuvsRyu）の特殊処理
  if (chara1.toLowerCase() === chara2.toLowerCase()) {
    // 選択したキャラクターも同じキャラクターの場合のみマッチ
    return anotations.length === 1 && isCharacterMatched(chara1, selectedCharacter);
  }
  
  // 選択したキャラクターが1つだけで、それが自分対自分の検索の場合
  if (anotations.length === 1) {
    const anotation = anotations[0];
    
    // 選択したキャラクターが自分対自分の検索の場合は、
    // 対戦相手が同じキャラクターの場合のみマッチさせる
    const isCharaSelfMatch = chara1.toLowerCase() === chara2.toLowerCase() && 
                            isCharacterMatched(chara1, anotation);
    
    // 自分対自分の検索でない場合は通常のマッチング
    const isNormalMatch = chara1.toLowerCase() !== chara2.toLowerCase() && 
                         (isCharacterMatched(chara1, anotation) || isCharacterMatched(chara2, anotation));
    
    return isCharaSelfMatch || isNormalMatch;
  }
  
  // 複数のアノテーションがある場合は、いずれかがマッチすればOK
  return anotations.some(anotation => 
    isCharacterMatched(chara1, anotation) || isCharacterMatched(chara2, anotation)
  );
};

/**
 * 対戦キャラクターが一致するかどうかをチェックする関数
 * @param chara1 1人目のキャラクター名
 * @param chara2 2人目のキャラクター名
 * @param selectedCharacters 選択された対戦キャラクター（カンマ区切りのアノテーションの配列）
 * @returns 一致する場合はtrue、しない場合はfalse
 */
export const isOpponentCharactersMatched = (
  chara1: string,
  chara2: string,
  selectedCharacters: string[]
): boolean => {
  // 選択された対戦キャラクターがない場合は常にtrue
  if (!selectedCharacters.length) return true;
  
  // 各対戦キャラクターについて、いずれかのanotation値がchara1またはchara2に含まれているかチェック
  // OR条件: 選択したキャラクターのいずれか1つでも一致すればtrue
  return selectedCharacters.some(char => {
    // charが文字列でない場合は処理をスキップ
    if (typeof char !== 'string') return false;
    
    // カンマ区切りのanotation値を配列に分割
    const anotations = char.split(',');
    
    return anotations.some(anotation => {
      // 自分対自分の場合（例：RyuvsRyu）の特殊処理
      if (chara1.toLowerCase() === chara2.toLowerCase()) {
        // 選択したキャラクターも同じキャラクターの場合のみマッチ
        return anotations.length === 1 && isCharacterMatched(chara1, anotation);
      }
      
      // 選択したキャラクターが1つだけで、それが自分対自分の検索の場合
      if (anotations.length === 1) {
        // 選択したキャラクターが自分対自分の検索の場合は、
        // 対戦相手が同じキャラクターの場合のみマッチさせる
        const isCharaSelfMatch = chara1.toLowerCase() === chara2.toLowerCase() && 
                                isCharacterMatched(chara1, anotation);
        
        // 自分対自分の検索でない場合は通常のマッチング
        const isNormalMatch = chara1.toLowerCase() !== chara2.toLowerCase() && 
                             (isCharacterMatched(chara1, anotation) || isCharacterMatched(chara2, anotation));
        
        return isCharaSelfMatch || isNormalMatch;
      }
      
      return isCharacterMatched(chara1, anotation) || isCharacterMatched(chara2, anotation);
    });
  });
}; 