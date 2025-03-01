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
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // モーダル外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // モーダルが開いたら検索欄にフォーカス
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      // モーダルが閉じたら検索欄をクリア
      setSearchTerm('');
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

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
        if (onMultipleCharactersSelect) {
          // レンダリング後に実行するようにする
          setTimeout(() => {
            // 選択されたキャラクターのanotationフィールドの値をすべて使用
            const anotationValues = newSelection.map(char => {
              const character = characterIcons.find(c => c.eng === char);
              if (character && character.anotation.length > 0) {
                // anotationフィールドの値をすべて渡す（カンマ区切り）
                return character.anotation.join(',');
              }
              return char;
            });
            onMultipleCharactersSelect(anotationValues);
          }, 0);
        }
        return newSelection;
      } else {
        const newSelection = [...prev, characterName];
        if (onMultipleCharactersSelect) {
          // レンダリング後に実行するようにする
          setTimeout(() => {
            // 選択されたキャラクターのanotationフィールドの値をすべて使用
            const anotationValues = newSelection.map(char => {
              const character = characterIcons.find(c => c.eng === char);
              if (character && character.anotation.length > 0) {
                // anotationフィールドの値をすべて渡す（カンマ区切り）
                return character.anotation.join(',');
              }
              return char;
            });
            onMultipleCharactersSelect(anotationValues);
          }, 0);
        }
        return newSelection;
      }
    });
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
        {/* 単一キャラクター選択欄 */}
        <div className="bg-card rounded-lg shadow-md p-4 border border-border">
          <h2 className="text-xl font-bold mb-4">使用キャラクター選択</h2>
          <div 
            className="min-h-16 p-4 bg-muted rounded-md cursor-pointer hover:bg-accent/5"
            onClick={openModalForSingle}
          >
            {singleCharacter ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 rounded-md overflow-hidden">
                    <img
                      src={singleCharacter === 'Koopalings' 
                        ? `/images/chara_icon/Koopalings (Bowser Jr.).png` 
                        : `/images/chara_icon/${singleCharacter} 0.png`}
                      alt={singleCharacter}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        // クッパジュニアの場合は特別な処理
                        if (singleCharacter === 'Koopalings') {
                          target.src = `/images/chara_icon/Koopalings (Bowser Jr.).png`;
                        } else {
                          target.src = `/images/chara_icon/${singleCharacter}.png`;
                        }
                      }}
                    />
                  </div>
                  <span className="font-medium">{getJapaneseName(singleCharacter)}</span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 p-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSingleSelection();
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

        {/* 複数キャラクター選択欄 */}
        <div className="bg-card rounded-lg shadow-md p-4 border border-border">
          <h2 className="text-xl font-bold mb-4">対戦キャラクター選択</h2>
          <div 
            className="min-h-16 p-4 bg-muted rounded-md cursor-pointer hover:bg-accent/5"
            onClick={openModalForMultiple}
          >
            {multipleCharacters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {multipleCharacters.map(char => (
                  <div key={char} className="flex items-center space-x-2 bg-card p-2 rounded-md shadow-sm border border-border">
                    <div className="w-10 h-10 rounded-md overflow-hidden">
                      <img
                        src={char === 'Koopalings' 
                          ? `/images/chara_icon/Koopalings (Bowser Jr.).png` 
                          : `/images/chara_icon/${char} 0.png`}
                        alt={char}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          // クッパジュニアの場合は特別な処理
                          if (char === 'Koopalings') {
                            target.src = `/images/chara_icon/Koopalings (Bowser Jr.).png`;
                          } else {
                            target.src = `/images/chara_icon/${char}.png`;
                          }
                        }}
                      />
                    </div>
                    <span className="font-medium">{getJapaneseName(char)}</span>
                    <button
                      className="ml-1 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMultipleCharacterSelect(char);
                      }}
                    >
                      ×
                    </button>
                  </div>
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
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectionMode === 'single' ? '使用キャラクター選択' : '対戦キャラクター選択'}
              </h2>
              <button
                className="text-muted-foreground hover:text-foreground p-2"
                onClick={closeModal}
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <CharacterIcons
                icons={filterCharacterIcons(characterIcons, searchTerm)}
                onCharacterClick={handleCharacterClick}
                selectedCharacters={selectionMode === 'single' ? [singleCharacter] : multipleCharacters}
              />
            </div>
            
            <div className="p-4 border-t border-border flex justify-end">
              <button
                className="btn btn-primary"
                onClick={closeModal}
              >
                完了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelector; 