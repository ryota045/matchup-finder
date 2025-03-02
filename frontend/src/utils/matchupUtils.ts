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
  
  const videos: MatchupVideo[] = [];
  
  // 検出された動画をすべて個別に保存
  matchupLists.forEach((item, itemIndex) => {
    const matchupData = item.content;
    
    // マッチアップデータの形式に合わせて処理
    if (matchupData && typeof matchupData === 'object') {
      // matchupsプロパティがある場合
      if (matchupData.matchups) {
        Object.entries(matchupData.matchups).forEach(([key, value]: [string, any], valueIndex) => {
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
              
              // マッチアップキーの生成（ディレクトリ、キャラクター、インデックスを含める）
              const characterKey = createCharacterKey(value.chara1 || '', value.chara2 || '');
              const videoId = extractVideoId(videoUrl);
              
              // 新しいマッチアップを作成して直接配列に追加
              videos.push({
                url: videoUrl,
                title: value.title || matchupData.title || '',
                timestamps,
                matchupKey: characterKey, // 元のキャラクターキーは保持
                directory: item.directory,
                chara1: value.chara1 || '',
                chara2: value.chara2 || '',
                upload_date: value.upload_date || ''
              });
            }
          }
        });
      } else {
        // matchupsプロパティがない場合、直接オブジェクトをチェック
        Object.entries(matchupData).forEach(([key, value]: [string, any], valueIndex) => {
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
                
                // マッチアップキーの生成（キャラクターキーのみ）
                const characterKey = createCharacterKey(value.chara1 || '', value.chara2 || '');
                
                // 新しいマッチアップを作成して直接配列に追加
                videos.push({
                  url: videoUrl,
                  title: value.video_title || key,
                  timestamps,
                  matchupKey: characterKey, // 元のキャラクターキーは保持
                  directory: item.directory,
                  chara1: value.chara1 || '',
                  chara2: value.chara2 || '',
                  upload_date: value.upload_date || ''
                });
              }
            }
          }
        });
      }
    }
  });
  
  // 結果を返す（マップを使わずに直接配列を返す）
  return videos;
};

// YouTubeのURLからビデオIDを抽出する関数
const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}; 