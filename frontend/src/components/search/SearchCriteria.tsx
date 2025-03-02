import React from 'react';
import CharacterSelector from '../character/CharacterSelector';

/**
 * 検索条件コンポーネントのプロパティ
 */
interface SearchCriteriaProps {
  onCharacterSelect: (character: string) => void;
  onOpponentCharacterSelect: (character: string[]) => void;
}

/**
 * 検索条件を表示・編集するコンポーネント
 * 
 * @component
 */
const SearchCriteriaComponent: React.FC<SearchCriteriaProps> = ({
  onCharacterSelect,
  onOpponentCharacterSelect
}) => {
  return (
    <div className="mb-2 px-4 pt-4 pb-2 bg-card rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">検索条件</h2>
      
      <div className="grid grid-cols-1 gap-4">
        {/* 使用キャラクター選択 */}
        <CharacterSelector
          onSingleCharacterSelect={onCharacterSelect}
          onMultipleCharactersSelect={onOpponentCharacterSelect}
        />
      </div>
    </div>
  );
};

export default SearchCriteriaComponent; 