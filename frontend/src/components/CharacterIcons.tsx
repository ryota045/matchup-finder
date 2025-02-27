import React from 'react';
import Image from 'next/image';
import { 
  CharacterIcon, 
  normalizeJapanese, 
  getSortedCharacterIcons, 
  filterCharacterIcons 
} from '../data/characterData';

export interface CharacterIconProps {
  onIconClick?: (name: string) => void;
  selectedCharacter?: string;
  searchTerm?: string;
}

const CharacterIcons: React.FC<CharacterIconProps> = ({ onIconClick, selectedCharacter, searchTerm = '' }) => {
  // 検索フィルタリング
  const filteredIcons = filterCharacterIcons(searchTerm);

  return (
    <div className="bg-white/95 rounded-lg">
      <div className="max-w-full mx-auto">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-12 gap-2 min-w-fit">
            {filteredIcons.map((icon: CharacterIcon) => (
              <div
                key={icon.eng}
                className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 w-16"
                onClick={() => onIconClick?.(icon.eng)}
              >
                <div className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg">
                  <img
                    src={icon.path}
                    alt={`${icon.eng} icon`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg">
                  <p className="text-white text-xs text-center truncate">
                    {icon.jp || icon.eng}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterIcons; 