/**
 * 動画関連のユーティリティ関数
 */

import { characterIcons } from '../data/characterData';
import { CharacterGroup, CharacterIcon, GroupedVideos, MatchupItem, MatchupVideo, TimestampItem } from '../types/matchup';
import { MatchupVideo as PlaylistMatchupVideo } from '../components/playlist/VideoItem';
import { CharacterIcon as PlaylistCharacterIcon } from '../components/playlist/CharacterIconPair';

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
    // engが完全一致するか確認
    if (icon.eng.toLowerCase() === lowerCaseName) return true;
    
    // anotationがある場合は完全一致するか確認
    if (icon.anotation) {
      return icon.anotation.some(a => a.toLowerCase() === lowerCaseName);
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
 * URLからタイムスタンプ部分を除去する関数
 * @param url YouTube URL
 * @returns タイムスタンプを除去したURL
 */
export const removeTimestampFromUrl = (url: string): string => {
  // URLからタイムスタンプパラメータ（&t=〇〇s）を除去
  return url.replace(/[&?]t=\d+s?/, '');
};

/**
 * 動画をディレクトリごとにグループ化する関数
 * @param videos 動画リスト
 * @returns ディレクトリごとにグループ化された動画
 */
export const groupVideosByDirectory = (videos: PlaylistMatchupVideo[]): {[key: string]: PlaylistMatchupVideo[]} => {
  if (videos.length === 0) {
    return {};
  }
  
  const grouped: {[key: string]: PlaylistMatchupVideo[]} = {};
  videos.forEach(video => {
    if (!grouped[video.directory]) {
      grouped[video.directory] = [];
    }
    grouped[video.directory].push(video);
  });
  
  return grouped;
};

/**
 * キャラクター名からキャラクターアイコンを検索する関数（完全一致）
 * @param characterName キャラクター名
 * @returns キャラクターアイコン、見つからない場合はnull
 */
const findExactCharacterIcon = (characterName: string): PlaylistCharacterIcon | null => {
  if (!characterName) return null;
  
  // 完全一致するキャラクターを検索
  const icon = characterIcons.find(c => 
    c.eng.toLowerCase() === characterName.toLowerCase() || 
    c.anotation.some(a => a.toLowerCase() === characterName.toLowerCase())
  );
  
  return icon || null;
};

/**
 * キャラクターアイコンの組み合わせごとにビデオをグループ化する関数
 * @param videos グループ化する動画リスト
 * @param selectedCharacter 選択されたキャラクター名（英語）
 * @returns キャラクターの組み合わせごとにグループ化された動画
 */
export const getCharacterGroupedVideos = (
  videos: PlaylistMatchupVideo[], 
  selectedCharacter?: string
): {[key: string]: {icon1: PlaylistCharacterIcon | null, icon2: PlaylistCharacterIcon | null, videos: PlaylistMatchupVideo[], useChara?: string}} => {
  const charGroups: {[key: string]: {icon1: PlaylistCharacterIcon | null, icon2: PlaylistCharacterIcon | null, videos: PlaylistMatchupVideo[], useChara?: string}} = {};
  
  // 選択されたキャラクターのアイコンを取得
  const selectedCharacterIcon = selectedCharacter ? 
    characterIcons.find(c => c.eng.toLowerCase() === selectedCharacter.toLowerCase()) : null;
  
  videos.forEach(video => {
    // 使用キャラクター（chara1）と対戦相手（chara2）のアイコンを取得
    // 完全一致で検索
    const useCharacter = characterIcons.find(c => 
      c.eng.toLowerCase() === video.chara1.toLowerCase() || 
      c.anotation.some(a => a.toLowerCase() === video.chara1.toLowerCase())
    );
    
    const opponentCharacter = characterIcons.find(c => 
      c.eng.toLowerCase() === video.chara2.toLowerCase() || 
      c.anotation.some(a => a.toLowerCase() === video.chara2.toLowerCase())
    );
    
    if (useCharacter && opponentCharacter) {
      // キャラクター名をアルファベット順にソートしてグループキーを作成
      // これにより、AvsB と BvsA を同じグループにする
      const sortedChars = [useCharacter.eng, opponentCharacter.eng].sort();
      const charKey = `${sortedChars[0]}-${sortedChars[1]}`;
      
      // グループが存在しない場合は新しく作成
      if (!charGroups[charKey]) {
        // 選択されたキャラクターが存在し、このグループに含まれている場合
        const isSelectedCharInGroup = selectedCharacterIcon && 
          (selectedCharacterIcon.eng === useCharacter.eng || selectedCharacterIcon.eng === opponentCharacter.eng);
        
        if (isSelectedCharInGroup) {
          // 選択されたキャラクターを常に左側（icon1）に配置
          const icon1 = selectedCharacterIcon.eng === useCharacter.eng ? useCharacter : opponentCharacter;
          const icon2 = selectedCharacterIcon.eng === useCharacter.eng ? opponentCharacter : useCharacter;
          
          charGroups[charKey] = {
            icon1: icon1,
            icon2: icon2,
            videos: [],
            // 使用キャラクター名を選択されたキャラクターに設定
            useChara: selectedCharacterIcon.eng
          };
        } else {
          // 選択されたキャラクターがない場合は従来通り
          charGroups[charKey] = {
            // 使用キャラクターを常に左側（icon1）に配置
            icon1: useCharacter,
            icon2: opponentCharacter,
            videos: [],
            // 使用キャラクター名を明示的に指定
            useChara: useCharacter.eng
          };
        }
      }
      
      // 動画をグループに追加
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

/**
 * 現在のURLに一致するタイムスタンプを収集する関数
 * @param url 現在のURL
 * @param videos 検索結果の動画リスト
 * @param allVideos 全ての動画リスト
 * @returns 現在のURLに一致するタイムスタンプのリスト
 */
export const getMatchingTimestamps = (url: string, videos: PlaylistMatchupVideo[], allVideos: PlaylistMatchupVideo[]) => {
  if (!url) {
    return [];
  }
  
  const currentUrl = removeTimestampFromUrl(url);
  const matchingTimestamps: any[] = [];
  
  // 検索結果で絞られる前の全ての動画から検索
  const videosToSearch = allVideos && allVideos.length > 0 ? allVideos : videos;
  
  // まず、現在選択されている動画と完全に一致する動画のタイムスタンプを追加
  videosToSearch.forEach(video => {
    // 動画のURLからタイムスタンプを除去して比較
    const videoUrl = removeTimestampFromUrl(video.url);
    
    // URLが一致する場合のみタイムスタンプを追加
    if (videoUrl === currentUrl) {
      video.timestamps.forEach(timestamp => {
        // 元の動画情報を保持するために新しいプロパティを追加
        // sourceVideoIndexは検索結果の配列（videos）内でのインデックスを計算
        const sourceVideoIndex = videos.findIndex(v => {
          // URLからタイムスタンプを除去して比較
          const vUrl = removeTimestampFromUrl(v.url);
          // URLとタイトルとディレクトリが一致する動画を探す
          return vUrl === videoUrl && v.title === video.title && v.directory === video.directory;
        });
        
        matchingTimestamps.push({
          ...timestamp,
          sourceVideo: video.title,
          sourceVideoIndex: sourceVideoIndex, // 検索結果内での対応するインデックス
          // キャラクター情報も追加
          chara1: video.chara1,
          chara2: video.chara2
        });
      });
    }
  });
  
  // タイムスタンプをtimeの値が小さい順に並べ替え
  return matchingTimestamps.sort((a, b) => a.time - b.time);
};

