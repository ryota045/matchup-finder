import React from 'react';
import { CharacterIcon } from '../../data/characterData';

// 個別のキャラクターアイコンコンポーネント
interface SingleCharacterIconProps {
  icon: CharacterIcon;
  isSelected: boolean;
  onClick: () => void;
}

const SingleCharacterIcon: React.FC<SingleCharacterIconProps> = ({ 
  icon, 
  isSelected, 
  onClick 
}) => {
  return (
    <div
      className={`relative group cursor-pointer transition-transform duration-200 hover:scale-105 w-16 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
      }`}
      onClick={onClick}
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
  );
};

export interface CharacterIconProps {
  icons: CharacterIcon[];
  onCharacterClick: (name: string) => void;
  selectedCharacters: string[];
}

const CharacterIcons: React.FC<CharacterIconProps> = ({ 
  icons, 
  onCharacterClick, 
  selectedCharacters = [] 
}) => {
  return (
    <div className="bg-card/95 rounded-lg">
      <div className="max-w-full mx-auto">
        <div className="overflow-x-auto overflow-y-hidden">
          <div className="grid grid-cols-3 gap-2 min-w-fit auto-rows-auto p-2
                          xs:grid-cols-4 
                          sm:grid-cols-6 
                          md:grid-cols-8 
                          lg:grid-cols-10 
                          xl:grid-cols-12">
            {icons.map((icon: CharacterIcon) => (
              <SingleCharacterIcon
                key={icon.eng}
                icon={icon}
                isSelected={selectedCharacters.includes(icon.eng)}
                onClick={() => onCharacterClick(icon.eng)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterIcons; 