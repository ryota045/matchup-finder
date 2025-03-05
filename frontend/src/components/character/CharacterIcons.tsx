import React, { useEffect, useState } from 'react';
import { CharacterIcon } from '../../data/characterData';

// 個別のキャラクターアイコンコンポーネント
interface SingleCharacterIconProps {
  icon: CharacterIcon;
  isSelected: boolean;
  onClick: () => void;
  width: number;
}

const SingleCharacterIcon: React.FC<SingleCharacterIconProps> = ({ 
  icon, 
  isSelected, 
  onClick,
  width
}) => {
  return (
    <div
      style={{ width: `${width}px` }}
      className={`relative group cursor-pointer transition-transform duration-200 hover:scale-105 ${
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
  const [iconWidth, setIconWidth] = useState(64); // デフォルト値
  const gap = 8; // gap-2 = 8px
  
  useEffect(() => {
    const updateIconWidth = () => {
      const container = document.getElementById('character-icons-container');
      if (container) {
        const containerWidth = container.clientWidth - 16; // p-2の分を引く (8px * 2)
        if (containerWidth > 0) {
          // 最適なアイコン数を計算
          // 最小幅は56px、最大幅は64pxとする
          const minIconWidth = 56;
          const maxIconWidth = 64;
          
          // コンテナ内に収まるアイコン数を計算
          const maxIcons = Math.floor((containerWidth + gap) / (minIconWidth + gap));
          
          // アイコン1つあたりの最適な幅を計算
          let optimalWidth = Math.floor((containerWidth - (maxIcons - 1) * gap) / maxIcons);
          
          // 最小・最大幅の制約を適用
          optimalWidth = Math.min(Math.max(optimalWidth, minIconWidth), maxIconWidth);
          
          setIconWidth(optimalWidth);
        }
      }
    };
    
    updateIconWidth();
    window.addEventListener('resize', updateIconWidth);
    return () => window.removeEventListener('resize', updateIconWidth);
  }, [icons.length]);
  
  return (
    <div className="bg-card/95 rounded-lg">
      <div className="max-w-full mx-auto">
        <div className="overflow-x-auto overflow-y-hidden">
          <div id="character-icons-container" className="flex flex-wrap gap-2 p-2">         
            {icons.map((icon: CharacterIcon) => (
              <SingleCharacterIcon
                key={icon.eng}
                icon={icon}
                isSelected={selectedCharacters.includes(icon.eng)}
                onClick={() => onCharacterClick(icon.eng)}
                width={iconWidth}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterIcons; 