'use client';

import React, { useState } from 'react';
import Image from "next/image";
import CharacterSelector from "../components/character/CharacterSelector";
import Link from 'next/link';

export default function Home() {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const features = [
    {
      title: 'キャラクター検索',
      description: '使用キャラクターと対戦キャラクターを選択して、関連する動画を素早く見つけることができます。',
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      title: 'タイムスタンプ付き動画再生',
      description: '重要な場面にジャンプできるタイムスタンプ機能で、効率的に学習できます。',
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'プレイリスト管理',
      description: 'ゲームやキャラクターごとに整理されたプレイリストで、必要な動画をすぐに見つけられます。',
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0"></div>
        <div className="container-responsive relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                スマブラSPの<span className="gradient-text">マッチアップ</span>を<br />
                簡単に見つけよう
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto lg:mx-0">
                キャラクター選択からタイムスタンプ付きの動画再生まで、スマブラSPプレイヤーの学習をサポートします。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/matchup" 
                  className="btn btn-primary btn-lg animate-fade-in"
                >
                  マッチアップを検索する
                </Link>
                <Link 
                  href="/youtube-example" 
                  className="btn btn-outline btn-lg"
                >
                  デモを見る
                </Link>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 z-10"></div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <svg className="w-20 h-20 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-full h-full bg-black">
                  {/* ここに実際の画像やサムネイルを表示 */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 bg-card">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              マッチアップファインダーは、スマブラSPプレイヤーの学習体験を向上させるための機能を提供します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="rounded-full bg-primary/10 p-3 w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* キャラクター選択セクション */}
      <section className="py-20">
        <div className="container-responsive">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">キャラクター選択</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              使用キャラクターと対戦キャラクターを選択して、関連する動画を検索できます。
            </p>
          </div>

          <div className="card p-8 max-w-4xl mx-auto">
            <CharacterSelector 
              onSingleCharacterSelect={setSelectedCharacter}
              onMultipleCharactersSelect={setSelectedCharacters}
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xl font-medium">単一選択:</h3>
                {selectedCharacter ? (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 text-primary font-medium">
                    {selectedCharacter}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-border text-foreground/50">
                    キャラクターが選択されていません
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-medium">複数選択:</h3>
                {selectedCharacters.length > 0 ? (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex flex-wrap gap-2">
                      {selectedCharacters.map(char => (
                        <span key={char} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-border text-foreground/50">
                    キャラクターが選択されていません
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container-responsive text-center">
          <h2 className="text-3xl font-bold mb-6">マッチアップを見つけよう</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            スマブラSPの対戦動画を簡単に検索・視聴して、スキルアップしましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/matchup" 
              className="btn bg-white text-primary hover:bg-white/90 btn-lg"
            >
              マッチアップを検索する
            </Link>
            <Link 
              href="/youtube-example" 
              className="btn bg-transparent border-white text-white hover:bg-white/10 btn-lg"
            >
              デモを見る
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
