'use client';

import React, { useState } from 'react';
import YouTubePlayer from '../../components/YouTubePlayer';

export default function YouTubeExamplePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [inputUrl, setInputUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setYoutubeUrl(inputUrl);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTubeプレーヤーの例</h1>
      
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
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">使用方法</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {`import YouTubePlayer from '../components/YouTubePlayer';

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
// 時分秒指定: t=1h2m30s`}
        </pre>
      </div>
    </div>
  );
} 