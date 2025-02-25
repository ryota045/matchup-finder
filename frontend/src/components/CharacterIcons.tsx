import React from 'react';

interface CharacterIconProps {
  onIconClick?: (characterName: string) => void;
}

interface CharacterIcon {
  name: string;
  path: string;
}

const CharacterIcons: React.FC<CharacterIconProps> = ({ onIconClick }) => {
  // 画像のパスを取得し、名前でソート
  const getCharacterIcons = (): CharacterIcon[] => {
    // webpack require.contextの型定義
    const iconContext = (require as any).context(
      '../../../public/images/chara_icon',
      false,
      /\.(png|jpe?g)$/
    );
    
    return iconContext
      .keys()
      .map((key: string) => ({
        name: key.replace('./', '').replace(' 0.png', '').replace('.png', ''),
        path: `/images/chara_icon/${key.replace('./', '')}`
      }))
      .sort((a: CharacterIcon, b: CharacterIcon) => a.name.localeCompare(b.name));
  };

  const icons = getCharacterIcons();

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-[95%] mx-auto py-4">
        <h2 className="text-xl font-bold mb-4 text-center">キャラクター選択</h2>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 min-w-fit">
            {icons.map((icon: CharacterIcon) => (
              <div
                key={icon.name}
                className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 w-16"
                onClick={() => onIconClick?.(icon.name)}
              >
                <div className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg">
                  <img
                    src={icon.path}
                    alt={`${icon.name} icon`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg">
                  <p className="text-white text-xs text-center truncate">
                    {icon.name}
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