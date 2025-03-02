/**
 * 動画関連のユーティリティ関数
 */

import { characterIcons } from '../data/characterData';
import { CharacterGroup, CharacterIcon, GroupedVideos, MatchupItem, MatchupVideo, TimestampItem } from '../types/matchup';

/**
 * キャラクターアイコンを取得する関数
 * @param characterName キャラクター名
 * @returns キャラクターアイコン情報、見つからない場合はnull
 */
export const getCharacterIcon = (characterName: string): CharacterIcon | null => {
  if (!characterName) return null;
  
  // キャラクター名を小文字に変換して比較
  const lowerCaseName = characterName.toLowerCase();
  
  // キャラクターアイコンを検索
  const icon = characterIcons.find(icon => {
    // engまたはanotationが一致するか確認
    if (icon.eng.toLowerCase() === lowerCaseName) return true;
    
    // anotationがある場合はそれも確認
    if (icon.anotation) {
      return icon.anotation.some(a => lowerCaseName.includes(a.toLowerCase()));
    }
    
    return false;
  });
  
  // 見つからない場合はnullを返す
  if (!icon) return null;
  
  // CharacterIcon型に変換して返す
  return {
    id: icon.eng,
    name: icon.jp,
    image: icon.path,
    anotation: Array.isArray(icon.anotation) ? icon.anotation.join(',') : ''
  };
};

/**
 * キャラクターの組み合わせキーを生成する関数
 * @param chara1 1人目のキャラクター名
 * @param chara2 2人目のキャラクター名
 * @returns キャラクターの組み合わせキー（アルファベット順）
 */
export const createCharacterKey = (chara1: string, chara2: string): string => {
  // キャラクター名をアルファベット順にソート
  const sortedChars = [chara1, chara2].sort();
  return `${sortedChars[0]}vs${sortedChars[1]}`;
};

/**
 * 動画をキャラクターの組み合わせでグループ化する関数
 * @param videos 動画リスト
 * @param selectedCharacter 選択されたキャラクター
 * @returns グループ化された動画
 */
export const getCharacterGroupedVideos = (
  videos: MatchupVideo[],
  selectedCharacter?: string
): GroupedVideos => {
  const groupedVideos: GroupedVideos = {};
  
  // 「その他」グループのキー
  const otherGroupKey = 'other';
  
  videos.forEach(video => {
    const { chara1, chara2, directory } = video;
    
    // キャラクターが見つからない場合は「その他」グループに入れる
    if (!chara1 || !chara2) {
      if (!groupedVideos[otherGroupKey]) {
        groupedVideos[otherGroupKey] = {
          icon1: null,
          icon2: null,
          videos: []
        };
      }
      groupedVideos[otherGroupKey].videos.push(video);
      return;
    }
    
    // キャラクターの組み合わせキーを生成（アルファベット順）
    const charKey = createCharacterKey(chara1, chara2);
    
    // グループが存在しない場合は作成
    if (!groupedVideos[charKey]) {
      const icon1 = getCharacterIcon(chara1);
      const icon2 = getCharacterIcon(chara2);
      
      groupedVideos[charKey] = {
        icon1,
        icon2,
        videos: [],
        useChara: selectedCharacter
      };
    }
    
    // 動画をグループに追加
    groupedVideos[charKey].videos.push(video);
  });
  
  return groupedVideos;
};

/**
 * 動画からタイムスタンプを抽出する関数
 * @param video 動画データ
 * @returns タイムスタンプリスト
 */
export const extractTimestampsFromVideo = (video: any): { 
  timestamps: TimestampItem[],
  chara1: string,
  chara2: string
} => {
  const timestamps: TimestampItem[] = [];
  let chara1 = '';
  let chara2 = '';
  
  // matchupsプロパティがある場合
  if (video.matchups) {
    Object.entries(video.matchups).forEach(([key, value]: [string, any]) => {
      if (value.timestamps) {
        Object.entries(value.timestamps).forEach(([time, data]: [string, any]) => {
          // データがオブジェクトの場合（video_titleとdetect_timeを含む）
          if (typeof data === 'object' && data !== null) {
            timestamps.push({
              time: parseTimeToSeconds(data.detect_time),
              label: data.video_title || '',
              videoTitle: video.title || '',
              originalDetectTime: data.detect_time,
              chara1: value.chara1 || '',
              chara2: value.chara2 || ''
            });
          } else {
            // データが文字列の場合（タイムスタンプのラベルのみ）
            timestamps.push({
              time: parseTimeToSeconds(time),
              label: data || '',
              videoTitle: video.title || '',
              originalDetectTime: time,
              chara1: value.chara1 || '',
              chara2: value.chara2 || ''
            });
          }
        });
      }
      
      // キャラクター情報を取得
      chara1 = value.chara1 || '';
      chara2 = value.chara2 || '';
    });
  } else {
    // 直接timestampsプロパティがある場合
    if (video.timestamps) {
      Object.entries(video.timestamps).forEach(([time, data]: [string, any]) => {
        // データがオブジェクトの場合（video_titleとdetect_timeを含む）
        if (typeof data === 'object' && data !== null) {
          timestamps.push({
            time: parseTimeToSeconds(data.detect_time),
            label: data.video_title || '',
            videoTitle: video.title || '',
            originalDetectTime: data.detect_time,
            chara1: video.chara1 || '',
            chara2: video.chara2 || ''
          });
        } else {
          // データが文字列の場合（タイムスタンプのラベルのみ）
          timestamps.push({
            time: parseTimeToSeconds(time),
            label: data || '',
            videoTitle: video.title || '',
            originalDetectTime: time,
            chara1: video.chara1 || '',
            chara2: video.chara2 || ''
          });
        }
      });
    }
    
    // キャラクター情報を取得
    chara1 = video.chara1 || '';
    chara2 = video.chara2 || '';
  }
  
  return { timestamps, chara1, chara2 };
};

/**
 * 時間文字列を秒数に変換する関数
 * @param timeStr 時間文字列（HH:MM:SS形式）
 * @returns 秒数
 */
export const parseTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // 数値の場合はそのまま返す
  if (!isNaN(Number(timeStr))) {
    return Number(timeStr);
  }
  
  // HH:MM:SS形式の場合
  const timeParts = timeStr.split(':').map(Number);
  
  if (timeParts.length === 3) {
    // 時:分:秒
    return timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
  } else if (timeParts.length === 2) {
    // 分:秒
    return timeParts[0] * 60 + timeParts[1];
  } else {
    // その他の形式は0を返す
    return 0;
  }
}; 

export const transformMatchupItemToMatchupVideo = (matchupItems: MatchupItem[]): MatchupVideo[] => {
     return matchupItems.flatMap(item => {
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
        
        // console.log(`ディレクトリ ${item.directory} から ${videos.length} 件の動画を抽出しました`);
        return videos;
      })
};

