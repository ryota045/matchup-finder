'use client';

import React, { useEffect, useState } from 'react';
import CharacterSelector from '../../components/CharacterSelector';
import YouTubePlayerWithTimestamps from '../../components/YouTubePlayerWithTimestamps';
import { TimestampItem } from '../../components/YouTubeTimestamp';
import { characterIcons } from '../../data/characterData';

interface MatchupItem {
  directory: string;
  content: any;
}

interface MatchupVideo {
  url: string;
  timestamps: TimestampItem[];
  title: string;
  matchupKey: string;
  directory: string;
}

export default function MatchupPage() {
  const [matchupLists, setMatchupLists] = useState<MatchupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [matchupVideos, setMatchupVideos] = useState<MatchupVideo[]>([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});

  useEffect(() => {
    const fetchMatchupLists = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/matchup');
        const data = await response.json();

        if (data.success) {
          setMatchupLists(data.data);
          console.log('マッチアップリスト取得成功:', data.data);
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

    // 注意: selectedCharacterとselectedCharactersはすでにanotation値になっています
    // CharacterSelectorコンポーネントで変換されています
    console.log('キャラクター選択変更:', { 使用キャラクター: selectedCharacter, 対戦キャラクター: selectedCharacters });
    
    const videos: MatchupVideo[] = [];
    
    // 検索条件の確認
    const hasUserCharacter = !!selectedCharacter;
    const hasOpponentCharacters = selectedCharacters.length > 0;
    
    console.log('検索条件:', { 使用キャラクター検索: hasUserCharacter, 対戦キャラクター検索: hasOpponentCharacters });
    
    matchupLists.forEach(item => {
      const matchupData = item.content;
      console.log(`ディレクトリ ${item.directory} のデータ:`, matchupData);
      
      // マッチアップデータの形式に合わせて処理
      if (matchupData && typeof matchupData === 'object') {
        // matchupsプロパティがある場合
        if (matchupData.matchups) {
          console.log('matchupsプロパティあり:', Object.keys(matchupData.matchups));
          
          Object.entries(matchupData.matchups).forEach(([key, value]: [string, any]) => {
            console.log(`マッチアップキー: ${key}`, value);
            
            // 条件チェック用の変数
            let userCharacterMatched = !hasUserCharacter; // 使用キャラクター条件がない場合はtrueとする
            let opponentCharactersMatched = !hasOpponentCharacters; // 対戦キャラクター条件がない場合はtrueとする
            
            // 使用キャラクターのチェック
            if (hasUserCharacter) {
              const chara1 = value.chara1 || '';
              const chara2 = value.chara2 || '';
              
              // カンマ区切りのanotation値を配列に分割
              const anotations = selectedCharacter.split(',');
              
              // いずれかのanotation値がchara1またはchara2に含まれているかチェック
              userCharacterMatched = anotations.some(anotation => {
                // 単語境界でのマッチをチェック
                const regex = new RegExp(`\\b${anotation.toLowerCase()}\\b`);
                return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
              });
              
              console.log(`使用キャラクターチェック: [${anotations.join(', ')}] in ${chara1} or ${chara2} = ${userCharacterMatched}`);
            }
            
            // 対戦キャラクターのチェック
            if (hasOpponentCharacters) {
              const chara1 = value.chara1 || '';
              const chara2 = value.chara2 || '';
              
              // 各対戦キャラクターについて、いずれかのanotation値がchara1またはchara2に含まれているかチェック
              // OR条件: 選択したキャラクターのいずれか1つでも一致すればtrue
              opponentCharactersMatched = selectedCharacters.some(char => {
                // カンマ区切りのanotation値を配列に分割
                const anotations = char.split(',');
                
                return anotations.some(anotation => {
                  // 単語境界でのマッチをチェック
                  const regex = new RegExp(`\\b${anotation.toLowerCase()}\\b`);
                  return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
                });
              });
              
              console.log(`対戦キャラクターチェック(OR条件): ${selectedCharacters.join(', ')} in ${chara1} or ${chara2} = ${opponentCharactersMatched}`);
            }
            
            // 両方の条件を満たす場合のみ追加
            if (userCharacterMatched && opponentCharactersMatched) {
              console.log(`条件一致: ${key}, 使用キャラクター=${userCharacterMatched}, 対戦キャラクター=${opponentCharactersMatched}`);
              
              const videoUrl = value.url || '';
              if (videoUrl) {
                const timestamps: TimestampItem[] = [];
                
                // タイムスタンプがある場合は追加
                if (value.timestamps) {
                  Object.entries(value.timestamps).forEach(([time, label]: [string, any]) => {
                    timestamps.push({
                      time: parseInt(time, 10),
                      label: String(label)
                    });
                  });
                }
                
                videos.push({
                  url: videoUrl,
                  timestamps,
                  title: value.title || key,
                  matchupKey: key,
                  directory: item.directory
                });
                
                console.log('動画追加:', { url: videoUrl, key, timestamps: timestamps.length });
              }
            }
          });
        } 
        // matchupsプロパティがない場合、直接オブジェクトをチェック
        else {
          console.log('直接オブジェクトをチェック:', Object.keys(matchupData));
          
          Object.entries(matchupData).forEach(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value !== null) {
              console.log(`キー: ${key}`, value);
              
              // 条件チェック用の変数
              let userCharacterMatched = !hasUserCharacter; // 使用キャラクター条件がない場合はtrueとする
              let opponentCharactersMatched = !hasOpponentCharacters; // 対戦キャラクター条件がない場合はtrueとする
              
              // 使用キャラクターのチェック
              if (hasUserCharacter) {
                const chara1 = value.chara1 || '';
                const chara2 = value.chara2 || '';
                
                // カンマ区切りのanotation値を配列に分割
                const anotations = selectedCharacter.split(',');
                
                // いずれかのanotation値がchara1またはchara2に含まれているかチェック
                userCharacterMatched = anotations.some(anotation => {
                  // 単語境界でのマッチをチェック
                  const regex = new RegExp(`\\b${anotation.toLowerCase()}\\b`);
                  return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
                });
                
                console.log(`使用キャラクターチェック: [${anotations.join(', ')}] in ${chara1} or ${chara2} = ${userCharacterMatched}`);
              }
              
              // 対戦キャラクターのチェック
              if (hasOpponentCharacters) {
                const chara1 = value.chara1 || '';
                const chara2 = value.chara2 || '';
                
                // 各対戦キャラクターについて、いずれかのanotation値がchara1またはchara2に含まれているかチェック
                // OR条件: 選択したキャラクターのいずれか1つでも一致すればtrue
                opponentCharactersMatched = selectedCharacters.some(char => {
                  // カンマ区切りのanotation値を配列に分割
                  const anotations = char.split(',');
                  
                  return anotations.some(anotation => {
                    // 単語境界でのマッチをチェック
                    const regex = new RegExp(`\\b${anotation.toLowerCase()}\\b`);
                    return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
                  });
                });
                
                console.log(`対戦キャラクターチェック(OR条件): ${selectedCharacters.join(', ')} in ${chara1} or ${chara2} = ${opponentCharactersMatched}`);
              }
              
              // 両方の条件を満たす場合のみ追加
              if (userCharacterMatched && opponentCharactersMatched) {
                console.log(`条件一致: ${key}, 使用キャラクター=${userCharacterMatched}, 対戦キャラクター=${opponentCharactersMatched}`);
                
                const videoUrl = value.url || '';
                if (videoUrl) {
                  const timestamps: TimestampItem[] = [];
                  
                  // タイムスタンプがある場合は追加
                  if (value.timestamps) {
                    Object.entries(value.timestamps).forEach(([time, label]: [string, any]) => {
                      timestamps.push({
                        time: parseInt(time, 10),
                        label: String(label)
                      });
                    });
                  }
                  
                  videos.push({
                    url: videoUrl,
                    timestamps,
                    title: value.title || key,
                    matchupKey: key,
                    directory: item.directory
                  });
                  
                  console.log('動画追加:', { url: videoUrl, key, timestamps: timestamps.length });
                }
              }
            }
          });
        }
      }
    });
    
    console.log('検索結果:', videos.length, '件の動画が見つかりました');
    
    // 動画をソート（ディレクトリ名でソート）
    videos.sort((a, b) => a.directory.localeCompare(b.directory));
    
    // ディレクトリごとにグループ化
    const grouped: {[key: string]: MatchupVideo[]} = {};
    videos.forEach(video => {
      if (!grouped[video.directory]) {
        grouped[video.directory] = [];
      }
      grouped[video.directory].push(video);
    });
    
    setGroupedVideos(grouped);
    setMatchupVideos(videos);
    setSelectedVideoIndex(videos.length > 0 ? 0 : -1); // 検索結果が変わったら最初のビデオを選択
  }, [selectedCharacter, selectedCharacters, matchupLists]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">マッチアップファインダー</h1>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">キャラクター選択</h2>
            <CharacterSelector 
              onSingleCharacterSelect={setSelectedCharacter}
              onMultipleCharactersSelect={setSelectedCharacters}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">選択結果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg shadow-md p-4">
              <div>
                <h3 className="text-lg font-medium mb-2">使用キャラクター:</h3>
                {selectedCharacter ? (
                  <p className="p-2 bg-blue-100 rounded">
                    {(() => {
                      // カンマ区切りのanotation値を配列に分割
                      const anotations = selectedCharacter.split(',');
                      
                      // 最初のanotation値に対応するキャラクターを検索
                      const character = characterIcons.find(c => 
                        c.anotation.some(a => anotations.includes(a.toLowerCase()))
                      );
                      
                      return character ? character.jp : selectedCharacter;
                    })()}
                  </p>
                ) : (
                  <p className="text-gray-500">キャラクターが選択されていません</p>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">対戦キャラクター:</h3>
                {selectedCharacters.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacters.map(char => {
                      // カンマ区切りのanotation値を配列に分割
                      const anotations = char.split(',');
                      
                      // いずれかのanotation値に対応するキャラクターを検索
                      const character = characterIcons.find(c => 
                        c.anotation.some(a => anotations.includes(a.toLowerCase()))
                      );
                      
                      const displayName = character ? character.jp : char;
                      
                      return (
                        <span key={char} className="px-2 py-1 bg-blue-100 rounded">{displayName}</span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">キャラクターが選択されていません</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">マッチアップ動画 ({matchupVideos.length}件)</h2>
            
            {matchupVideos.length === 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p>選択したキャラクターのマッチアップ動画が見つかりませんでした。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* プレイリスト部分 */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 overflow-auto max-h-[600px]">
                  <h3 className="text-lg font-semibold mb-4">プレイリスト</h3>
                  
                  {Object.entries(groupedVideos).map(([directory, videos]) => (
                    <div key={directory} className="mb-4">
                      <h4 className="font-medium text-gray-700 bg-gray-100 p-2 rounded mb-2">{directory}</h4>
                      <ul className="space-y-2">
                        {videos.map((video, videoIndex) => {
                          const globalIndex = matchupVideos.findIndex(v => 
                            v.url === video.url && v.matchupKey === video.matchupKey
                          );
                          return (
                            <li key={videoIndex}>
                              <button
                                className={`w-full text-left p-2 rounded-md transition-colors ${
                                  selectedVideoIndex === globalIndex 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedVideoIndex(globalIndex)}
                              >
                                <div className="font-medium">{video.matchupKey}</div>
                                <div className="text-xs text-gray-500">
                                  {video.timestamps.length > 0 
                                    ? `${video.timestamps.length} タイムスタンプ` 
                                    : 'タイムスタンプなし'}
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
                
                {/* 動画プレーヤー部分 */}
                <div className="lg:col-span-2">
                  {selectedVideoIndex >= 0 && matchupVideos[selectedVideoIndex] && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{matchupVideos[selectedVideoIndex].matchupKey}</h3>
                        <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                          {matchupVideos[selectedVideoIndex].directory}
                        </span>
                      </div>
                      
                      <YouTubePlayerWithTimestamps
                        url={matchupVideos[selectedVideoIndex].url}
                        timestamps={matchupVideos[selectedVideoIndex].timestamps}
                        width="100%"
                        height="500"
                        autoplay={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">すべてのマッチアップデータ</h2>
            <div className="grid grid-cols-1 gap-6">
              {matchupLists.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4">
                  <h2 className="text-xl font-semibold mb-2">ディレクトリ: {item.directory}</h2>
                  <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-sm">{JSON.stringify(item.content, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 