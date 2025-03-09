/**
 * マッチアップ関連の型定義
 */

/**
 * タイムスタンプアイテムのデータ構造
 */
export interface TimestampItem {
  time: number; // 秒単位（detect_timeに対応）
  label: string;
  videoTitle?: string; // 動画のタイトル（video_titleに対応）
  originalDetectTime?: string; // 元のdetect_time文字列
  sourceVideo?: string; // タイムスタンプの元の動画タイトル
  sourceVideoIndex?: number; // タイムスタンプの元の動画インデックス
  chara1?: string; // 1人目のキャラクター名
  chara2?: string; // 2人目のキャラクター名
}

/**
 * APIから取得するマッチアップアイテム
 */
export interface MatchupItem {
  directory: string;
  content: any;
}

/**
 * マッチアップ動画のデータ構造
 */
export interface MatchupVideo {
  url: string;
  title: string;
  chara1: string;
  chara2: string;
  matchupKey: string;
  directory: string;
  timestamps: TimestampItem[];
  upload_date?: string; // 動画のアップロード日
}

/**
 * キャラクターアイコン情報
 */
export interface CharacterIcon {
  id: string;
  name: string;
  image: string;
  anotation?: string;
}

/**
 * キャラクターグループ
 */
export interface CharacterGroup {
  icon1: CharacterIcon | null;
  icon2: CharacterIcon | null;
  videos: MatchupVideo[];
  useChara?: string;
}

/**
 * グループ化された動画
 */
export interface GroupedVideos {
  [key: string]: CharacterGroup;
}

/**
 * 検索条件
 */
export interface SearchCriteria {
  userCharacter: string;
  opponentCharacters: string[];
} 