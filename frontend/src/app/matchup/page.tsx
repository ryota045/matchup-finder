'use client';

import React, { useEffect, useState } from 'react';
import { MatchupItem, MatchupVideo, TimestampItem } from '../../types/matchup';
import SearchCriteriaComponent from '../../components/search/SearchCriteria';
import SearchResults from '../../components/search/SearchResults';
import { searchMatchupVideos } from '../../utils/matchupUtils';
import { transformMatchupItemToMatchupVideo } from '@/utils/videoUtils';

/**
 * マッチアップページコンポーネント
 * 
 * キャラクター選択と動画検索・表示を行うメインページ
 */
export default function MatchupPage() {
  // 状態管理
  const [matchupLists, setMatchupLists] = useState<MatchupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [matchupVideos, setMatchupVideos] = useState<MatchupVideo[]>([]);

  // マッチアップリストの取得
  useEffect(() => {
    const fetchMatchupLists = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/matchup');
        const data = await response.json();

        if (data.success) {
          setMatchupLists(data.data);
        } else {
          setError(data.error || 'マッチアップリストの取得に失敗しました');
        }
      } catch (err) {
        console.error('マッチアップリスト取得中にエラーが発生しました:', err);
        setError('マッチアップリストの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchupLists();
  }, []);

  // キャラクター選択が変更されたときにマッチアップビデオを検索
  useEffect(() => {
    if (matchupLists.length === 0) return;

    // 検索条件を満たしている場合のみ検索を実行
    const videos = searchMatchupVideos(matchupLists, selectedCharacter, selectedCharacters);
    setMatchupVideos(videos);
  }, [matchupLists, selectedCharacter, selectedCharacters]);

  // 使用キャラクター選択ハンドラ
  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
  };

  // 対戦キャラクター選択ハンドラ
  const handleOpponentCharacterSelect = (characters: string[]) => {
    setSelectedCharacters(characters);
  };

  return (
    <div className="container mx-auto py-8 xs:px-4">
      <h1 className="text-3xl font-bold mb-8">マッチアップ検索</h1>
      
      {/* 検索条件コンポーネント */}
      <SearchCriteriaComponent
        onCharacterSelect={handleCharacterSelect}
        onOpponentCharacterSelect={handleOpponentCharacterSelect}
      />
      
      {/* 検索結果コンポーネント */}
      <SearchResults
        matchupLists={transformMatchupItemToMatchupVideo(matchupLists)}
        matchupVideos={matchupVideos}
        selectedCharacter={selectedCharacter}
        selectedCharacters={selectedCharacters}
        loading={loading}
        error={error}
      />
    </div>
  );
} 