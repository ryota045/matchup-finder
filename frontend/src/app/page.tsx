'use client';

import React, { useState } from 'react';
import Image from "next/image";
import CharacterSelector from "../components/character/CharacterSelector";

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">マッチアップファインダー</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">キャラクター選択</h2>
          <CharacterSelector 
            onSingleCharacterSelect={setSelectedCharacter}
            onMultipleCharactersSelect={setSelectedCharacters}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">選択結果</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-medium mb-2">単一選択:</h3>
              {selectedCharacter ? (
                <p className="p-2 bg-blue-100 rounded">{selectedCharacter}</p>
              ) : (
                <p className="text-gray-500">キャラクターが選択されていません</p>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">複数選択:</h3>
              {selectedCharacters.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCharacters.map(char => (
                    <span key={char} className="px-2 py-1 bg-blue-100 rounded">{char}</span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">キャラクターが選択されていません</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="/youtube-example" 
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mr-4"
          >
            YouTubeプレーヤーの例を見る
          </a>
          <a 
            href="/matchup" 
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            マッチアップファインダーを見る
          </a>
        </div>
      </div>
    </main>
  );
}
