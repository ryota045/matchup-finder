/**
 * YouTubeの動画URLに関する共通ユーティリティ関数
 */

/**
 * YouTubeのURLからビデオIDを抽出する関数
 * @param url YouTube動画のURL
 * @returns ビデオID（11文字）または無効な場合はnull
 */
export const extractVideoId = (url: string): string | null => {
  // 通常のYouTube URL (例: https://www.youtube.com/watch?v=VIDEO_ID)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * URLから開始時間（秒）を抽出する関数
 * @param url YouTube動画のURL（t=XXXパラメータを含む）
 * @returns 開始時間（秒）または無効な場合はnull
 */
export const extractStartTime = (url: string): number | null => {
  // t=XXXパラメータを検索（秒単位）
  const timeRegExp = /[?&]t=(\d+)s?/;
  const timeMatch = url.match(timeRegExp);
  
  if (timeMatch && timeMatch[1]) {
    return parseInt(timeMatch[1], 10);
  }
  
  // t=1m30sのような形式を検索
  const complexTimeRegExp = /[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/;
  const complexTimeMatch = url.match(complexTimeRegExp);
  
  if (complexTimeMatch) {
    const hours = complexTimeMatch[1] ? parseInt(complexTimeMatch[1], 10) * 3600 : 0;
    const minutes = complexTimeMatch[2] ? parseInt(complexTimeMatch[2], 10) * 60 : 0;
    const seconds = complexTimeMatch[3] ? parseInt(complexTimeMatch[3], 10) : 0;
    
    if (hours > 0 || minutes > 0 || seconds > 0) {
      return hours + minutes + seconds;
    }
  }
  
  return null;
};

/**
 * YouTubeの埋め込みURLを生成する関数
 * @param url 元のYouTube動画URL
 * @param autoplay 自動再生するかどうか
 * @returns 埋め込み用のURL
 */
export const createEmbedUrl = (url: string, autoplay: boolean): string => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    console.error('無効なYouTube URL:', url);
    return '';
  }

  // 埋め込みURLを作成
  let embedUrl = `https://www.youtube.com/embed/${videoId}`;
  
  // クエリパラメータを追加
  const queryParams = [];
  
  if (autoplay) {
    queryParams.push('autoplay=1');
  }
  
  const startTime = extractStartTime(url);
  if (startTime !== null) {
    queryParams.push(`start=${startTime}`);
  }
  
  if (queryParams.length > 0) {
    embedUrl += `?${queryParams.join('&')}`;
  }

  return embedUrl;
};

/**
 * 秒を「時:分:秒」形式に変換する関数
 * @param seconds 秒数
 * @returns フォーマットされた時間文字列
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}; 