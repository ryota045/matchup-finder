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
                  chara2: value.chara2 || '',
                  upload_date: value.upload_date || ''
                };
              }
            }
          }
        });
      } else {
        // matchupsプロパティがない場合、直接オブジェクトをチェック
        Object.entries(matchupData).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'object' && value !== null) {
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
                    title: value.video_title || key,
                    timestamps,
                    matchupKey,
                    directory: item.directory,
                    chara1: value.chara1 || '',
                    chara2: value.chara2 || '',
                    upload_date: value.upload_date || ''
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
  const result = Object.values(matchupMap);
  
  // console.log("検索結果:", result);
  
  return result;
}; 