'use client';

import React, { useEffect, useState } from 'react';
import CharacterSelector from '../../components/character/CharacterSelector';
import YouTubePlayerWithTimestamps from '../../components/player/YouTubePlayerWithTimestamps';
import { TimestampItem } from '../../components/timestamp/TimestampItem';
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
  chara1: string;
  chara2: string;
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
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const fetchMatchupLists = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/matchup');
        const data = await response.json();

        console.log("fetchData:",data);

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
    
    // キャラクターの組み合わせごとにタイムスタンプをまとめるためのマップ
    const matchupMap: { [key: string]: { 
      url: string, 
      timestamps: TimestampItem[], 
      title: string, 
      matchupKey: string, 
      directory: string,
      chara1: string,
      chara2: string
    }} = {};
    
    matchupLists.forEach(item => {
      const matchupData = item.content;
      console.log(`ディレクトリ ${item.directory} のデータ:`, matchupData);
      
      // マッチアップデータの形式に合わせて処理
      if (matchupData && typeof matchupData === 'object') {
        // matchupsプロパティがある場合
        if (matchupData.matchups) {
          // console.log('matchupsプロパティあり:', Object.keys(matchupData.matchups));
          
          Object.entries(matchupData.matchups).forEach(([key, value]: [string, any]) => {
            // console.log(`マッチアップキー: ${key}`, value);
            
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
                
                // 自分対自分の場合（例：RyuvsRyu）は、両方のキャラクターが同じ場合のみマッチさせる
                if (chara1.toLowerCase() === chara2.toLowerCase()) {
                  // 選択したキャラクターも同じキャラクターの場合のみマッチ
                  return anotations.length === 1 && regex.test(chara1.toLowerCase());
                }
                
                // 選択したキャラクターが1つだけで、それが自分対自分の検索の場合
                // (例：Ryuを選択して、RyuvsRyuを検索したい場合)
                if (anotations.length === 1 && anotation.toLowerCase() === anotation.toLowerCase()) {
                  // 選択したキャラクターが自分対自分の検索の場合は、
                  // 対戦相手が同じキャラクターの場合のみマッチさせる
                  const isCharaSelfMatch = chara1.toLowerCase() === chara2.toLowerCase() && 
                                          regex.test(chara1.toLowerCase());
                  
                  // 自分対自分の検索でない場合は通常のマッチング
                  const isNormalMatch = chara1.toLowerCase() !== chara2.toLowerCase() && 
                                       (regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase()));
                  
                  return isCharaSelfMatch || isNormalMatch;
                }
                
                return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
              });
              
              // console.log(`使用キャラクターチェック: [${anotations.join(', ')}] in ${chara1} or ${chara2} = ${userCharacterMatched}`);
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
                  
                  // 自分対自分の場合（例：RyuvsRyu）は、両方のキャラクターが同じ場合のみマッチさせる
                  if (chara1.toLowerCase() === chara2.toLowerCase()) {
                    // 選択したキャラクターも同じキャラクターの場合のみマッチ
                    return anotations.length === 1 && regex.test(chara1.toLowerCase());
                  }
                  
                  // 選択したキャラクターが1つだけで、それが自分対自分の検索の場合
                  if (anotations.length === 1 && anotation.toLowerCase() === anotation.toLowerCase()) {
                    // 選択したキャラクターが自分対自分の検索の場合は、
                    // 対戦相手が同じキャラクターの場合のみマッチさせる
                    const isCharaSelfMatch = chara1.toLowerCase() === chara2.toLowerCase() && 
                                            regex.test(chara1.toLowerCase());
                    
                    // 自分対自分の検索でない場合は通常のマッチング
                    const isNormalMatch = chara1.toLowerCase() !== chara2.toLowerCase() && 
                                         (regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase()));
                    
                    return isCharaSelfMatch || isNormalMatch;
                  }
                  
                  return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
                });
              });
              
              // console.log(`対戦キャラクターチェック(OR条件): ${selectedCharacters.join(', ')} in ${chara1} or ${chara2} = ${opponentCharactersMatched}`);
            }
            
            // 両方の条件を満たす場合のみ追加
            if (userCharacterMatched && opponentCharactersMatched) {
              // console.log(`条件一致: ${key}, 使用キャラクター=${userCharacterMatched}, 対戦キャラクター=${opponentCharactersMatched}`);
              
              const videoUrl = value.url || '';
              if (videoUrl) {
                const timestamps: TimestampItem[] = [];
                // console.log("timestamps:",value);
                // タイムスタンプがある場合は追加
                if (value.timestamps) {
                  Object.entries(value.timestamps).forEach(([time, data]: [string, any]) => {
                    // データがオブジェクトの場合（video_titleとdetect_timeを含む）
                    if (typeof data === 'object' && data !== null) {
                      // detect_timeが時間形式（HH:MM:SS）の場合、秒に変換
                      let timeInSeconds = 0;
                      let originalDetectTime = "";
                      
                      if (data.detect_time) {
                        const timeStr = String(data.detect_time);
                        originalDetectTime = timeStr; // 元の形式を保存
                        
                        if (timeStr.includes(':')) {
                          // HH:MM:SS または MM:SS 形式を秒に変換
                          const parts = timeStr.split(':').map(Number);
                          if (parts.length === 3) {
                            // HH:MM:SS
                            timeInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                          } else if (parts.length === 2) {
                            // MM:SS
                            timeInSeconds = parts[0] * 60 + parts[1];
                          }
                        } else {
                          // 数値の場合はそのまま使用
                          timeInSeconds = parseInt(timeStr, 10);
                        }
                      } else {
                        // detect_timeがない場合はキーを時間として使用
                        timeInSeconds = parseInt(time, 10);
                      }

                      // デバッグ用
                      // console.log("Timestamp data:", data);

                      timestamps.push({
                        time: timeInSeconds,
                        label: data.video_title || data.label || String(data),
                        videoTitle: data.video_title || value.video_title || key,
                        originalDetectTime: originalDetectTime
                      });
                    } else {
                      // 従来の形式（時間: ラベル）
                      timestamps.push({
                        time: parseInt(time, 10),
                        label: value.video_title || String(data),
                        videoTitle: value.video_title || key,
                        originalDetectTime: time
                      });
                    }
                  });
                }
                
                // キャラクターの組み合わせを特定するキーを作成
                const chara1 = value.chara1 || '';
                const chara2 = value.chara2 || '';
                // URLも含めたユニークなキーを作成（同じキャラクター組み合わせでも異なる動画は別々に表示）
                const matchupCombinationKey = `${chara1}-${chara2}-${videoUrl}`;
                
                // 既存の同じ組み合わせがあればタイムスタンプを追加、なければ新規作成
                if (matchupMap[matchupCombinationKey]) {
                  // 既存のエントリにタイムスタンプを追加
                  matchupMap[matchupCombinationKey].timestamps = [
                    ...matchupMap[matchupCombinationKey].timestamps,
                    ...timestamps
                  ];
                } else {
                  // 新しいエントリを作成
                  matchupMap[matchupCombinationKey] = {
                    url: videoUrl,
                    timestamps,
                    title: value.video_title || key,
                    matchupKey: key,
                    directory: item.directory,
                    chara1,
                    chara2
                  };
                }
              }
            }
          });
        } 
        // matchupsプロパティがない場合、直接オブジェクトをチェック
        else {
          // console.log('直接オブジェクトをチェック:', Object.keys(matchupData));
          
          Object.entries(matchupData).forEach(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value !== null) {
              // console.log(`キー: ${key}`, value);
              
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
                  
                  // 自分対自分の場合（例：RyuvsRyu）は、両方のキャラクターが同じ場合のみマッチさせる
                  if (chara1.toLowerCase() === chara2.toLowerCase()) {
                    // 選択したキャラクターも同じキャラクターの場合のみマッチ
                    return anotations.length === 1 && regex.test(chara1.toLowerCase());
                  }
                  
                  // 選択したキャラクターが1つだけで、それが自分対自分の検索の場合
                  if (anotations.length === 1 && anotation.toLowerCase() === anotation.toLowerCase()) {
                    // 選択したキャラクターが自分対自分の検索の場合は、
                    // 対戦相手が同じキャラクターの場合のみマッチさせる
                    const isCharaSelfMatch = chara1.toLowerCase() === chara2.toLowerCase() && 
                                            regex.test(chara1.toLowerCase());
                    
                    // 自分対自分の検索でない場合は通常のマッチング
                    const isNormalMatch = chara1.toLowerCase() !== chara2.toLowerCase() && 
                                         (regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase()));
                    
                    return isCharaSelfMatch || isNormalMatch;
                  }
                  
                  return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
                });
                
                // console.log(`使用キャラクターチェック: [${anotations.join(', ')}] in ${chara1} or ${chara2} = ${userCharacterMatched}`);
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
                    
                    // 自分対自分の場合（例：RyuvsRyu）は、両方のキャラクターが同じ場合のみマッチさせる
                    if (chara1.toLowerCase() === chara2.toLowerCase()) {
                      // 選択したキャラクターも同じキャラクターの場合のみマッチ
                      return anotations.length === 1 && regex.test(chara1.toLowerCase());
                    }
                    
                    // 選択したキャラクターが1つだけで、それが自分対自分の検索の場合
                    if (anotations.length === 1 && anotation.toLowerCase() === anotation.toLowerCase()) {
                      // 選択したキャラクターが自分対自分の検索の場合は、
                      // 対戦相手が同じキャラクターの場合のみマッチさせる
                      const isCharaSelfMatch = chara1.toLowerCase() === chara2.toLowerCase() && 
                                              regex.test(chara1.toLowerCase());
                      
                      // 自分対自分の検索でない場合は通常のマッチング
                      const isNormalMatch = chara1.toLowerCase() !== chara2.toLowerCase() && 
                                           (regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase()));
                      
                      return isCharaSelfMatch || isNormalMatch;
                    }
                    
                    return regex.test(chara1.toLowerCase()) || regex.test(chara2.toLowerCase());
                  });
                });
                
                // console.log(`対戦キャラクターチェック(OR条件): ${selectedCharacters.join(', ')} in ${chara1} or ${chara2} = ${opponentCharactersMatched}`);
              }
              
              // 両方の条件を満たす場合のみ追加
              if (userCharacterMatched && opponentCharactersMatched) {
                // console.log(`条件一致: ${key}, 使用キャラクター=${userCharacterMatched}, 対戦キャラクター=${opponentCharactersMatched}`);
                
                const videoUrl = value.url || '';
                if (videoUrl) {
                  const timestamps: TimestampItem[] = [];
                  
                  // タイムスタンプがある場合は追加
                  if (value.detect_time) {
                    // Object.entries(value.timestamps).forEach(([time, data]: [string, any]) => {
                      // console.log("data:",data);
                      // データがオブジェクトの場合（video_titleとdetect_timeを含む）
                      // if (typeof data === 'object' && data !== null) {
                        // detect_timeが時間形式（HH:MM:SS）の場合、秒に変換
                        let timeInSeconds = 0;
                        let originalDetectTime = "";
                        
                        if (value.detect_time) {
                          const timeStr = String(value.detect_time);
                          originalDetectTime = timeStr; // 元の形式を保存
                          
                          if (timeStr.includes(':')) {
                            // HH:MM:SS または MM:SS 形式を秒に変換
                            const parts = timeStr.split(':').map(Number);
                            if (parts.length === 3) {
                              // HH:MM:SS
                              timeInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                            } else if (parts.length === 2) {
                              // MM:SS
                              timeInSeconds = parts[0] * 60 + parts[1];
                            }
                          } else {
                            // 数値の場合はそのまま使用
                            timeInSeconds = parseInt(timeStr, 10);
                          }
                        // } else {
                        //   // detect_timeがない場合はキーを時間として使用
                        //   timeInSeconds = parseInt(value.detect_time, 10);
                        // }

                        timestamps.push({
                          time: timeInSeconds,
                          label: value.video_title,
                          videoTitle: value.video_title || key,
                          originalDetectTime: originalDetectTime
                        });
                      } else {
                        // 従来の形式（時間: ラベル）
                        timestamps.push({
                          time: parseInt(value.detect_time, 10),
                          label: value.video_title,
                          videoTitle: value.video_title || key,
                          originalDetectTime: value.detect_time
                        });
                      }
                    // });
                  }
                  
                  // キャラクターの組み合わせを特定するキーを作成
                  const chara1 = value.chara1 || '';
                  const chara2 = value.chara2 || '';
                  // URLも含めたユニークなキーを作成（同じキャラクター組み合わせでも異なる動画は別々に表示）
                  const matchupCombinationKey = `${chara1}-${chara2}-${videoUrl}`;
                  
                  // 既存の同じ組み合わせがあればタイムスタンプを追加、なければ新規作成
                  if (matchupMap[matchupCombinationKey]) {
                    // 既存のエントリにタイムスタンプを追加
                    matchupMap[matchupCombinationKey].timestamps = [
                      ...matchupMap[matchupCombinationKey].timestamps,
                      ...timestamps,
                    ];
                  } else {
                    // 新しいエントリを作成
                    matchupMap[matchupCombinationKey] = {
                      url: videoUrl,
                      timestamps,
                      title: value.video_title || key,
                      matchupKey: key,
                      directory: item.directory,
                      chara1,
                      chara2
                    };
                  }
                }
              }
            }
          });
        }
      }
    });
    
    // マップから配列に変換
    const combinedVideos = Object.values(matchupMap);
    
    console.log('検索結果（組み合わせ後）:', combinedVideos.length, '件の動画が見つかりました');
    
    // 動画をソート（ディレクトリ名でソート）
    combinedVideos.sort((a, b) => a.directory.localeCompare(b.directory));
    
    // ディレクトリごとにグループ化
    const grouped: {[key: string]: MatchupVideo[]} = {};
    combinedVideos.forEach(video => {
      if (!grouped[video.directory]) {
        grouped[video.directory] = [];
      }
      grouped[video.directory].push(video);
    });
    
    setGroupedVideos(grouped);
    setMatchupVideos(combinedVideos);
    
    // ディレクトリごとのアコーディオンの初期状態を設定
    const initialDirectoryState: {[key: string]: boolean} = {};
    Object.keys(grouped).forEach((directory, index) => {
      // 最初のディレクトリだけを開いた状態にする
      initialDirectoryState[directory] = index === 0;
    });
    setExpandedDirectories(initialDirectoryState);
    
    // キャラクターの組み合わせごとにアコーディオンの初期状態を設定
    const initialExpandedState: {[key: string]: boolean} = {};
    combinedVideos.forEach(video => {
      const character1 = characterIcons.find(c => 
        c.anotation.some(a => video.chara1.toLowerCase().includes(a.toLowerCase()))
      );
      const character2 = characterIcons.find(c => 
        c.anotation.some(a => video.chara2.toLowerCase().includes(a.toLowerCase()))
      );
      
      if (character1 && character2) {
        // キャラクター名をアルファベット順にソートして、AvsB と BvsA を同じグループにする
        const sortedChars = [character1.eng, character2.eng].sort();
        const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
        // 初期状態では最初のグループだけを開いた状態にする
        initialExpandedState[charKey] = false;
      }
    });
    
    setExpandedGroups(initialExpandedState);
    setSelectedVideoIndex(combinedVideos.length > 0 ? 0 : -1); // 検索結果が変わったら最初のビデオを選択
  }, [selectedCharacter, selectedCharacters, matchupLists]);

  // キャラクターアイコンの組み合わせごとにビデオをグループ化する関数
  const getCharacterGroupedVideos = (videos: MatchupVideo[]) => {
    const charGroups: {[key: string]: {icon1: any, icon2: any, videos: MatchupVideo[]}} = {};
    
    videos.forEach(video => {
      const character1 = characterIcons.find(c => 
        c.anotation.some(a => video.chara1.toLowerCase().includes(a.toLowerCase()))
      );
      const character2 = characterIcons.find(c => 
        c.anotation.some(a => video.chara2.toLowerCase().includes(a.toLowerCase()))
      );
      
      if (character1 && character2) {
        // キャラクター名をアルファベット順にソートして、AvsB と BvsA を同じグループにする
        const sortedChars = [character1.eng, character2.eng].sort();
        const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
        
        if (!charGroups[charKey]) {
          charGroups[charKey] = {
            icon1: character1,
            icon2: character2,
            videos: []
          };
        }
        
        charGroups[charKey].videos.push(video);
      } else {
        // キャラクターが見つからない場合は「その他」グループに入れる
        const otherKey = 'other';
        if (!charGroups[otherKey]) {
          charGroups[otherKey] = {
            icon1: null,
            icon2: null,
            videos: []
          };
        }
        charGroups[otherKey].videos.push(video);
      }
    });
    
    return charGroups;
  };
  
  // アコーディオンの開閉を切り替える関数
  const toggleAccordion = (key: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // ディレクトリアコーディオンの開閉を切り替える関数
  const toggleDirectoryAccordion = (directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  };

  // console.log(matchupVideos);

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
            <h2 className="text-xl font-semibold mb-4">検索結果 ({matchupVideos.length}件)</h2>
            
            {matchupVideos.length === 0 ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p>選択したキャラクターのマッチアップ動画が見つかりませんでした。</p>
              </div>
            ) 
            : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* 動画プレーヤー部分 */}
                <div className="lg:col-span-3">
                  {selectedVideoIndex >= 0 && matchupVideos[selectedVideoIndex] && (
                    <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{matchupVideos[selectedVideoIndex].matchupKey}</h3>
                        <span className="text-sm bg-muted/30 dark:bg-muted/10 px-2 py-1 rounded">
                          {matchupVideos[selectedVideoIndex].directory}
                        </span>
                      </div>
                      
                      <YouTubePlayerWithTimestamps                        
                        width="100%"
                        height={600}
                        autoplay={false}
                        videos={matchupVideos}
                        allVideos={matchupLists.flatMap(item => {
                          const videos: MatchupVideo[] = [];
                          // matchupsプロパティがある場合の処理
                          if (item.content && item.content.matchups) {
                            Object.entries(item.content.matchups).forEach(([key, value]: [string, any]) => {
                              if (value.url) {
                                const timestamps: TimestampItem[] = [];
                                if (value.timestamps) {
                                  Object.entries(value.timestamps).forEach(([time, data]: [string, any]) => {
                                    if (typeof data === 'object' && data !== null) {
                                      let timeInSeconds = 0;
                                      let originalDetectTime = "";
                                      
                                      if (data.detect_time) {
                                        const timeStr = String(data.detect_time);
                                        originalDetectTime = timeStr;
                                        
                                        if (timeStr.includes(':')) {
                                          const parts = timeStr.split(':').map(Number);
                                          if (parts.length === 3) {
                                            timeInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                                          } else if (parts.length === 2) {
                                            timeInSeconds = parts[0] * 60 + parts[1];
                                          }
                                        } else {
                                          timeInSeconds = parseInt(timeStr, 10);
                                        }
                                      } else {
                                        timeInSeconds = parseInt(time, 10);
                                      }

                                      timestamps.push({
                                        time: timeInSeconds,
                                        label: data.video_title || data.label || String(data),
                                        videoTitle: data.video_title || value.video_title || key,
                                        originalDetectTime: originalDetectTime
                                      });
                                    } else {
                                      timestamps.push({
                                        time: parseInt(time, 10),
                                        label: value.video_title || String(data),
                                        videoTitle: value.video_title || key,
                                        originalDetectTime: time
                                      });
                                    }
                                  });
                                }
                                
                                videos.push({
                                  url: value.url,
                                  title: value.video_title || key,
                                  timestamps: timestamps,
                                  matchupKey: key,
                                  directory: item.directory,
                                  chara1: value.chara1 || '',
                                  chara2: value.chara2 || ''
                                });
                              }
                            });
                          }
                          // matchupsプロパティがない場合、直接オブジェクトをチェック
                          else if (item.content && typeof item.content === 'object') {
                            Object.entries(item.content).forEach(([key, value]: [string, any]) => {
                              if (typeof value === 'object' && value !== null && value.url) {
                                const timestamps: TimestampItem[] = [];
                                
                                // タイムスタンプがある場合は追加
                                if (value.detect_time) {
                                  let timeInSeconds = 0;
                                  let originalDetectTime = "";
                                  
                                  const timeStr = String(value.detect_time);
                                  originalDetectTime = timeStr;
                                  
                                  if (timeStr.includes(':')) {
                                    const parts = timeStr.split(':').map(Number);
                                    if (parts.length === 3) {
                                      timeInSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                                    } else if (parts.length === 2) {
                                      timeInSeconds = parts[0] * 60 + parts[1];
                                    }
                                  } else {
                                    timeInSeconds = parseInt(timeStr, 10);
                                  }
                                  
                                  timestamps.push({
                                    time: timeInSeconds,
                                    label: value.video_title || key,
                                    videoTitle: value.video_title || key,
                                    originalDetectTime: originalDetectTime
                                  });
                                }
                                
                                videos.push({
                                  url: value.url,
                                  title: value.video_title || key,
                                  timestamps: timestamps,
                                  matchupKey: key,
                                  directory: item.directory,
                                  chara1: value.chara1 || '',
                                  chara2: value.chara2 || ''
                                });
                              }
                            });
                          }
                          
                          console.log(`ディレクトリ ${item.directory} から ${videos.length} 件の動画を抽出しました`);
                          return videos;
                        })}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">すべてのマッチアップデータ</h2>
            <div className="grid grid-cols-1 gap-6">
              {matchupLists.map((item, index) => (
                <div key={index} className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-4">
                  <h2 className="text-xl font-semibold mb-2">ディレクトリ: {item.directory}</h2>
                  <div className="bg-muted/20 dark:bg-muted/5 p-4 rounded-md overflow-auto max-h-96 border border-border dark:border-gray-800">
                    <pre className="text-sm">{JSON.stringify(item.content, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </>
      )}
    </div>
  );
} 