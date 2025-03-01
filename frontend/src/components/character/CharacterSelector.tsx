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
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">使用キャラクター選択</h2>
          <div 
            className="min-h-16 p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
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
                <p className="text-gray-500">キャラクターを選択してください</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            クリックして1つのキャラクターを選択
          </p>
        </div>

        {/* 複数キャラクター選択欄 */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-4">対戦キャラクター選択</h2>
          <div 
            className="min-h-16 p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={openModalForMultiple}
          >
            {multipleCharacters.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {multipleCharacters.map(char => (
                  <div key={char} className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm">
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
                <button
                  className="bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearMultipleSelection();
                  }}
                >
                  すべてクリア
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-12">
                <p className="text-gray-500">キャラクターを選択してください</p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            クリックして複数のキャラクターを選択
          </p>
        </div>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectionMode === 'single' ? '使用キャラクター選択' : '対戦キャラクター選択'}
                </h2>
                <div className="flex items-center space-x-2">
                  {selectionMode === 'multiple' && multipleCharacters.length > 0 && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {multipleCharacters.length}キャラクター選択中
                    </span>
                  )}
                  <button
                    className="text-gray-500 hover:text-gray-700 p-2"
                    onClick={closeModal}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* 検索欄 */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="キャラクター名で検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="p-4">
              {/* 選択中のキャラクター表示（複数選択モードのみ） */}
              {selectionMode === 'multiple' && multipleCharacters.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <h3 className="font-semibold text-sm text-blue-800 mb-2">選択中のキャラクター:</h3>
                  <div className="flex flex-wrap gap-2">
                    {multipleCharacters.map(char => (
                      <div key={char} className="flex items-center space-x-1 bg-white p-1 rounded-md shadow-sm">
                        <div className="w-8 h-8 rounded-md overflow-hidden">
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
                        <span className="text-sm font-medium">{getJapaneseName(char)}</span>
                        <button
                          className="ml-1 text-red-500 hover:text-red-700"
                          onClick={() => handleMultipleCharacterSelect(char)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* カスタムCharacterIconsコンポーネント */}
              <CharacterIcons 
                onIconClick={handleCharacterClick} 
                selectedCharacter={selectionMode === 'single' ? singleCharacter : undefined}
                searchTerm={searchTerm}
              />
            </div>
            
            <div className="p-4 border-t sticky bottom-0 bg-white flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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