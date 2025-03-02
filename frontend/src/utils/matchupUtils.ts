/**
 * マッチアップ検索関連のユーティリティ関数
 */

import { MatchupItem, MatchupVideo, TimestampItem } from '../types/matchup';
import { isUserCharacterMatched, isOpponentCharactersMatched } from './characterUtils';
import { extractTimestampsFromVideo, createCharacterKey } from './videoUtils';

/**
 * マッチアップリストから条件に一致する動画を検索する関数
 * @param matchupLists マッチアップリスト
 * @param selectedCharacter 選択されたキャラクター
 * @param selectedCharacters 選択された対戦キャラクター
 * @returns 条件に一致する動画リスト
 */
export const searchMatchupVideos = (
  matchupLists: MatchupItem[],
  selectedCharacter: string,
  selectedCharacters: string[]
): MatchupVideo[] => {
  // 検索条件の確認
  const hasUserCharacter = !!selectedCharacter;
  const hasOpponentCharacters = selectedCharacters.length > 0;
  
  // 両方の条件がない場合は空配列を返す
  if (!hasUserCharacter || !hasOpponentCharacters) {
    return [];
  }

  // console.log("entered searchMatchupVideos");
  // console.log("matchupLists", matchupLists);
  
  const videos: MatchupVideo[] = [];
  
  // キャラクターの組み合わせごとにタイムスタンプをまとめるためのマップ
  const matchupMap: { [key: string]: MatchupVideo } = {};
  
  matchupLists.forEach(item => {
    const matchupData = item.content;
    
    // マッチアップデータの形式に合わせて処理
    if (matchupData && typeof matchupData === 'object') {
      // matchupsプロパティがある場合
      if (matchupData.matchups) {
        Object.entries(matchupData.matchups).forEach(([key, value]: [string, any]) => {
          // 条件チェック
          const userCharacterMatched = isUserCharacterMatched(
            value.chara1 || '',
            value.chara2 || '',
            selectedCharacter
          );
          
          const opponentCharactersMatched = isOpponentCharactersMatched(
            value.chara1 || '',
            value.chara2 || '',
            selectedCharacters
          );
          
          // 両方の条件を満たす場合のみ追加
          if (userCharacterMatched && opponentCharactersMatched) {
            const videoUrl = value.url || '';
            if (videoUrl) {
              // タイムスタンプの抽出
              const { timestamps } = extractTimestampsFromVideo(value);
              
              // マッチアップキーの生成
              const matchupKey = createCharacterKey(value.chara1 || '', value.chara2 || '');
              
              // 既存のマッチアップがあるか確認
              if (matchupMap[matchupKey]) {
                // 既存のマッチアップにタイムスタンプを追加
                matchupMap[matchupKey].timestamps = [
                  ...matchupMap[matchupKey].timestamps,
                  ...timestamps
                ];
              } else {
                // 新しいマッチアップを作成
                matchupMap[matchupKey] = {
                  url: videoUrl,
                  title: value.title || matchupData.title || '',
                  timestamps,
                  matchupKey,
                  directory: item.directory,
                  chara1: value.chara1 || '',
                  chara2: value.chara2 || ''
                };
              }
            }
          }
        });
      } else {
        // Object.entries(matchupData).forEach(([key, value]: [string, any]) => {
        // // 直接プロパティがある場合
        // const userCharacterMatched = isUserCharacterMatched(
        //   matchupData.chara1 || '',
        //   matchupData.chara2 || '',
        //   selectedCharacter
        // );
        
        // const opponentCharactersMatched = isOpponentCharactersMatched(
        //   matchupData.chara1 || '',
        //   matchupData.chara2 || '',
        //   selectedCharacters
        // );
        
        // // 両方の条件を満たす場合のみ追加
        // if (userCharacterMatched && opponentCharactersMatched) {
        //   const videoUrl = matchupData.url || '';
        //   if (videoUrl) {
        //     // タイムスタンプの抽出
        //     const { timestamps } = extractTimestampsFromVideo(matchupData);
            
        //     // マッチアップキーの生成
        //     const matchupKey = createCharacterKey(matchupData.chara1 || '', matchupData.chara2 || '');
            
        //     // 既存のマッチアップがあるか確認
        //     if (matchupMap[matchupKey]) {
        //       // 既存のマッチアップにタイムスタンプを追加
        //       matchupMap[matchupKey].timestamps = [
        //         ...matchupMap[matchupKey].timestamps,
        //         ...timestamps
        //       ];
        //     } else {
        //       // 新しいマッチアップを作成
        //       matchupMap[matchupKey] = {
        //         url: videoUrl,
        //         title: matchupData.title || '',
        //         timestamps,
        //         matchupKey,
        //         directory: item.directory,
        //         chara1: matchupData.chara1 || '',
        //         chara2: matchupData.chara2 || ''
        //       };
        //     }
        //     }
          // }
        // });
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
  
  // console.log('検索結果（組み合わせ後）:', combinedVideos.length, '件の動画が見つかりました');
  
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
  
  
  // console.log("combinedVideos", combinedVideos);

  // console.log("matchupMap", matchupMap);
  
  // マッチアップマップから動画リストを作成
  Object.values(combinedVideos).forEach(video => {
    videos.push(video);
  });
  
  return videos;
}; 