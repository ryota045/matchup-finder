'use client';

import React, { useState } from 'react';
import YouTubePlayer from '../../components/player/YouTubePlayer';
import YouTubePlayerWithTimestamps from '../../components/player/YouTubePlayerWithTimestamps';
import { TimestampItem } from '../../components/timestamp/TimestampItem';
import CharacterIcons from '../../components/character/CharacterIcons';
// import CharacterIcons from '../../components/CharacterIcons';
export default function YouTubeExamplePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [inputUrl, setInputUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [searchTerm, setSearchTerm] = useState('');

  // サンプルのタイムスタンプ
  const sampleTimestamps: TimestampItem[] = [
    { time: 0, label: 'イントロ' },
    { time: 18, label: 'サビ開始' },
    { time: 43, label: '2番開始' },
    { time: 62, label: '2番サビ' },
    { time: 131, label: 'ダンスシーン' },
    { time: 213, label: 'エンディング' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeUrl(inputUrl);
  };

  const handleCharacterClick = (characterName: string) => {
    console.log(`選択されたキャラクター: ${characterName}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTubeプレーヤーの例</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">キャラクターアイコン</h2>
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="キャラクター名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <CharacterIcons onIconClick={handleCharacterClick} searchTerm={searchTerm} />
      </div>
      
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="YouTube URLを入力"
            className="flex-grow p-2 border rounded"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            表示
          </button>
        </form>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">デフォルトサイズ</h2>
        <YouTubePlayer url={youtubeUrl} />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">カスタムサイズ</h2>
        <YouTubePlayer url={youtubeUrl} width="640" height="360" />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">自動再生（ブラウザの設定によっては機能しない場合があります）</h2>
        <YouTubePlayer url={youtubeUrl} autoplay={true} />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">開始時間付きの例</h2>
        <p className="mb-2 text-gray-600">以下は30秒から開始する例です</p>
        <YouTubePlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30" />
      </div>
      
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-2">タイムスタンプ付きプレーヤー（アニメーション付きアコーディオン）</h2>
        <p className="mb-2 text-gray-600">
          右側のタイムスタンプをクリックすると、その時間から自動的に再生が始まります。
          「タイムスタンプ」のヘッダー部分をクリックすると、スムーズなアニメーションでアコーディオンが開閉します。
        </p>
        <YouTubePlayerWithTimestamps 
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
          timestamps={sampleTimestamps}
        />
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">使用方法</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {`import YouTubePlayer from '../components/YouTubePlayer';
import YouTubePlayerWithTimestamps from '../components/YouTubePlayerWithTimestamps';
import { TimestampItem } from '../components/timestamp/TimestampItem';

// 基本的な使用法
<YouTubePlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />

// カスタムサイズ
<YouTubePlayer 
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  width="640" 
  height="360" 
/>

// 自動再生（ブラウザの設定によっては機能しない場合があります）
<YouTubePlayer 
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  autoplay={true} 
/>

// 特定の時間から開始（例：30秒から）
<YouTubePlayer 
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30" 
/>

// 時間指定の形式は様々なものに対応
// 秒指定: t=30
// 分秒指定: t=1m30s
// 時分秒指定: t=1h2m30s

// タイムスタンプ付きプレーヤーの使用例
// - タイムスタンプクリック時に自動再生
// - アニメーション付きアコーディオンで開閉可能
const timestamps: TimestampItem[] = [
  { time: 0, label: 'イントロ' },
  { time: 18, label: 'サビ開始' },
  { time: 43, label: '2番開始' }
];

<YouTubePlayerWithTimestamps 
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  timestamps={timestamps}
/>`}
        </pre>
      </div>
    </div>
  );
} 