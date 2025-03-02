'use client';

import React, { useState, useRef, useEffect } from 'react';
import CharacterIcons from './CharacterIcons';
import { 
  CharacterIcon, 
  normalizeJapanese, 
  getJapaneseName, 
  filterCharacterIcons,
  characterIcons
} from '../../data/characterData';

// キャラクターの表示用コンポーネント
interface CharacterDisplayProps {
  character: string;
  onRemove: (character: string) => void;
  onClick?: () => void;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ character, onRemove, onClick }) => {
  return (
    <div className="flex items-center space-x-2 bg-card p-2 rounded-md shadow-sm border border-border">
      <div className="w-10 h-10 rounded-md overflow-hidden">
        <img
          src={character === 'Koopalings' 
            ? `/images/chara_icon/Koopalings (Bowser Jr.).png` 
            : `/images/chara_icon/${character} 0.png`}
          alt={character}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            // クッパジュニアの場合は特別な処理
            if (character === 'Koopalings') {
              target.src = `/images/chara_icon/Koopalings (Bowser Jr.).png`;
            } else {
              target.src = `/images/chara_icon/${character}.png`;
            }
          }}
        />
      </div>
      <span className="font-medium">{getJapaneseName(character)}</span>
      <button
        className="ml-1 text-red-500 hover:text-red-700"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(character);
        }}
      >
        ×
      </button>
    </div>
  );
};

// 単一キャラクター選択パネル
interface SingleCharacterPanelProps {
  character: string;
  onClear: () => void;
  onPanelClick: () => void;
}

const SingleCharacterPanel: React.FC<SingleCharacterPanelProps> = ({ 
  character, 
  onClear, 
  onPanelClick 
}) => {
  return (
    <div className="bg-card rounded-lg shadow-md p-4 border border-border">
      <h2 className="text-xl font-bold mb-4">使用キャラクター選択</h2>
      <div 
        className="min-h-16 p-4 bg-muted rounded-md cursor-pointer hover:bg-accent/5"
        onClick={onPanelClick}
      >
        {character ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 rounded-md overflow-hidden">
                <img
                  src={character === 'Koopalings' 
                    ? `/images/chara_icon/Koopalings (Bowser Jr.).png` 
                    : `/images/chara_icon/${character} 0.png`}
                  alt={character}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    // クッパジュニアの場合は特別な処理
                    if (character === 'Koopalings') {
                      target.src = `/images/chara_icon/Koopalings (Bowser Jr.).png`;
                    } else {
                      target.src = `/images/chara_icon/${character}.png`;
                    }
                  }}
                />
              </div>
              <span className="font-medium">{getJapaneseName(character)}</span>
            </div>
            <button
              className="text-red-500 hover:text-red-700 p-2"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-12">
            <p className="text-muted-foreground">キャラクターを選択してください</p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        クリックして1つのキャラクターを選択
      </p>
    </div>
  );
};

// 複数キャラクター選択パネル
interface MultipleCharactersPanelProps {
  characters: string[];
  onRemove: (character: string) => void;
  onPanelClick: () => void;
}

const MultipleCharactersPanel: React.FC<MultipleCharactersPanelProps> = ({ 
  characters, 
  onRemove, 
  onPanelClick 
}) => {
  return (
    <div className="bg-card rounded-lg shadow-md p-4 border border-border">
      <h2 className="text-xl font-bold mb-4">対戦キャラクター選択</h2>
      <div 
        className="min-h-16 p-4 bg-muted rounded-md cursor-pointer hover:bg-accent/5"
        onClick={onPanelClick}
      >
        {characters.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {characters.map(char => (
              <CharacterDisplay 
                key={char} 
                character={char} 
                onRemove={onRemove} 
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-12">
            <p className="text-muted-foreground">キャラクターを選択してください</p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        クリックして複数のキャラクターを選択
      </p>
    </div>
  );
};

// キャラクター選択モーダル
interface CharacterSelectionModalProps {
  isOpen: boolean;
  title: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClose: () => void;
  onCharacterClick: (name: string) => void;
  selectedCharacters: string[];
}

const CharacterSelectionModal: React.FC<CharacterSelectionModalProps> = ({
  isOpen,
  title,
  searchTerm,
  onSearchChange,
  onClose,
  onCharacterClick,
  selectedCharacters
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // モーダル外クリックで閉じる処理を追加
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            className="text-muted-foreground hover:text-foreground p-2"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="p-4 border-b border-border">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="キャラクター名で検索..."
            className="input w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <CharacterIcons
            icons={filterCharacterIcons(characterIcons, searchTerm)}
            onCharacterClick={onCharacterClick}
            selectedCharacters={selectedCharacters}
          />
        </div>
        
        <div className="p-4 border-t border-border flex justify-end">
          <button
            className="btn btn-primary px-8 py-2 text-lg"
            onClick={onClose}
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};

// メインのCharacterSelectorコンポーネント
interface CharacterSelectorProps {
  onSingleCharacterSelect?: (character: string) => void;
  onMultipleCharactersSelect?: (characters: string[]) => void;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  onSingleCharacterSelect,
  onMultipleCharactersSelect
}) => {
  const [singleCharacter, setSingleCharacter] = useState<string>('');
  const [multipleCharacters, setMultipleCharacters] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');
  const [searchTerm, setSearchTerm] = useState('');

  // モーダルが閉じたら検索欄をクリア
  useEffect(() => {
    if (!isModalOpen) {
      setSearchTerm('');
    }
  }, [isModalOpen]);

  // キャラクター選択処理
  const handleSingleCharacterSelect = (characterName: string) => {
    setSingleCharacter(characterName);
    if (onSingleCharacterSelect) {
      setTimeout(() => {
        // キャラクターのanotationフィールドの値をすべて使用
        const character = characterIcons.find(c => c.eng === characterName);
        if (character && character.anotation.length > 0) {
          // anotationフィールドの値をすべて渡す（カンマ区切り）
          const anotationValues = character.anotation.join(',');
          onSingleCharacterSelect(anotationValues);
        } else {
          onSingleCharacterSelect(characterName);
        }
      }, 0);
    }
    setIsModalOpen(false);
  };

  const handleMultipleCharacterSelect = (characterName: string) => {
    setMultipleCharacters(prev => {
      // すでに選択されている場合は削除、そうでなければ追加
      if (prev.includes(characterName)) {
        const newSelection = prev.filter(char => char !== characterName);
        notifyMultipleSelectionChange(newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, characterName];
        notifyMultipleSelectionChange(newSelection);
        return newSelection;
      }
    });
  };

  // 複数選択の変更を通知
  const notifyMultipleSelectionChange = (selection: string[]) => {
    if (onMultipleCharactersSelect) {
      // レンダリング後に実行するようにする
      setTimeout(() => {
        // 選択されたキャラクターのanotationフィールドの値をすべて使用
        const anotationValues = selection.map(char => {
          const character = characterIcons.find(c => c.eng === char);
          if (character && character.anotation.length > 0) {
            // anotationフィールドの値をすべて渡す（カンマ区切り）
            return character.anotation.join(',');
          }
          return char;
        });
        // 各要素が文字列であることを確認
        const safeValues = anotationValues.map(val => String(val));
        onMultipleCharactersSelect(safeValues);
      }, 0);
    }
  };

  const handleCharacterClick = (characterName: string) => {
    if (selectionMode === 'single') {
      handleSingleCharacterSelect(characterName);
    } else {
      handleMultipleCharacterSelect(characterName);
    }
  };

  const clearSingleSelection = () => {
    setSingleCharacter('');
    if (onSingleCharacterSelect) {
      // レンダリング後に実行するようにする
      setTimeout(() => {
        onSingleCharacterSelect('');
      }, 0);
    }
  };

  const clearMultipleSelection = () => {
    setMultipleCharacters([]);
    if (onMultipleCharactersSelect) {
      // レンダリング後に実行するようにする
      setTimeout(() => {
        // 空の文字列配列を渡す
        onMultipleCharactersSelect([]);
      }, 0);
    }
  };

  const openModalForSingle = () => {
    setSelectionMode('single');
    setIsModalOpen(true);
  };

  const openModalForMultiple = () => {
    setSelectionMode('multiple');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 単一キャラクター選択パネル */}
        <SingleCharacterPanel
          character={singleCharacter}
          onClear={clearSingleSelection}
          onPanelClick={openModalForSingle}
        />

        {/* 複数キャラクター選択パネル */}
        <MultipleCharactersPanel
          characters={multipleCharacters}
          onRemove={handleMultipleCharacterSelect}
          onPanelClick={openModalForMultiple}
        />
      </div>

      {/* クリアボタン */}
      <div className="flex justify-end space-x-4">
        <button
          className="btn btn-outline"
          onClick={clearSingleSelection}
          disabled={!singleCharacter}
        >
          使用キャラクターをクリア
        </button>
        <button
          className="btn btn-outline"
          onClick={clearMultipleSelection}
          disabled={multipleCharacters.length === 0}
        >
          対戦キャラクターをクリア
        </button>
      </div>

      {/* キャラクター選択モーダル */}
      <CharacterSelectionModal
        isOpen={isModalOpen}
        title={selectionMode === 'single' ? '使用キャラクター選択' : '対戦キャラクター選択'}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClose={closeModal}
        onCharacterClick={handleCharacterClick}
        selectedCharacters={selectionMode === 'single' ? [singleCharacter] : multipleCharacters}
      />
    </div>
  );
};

export default CharacterSelector; 