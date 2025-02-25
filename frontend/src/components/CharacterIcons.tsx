import React from 'react';
import Image from 'next/image';

interface CharacterIconProps {
  onIconClick?: (characterName: string) => void;
}

interface CharacterIcon {
  name: string;
  path: string;
}

const CharacterIcons: React.FC<CharacterIconProps> = ({ onIconClick }) => {
  // 静的に定義したキャラクターアイコンのリスト
  const characterIcons: CharacterIcon[] = [
    { name: 'Banjo & Kazooie', path: '/images/chara_icon/Banjo & Kazooie 0.png' },
    { name: 'Bayonetta', path: '/images/chara_icon/Bayonetta 0.png' },
    { name: 'Bowser', path: '/images/chara_icon/Bowser 0.png' },
    { name: 'Byleth', path: '/images/chara_icon/Byleth 0.png' },
    { name: 'Captain Falcon', path: '/images/chara_icon/Captain Falcon 0.png' },
    // { name: 'Charizard', path: '/images/chara_icon/Charizard 0.png' },
    { name: 'Chrom', path: '/images/chara_icon/Chrom 0.png' },
    { name: 'Cloud', path: '/images/chara_icon/Cloud 0.png' },
    { name: 'Corrin', path: '/images/chara_icon/Corrin 0.png' },
    { name: 'Daisy', path: '/images/chara_icon/Daisy 0.png' },
    { name: 'Dark Pit', path: '/images/chara_icon/Dark Pit 0.png' },
    { name: 'Dark Samus', path: '/images/chara_icon/Dark Samus 0.png' },
    { name: 'Diddy Kong', path: '/images/chara_icon/Diddy Kong 0.png' },
    { name: 'Donkey Kong', path: '/images/chara_icon/Donkey Kong 0.png' },
    { name: 'Dr. Mario', path: '/images/chara_icon/Dr. Mario 0.png' },
    { name: 'Duck Hunt', path: '/images/chara_icon/Duck Hunt 0.png' },
    { name: 'Falco', path: '/images/chara_icon/Falco 0.png' },
    { name: 'Fox', path: '/images/chara_icon/Fox 0.png' },
    { name: 'Ganondorf', path: '/images/chara_icon/Ganondorf 0.png' },
    { name: 'Greninja', path: '/images/chara_icon/Greninja 0.png' },
    { name: 'Hero', path: '/images/chara_icon/Hero 0.png' },
    { name: 'Ice Climbers', path: '/images/chara_icon/Ice Climbers 0.png' },
    { name: 'Ike', path: '/images/chara_icon/Ike 0.png' },
    { name: 'Incineroar', path: '/images/chara_icon/Incineroar 0.png' },
    { name: 'Inkling', path: '/images/chara_icon/Inkling 0.png' },
    { name: 'Isabelle', path: '/images/chara_icon/Isabelle 0.png' },
    // { name: 'Ivysaur', path: '/images/chara_icon/Ivysaur 0.png' },
    { name: 'Jigglypuff', path: '/images/chara_icon/Jigglypuff 0.png' },
    { name: 'Joker', path: '/images/chara_icon/Joker 0.png' },
    { name: 'Kazuya', path: '/images/chara_icon/Kazuya 0.png' },
    { name: 'Ken', path: '/images/chara_icon/Ken 0.png' },
    { name: 'King Dedede', path: '/images/chara_icon/King Dedede 0.png' },
    { name: 'King K. Rool', path: '/images/chara_icon/King K. Rool 0.png' },
    { name: 'Kirby', path: '/images/chara_icon/Kirby 0.png' },
    { name: 'Koopalings', path: '/images/chara_icon/Koopalings (Bowser Jr.).png' },
    { name: 'Link', path: '/images/chara_icon/Link 0.png' },
    { name: 'Little Mac', path: '/images/chara_icon/Little Mac 0.png' },
    { name: 'Lucario', path: '/images/chara_icon/Lucario 0.png' },
    { name: 'Lucas', path: '/images/chara_icon/Lucas 0.png' },
    { name: 'Lucina', path: '/images/chara_icon/Lucina 0.png' },
    { name: 'Luigi', path: '/images/chara_icon/Luigi 0.png' },
    { name: 'Mario', path: '/images/chara_icon/Mario 0.png' },
    { name: 'Marth', path: '/images/chara_icon/Marth 0.png' },
    { name: 'Mega Man', path: '/images/chara_icon/Mega Man 0.png' },
    { name: 'Meta Knight', path: '/images/chara_icon/Meta Knight 0.png' },
    { name: 'Mewtwo', path: '/images/chara_icon/Mewtwo 0.png' },
    { name: 'Mii Brawler', path: '/images/chara_icon/Mii Brawler.png' },
    { name: 'Mii Gunner', path: '/images/chara_icon/Mii Gunner.png' },
    { name: 'Mii Swordfighter', path: '/images/chara_icon/Mii Swordfighter.png' },
    { name: 'Min Min', path: '/images/chara_icon/Min Min 0.png' },
    { name: 'Minecraft', path: '/images/chara_icon/Minecraft 0.png' },
    { name: 'Mr. Game & Watch', path: '/images/chara_icon/Mr. Game & Watch 0.png' },
    { name: 'Mythra', path: '/images/chara_icon/Mythra 0.png' },
    { name: 'Ness', path: '/images/chara_icon/Ness 0.png' },
    { name: 'Pac-Man', path: '/images/chara_icon/Pac-Man 0.png' },
    { name: 'Palutena', path: '/images/chara_icon/Palutena 0.png' },
    { name: 'Peach', path: '/images/chara_icon/Peach 0.png' },
    { name: 'Pichu', path: '/images/chara_icon/Pichu 0.png' },
    { name: 'Pikachu', path: '/images/chara_icon/Pikachu 0.png' },
    { name: 'Pikmin', path: '/images/chara_icon/Pikmin 0.png' },
    { name: 'Piranha Plant', path: '/images/chara_icon/Piranha Plant 0.png' },
    { name: 'Pit', path: '/images/chara_icon/Pit 0.png' },
    { name: 'Pokémon Trainer', path: '/images/chara_icon/Pokémon Trainer 0.png' },
    { name: 'Pyra', path: '/images/chara_icon/Pyra 0.png' },
    { name: 'R.O.B.', path: '/images/chara_icon/R.O.B. 0.png' },
    { name: 'Richter', path: '/images/chara_icon/Richter 0.png' },
    { name: 'Ridley', path: '/images/chara_icon/Ridley 0.png' },
    { name: 'Robin', path: '/images/chara_icon/Robin 0.png' },
    { name: 'Rosalina & Luma', path: '/images/chara_icon/Rosalina & Luma 0.png' },
    { name: 'Roy', path: '/images/chara_icon/Roy 0.png' },
    { name: 'Ryu', path: '/images/chara_icon/Ryu 0.png' },
    { name: 'Samus', path: '/images/chara_icon/Samus 0.png' },
    { name: 'Sephiroth', path: '/images/chara_icon/Sephiroth 0.png' },
    { name: 'Sheik', path: '/images/chara_icon/Sheik 0.png' },
    { name: 'Shulk', path: '/images/chara_icon/Shulk 0.png' },
    { name: 'Simon', path: '/images/chara_icon/Simon 0.png' },
    { name: 'Snake', path: '/images/chara_icon/Snake 0.png' },
    { name: 'Sonic', path: '/images/chara_icon/Sonic 0.png' },
    { name: 'Sora', path: '/images/chara_icon/Sora 0.png' },
    // { name: 'Squirtle', path: '/images/chara_icon/Squirtle 0.png' },
    { name: 'Terry', path: '/images/chara_icon/Terry 0.png' },
    { name: 'Toon Link', path: '/images/chara_icon/Toon Link 0.png' },
    { name: 'Villager', path: '/images/chara_icon/Villager 0.png' },
    { name: 'Wario', path: '/images/chara_icon/Wario 0.png' },
    { name: 'Wii Fit Trainer', path: '/images/chara_icon/Wii Fit Trainer 0.png' },
    { name: 'Wolf', path: '/images/chara_icon/Wolf 0.png' },
    { name: 'Yoshi', path: '/images/chara_icon/Yoshi 0.png' },
    { name: 'Young Link', path: '/images/chara_icon/Young Link 0.png' },
    { name: 'Zelda', path: '/images/chara_icon/Zelda 0.png' },
    { name: 'Zero Suit Samus', path: '/images/chara_icon/Zero Suit Samus 0.png' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-[70%] mx-auto py-4">
        <h2 className="text-xl font-bold mb-4 text-center">キャラクター選択</h2>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-4 min-w-fit">
            {characterIcons.map((icon: CharacterIcon) => (
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