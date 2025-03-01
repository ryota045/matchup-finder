import React, { useState, useEffect, RefObject } from 'react';
import { characterIcons } from '../../data/characterData';
import TimestampList from './TimestampList';
import Playlist from '../playlist/Playlist';
import { TimestampItem } from './TimestampItem';
import { MatchupVideo } from '../playlist/VideoItem';
import { CharacterIcon } from '../playlist/CharacterIconPair';
import { formatTime } from '../utils/YouTubeUtils';
import AnimatedAccordion from '../ui/AnimatedAccordion';

/**
 * YouTubeタイムスタンプコンポーネントのプロパティ
 * @interface YouTubeTimestampProps
 * @property {(time: number) => void} onTimestampClick - タイムスタンプがクリックされたときのコールバック関数
 * @property {number} [currentTime=0] - 現在の再生時間（秒）
 * @property {MatchupVideo[]} [videos=[]] - 関連動画のリスト（検索結果で絞られた状態）
 * @property {MatchupVideo[]} [allVideos=[]] - 全ての動画リスト（検索結果で絞られる前）
 * @property {(videoIndex: number) => void} [onVideoSelect] - 動画が選択されたときのコールバック関数
 * @property {string} [url] - 現在の動画URL
 * @property {boolean} [isOpen=true] - タイムスタンプリストが開いているかどうか
 * @property {(isOpen: boolean) => void} [setIsOpen] - タイムスタンプリストの開閉状態を設定する関数
 * @property {boolean} [isPlaylistOpen=true] - プレイリストが開いているかどうか
 * @property {(isOpen: boolean) => void} [setIsPlaylistOpen] - プレイリストの開閉状態を設定する関数
 * @property {RefObject<HTMLDivElement | null>} [playerContainerRef] - プレーヤーコンテナへの参照
 * @property {string} [selectedCharacter] - 選択されたキャラクター名（英語）
 */
interface YouTubeTimestampProps {
  // timestamps: TimestampItem[];
  onTimestampClick: (time: number) => void;
  currentTime?: number;
  videos?: MatchupVideo[];
  allVideos?: MatchupVideo[]; // 検索結果で絞られる前の全ての動画リスト
  onVideoSelect?: (url: string) => void;
  url?: string;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  isPlaylistOpen?: boolean;
  setIsPlaylistOpen?: (isOpen: boolean) => void;
  playerContainerRef?: RefObject<HTMLDivElement | null>;
  selectedCharacter?: string;
}

/**
 * YouTube動画のタイムスタンプとプレイリストを表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <YouTubeTimestamp
 *   timestamps={[
 *     { time: 0, label: "イントロ" },
 *     { time: 30, label: "サビ" }
 *   ]}
 *   onTimestampClick={handleTimestampClick}
 *   currentTime={15}
 *   videos={relatedVideos}
 *   selectedVideoIndex={0}
 *   onVideoSelect={handleVideoSelect}
 * />
 * ```
 */
const YouTubeTimestamp: React.FC<YouTubeTimestampProps> = ({
  onTimestampClick,
  currentTime = 0,
  videos = [],
  allVideos = [], // 検索結果で絞られる前の全ての動画リスト
  onVideoSelect,
  url,
  isOpen = true,
  setIsOpen,
  isPlaylistOpen = true,
  setIsPlaylistOpen,
  playerContainerRef,
  selectedCharacter
}) => {
  // console.log("allVideos", allVideos);
  // console.log("videos", videos);
  // console.log("selectedVideoIndex", selectedVideoIndex);
  // console.log("currentTime", currentTime);
  
  // 内部状態として使用するための状態を作成
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);
  const [internalIsPlaylistOpen, setInternalIsPlaylistOpen] = useState(isPlaylistOpen);
  
  // 親から渡された状態と同期させる
  useEffect(() => {
    setInternalIsOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    setInternalIsPlaylistOpen(isPlaylistOpen);
  }, [isPlaylistOpen]);
  
  // アコーディオンの開閉状態を管理
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});
  const [groupedVideos, setGroupedVideos] = useState<{[key: string]: MatchupVideo[]}>({});
  const [allMatchingTimestamps, setAllMatchingTimestamps] = useState<TimestampItem[]>([]);
  
  // 動画をディレクトリごとにグループ化
  useEffect(() => {
    if (videos.length === 0 || !selectedCharacter) {
      setGroupedVideos({});
      setExpandedDirectories({});
      setExpandedGroups({});
      return;
    }
    
    // ディレクトリごとにグループ化
    const grouped: {[key: string]: MatchupVideo[]} = {};
    videos.forEach(video => {
      if (!grouped[video.directory]) {
        grouped[video.directory] = [];
      }
      grouped[video.directory].push(video);
    });
    
    setGroupedVideos(grouped);
    
    // ディレクトリごとのアコーディオンの初期状態を設定
    const initialDirectoryState: {[key: string]: boolean} = {};
    Object.keys(grouped).forEach((directory) => {
      // すべてのディレクトリを閉じた状態にする
      initialDirectoryState[directory] = false;
    });
    setExpandedDirectories(initialDirectoryState);
    
    // キャラクターの組み合わせごとにアコーディオンの初期状態を設定
    const initialExpandedState: {[key: string]: boolean} = {};
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
        // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
        const uniqueKey = `${video.directory}-${charKey}`;
        // 初期状態ではすべてのグループを閉じた状態にする
        initialExpandedState[uniqueKey] = false;
      }
    });
    
    setExpandedGroups(initialExpandedState);
  }, [videos, selectedCharacter]);

  // 現在選択されている動画のURLと同じURLを持つすべてのマッチアップのタイムスタンプを収集
  useEffect(() => {
    if (!selectedCharacter || !url) {
      setAllMatchingTimestamps([]);
      return;
    }
    
    // URLからタイムスタンプ部分を除去する関数
    const removeTimestampFromUrl = (url: string): string => {
      // URLからタイムスタンプパラメータ（&t=〇〇s）を除去
      return url.replace(/[&?]t=\d+s?/, '');
    };
    
    const currentUrl = removeTimestampFromUrl(url);

    console.log("currentUrl:", currentUrl);
    
    // すべての動画からURLが一致するタイムスタンプを収集
    const matchingTimestamps: TimestampItem[] = [];

    console.log("allVideos length:", allVideos?.length || 0);
    
    // 検索結果で絞られる前の全ての動画から検索
    const videosToSearch = allVideos && allVideos.length > 0 ? allVideos : videos;
    
    console.log("videosToSearch length:", videosToSearch.length);
    console.log("currentUrl:", currentUrl);
    
    // まず、現在選択されている動画と完全に一致する動画のタイムスタンプを追加
    videosToSearch.forEach(video => {
      // 動画のURLからタイムスタンプを除去して比較
      const videoUrl = removeTimestampFromUrl(video.url);
      
      // URLが一致し、かつタイトルとディレクトリも一致する場合のみタイムスタンプを追加
      if (videoUrl === currentUrl) {
        console.log("完全一致 (URL, タイトル, ディレクトリ):", video.title, video.directory, videoUrl);
        
        video.timestamps.forEach(timestamp => {
          // 元の動画情報を保持するために新しいプロパティを追加
          // sourceVideoIndexは検索結果の配列（videos）内でのインデックスを計算
          const sourceVideoIndex = videos.findIndex(v => {
            // URLからタイムスタンプを除去して比較
            const vUrl = removeTimestampFromUrl(v.url);
            // URLとタイトルとディレクトリが一致する動画を探す
            return vUrl === videoUrl && v.title === video.title && v.directory === video.directory;
          });
          
          console.log(`タイムスタンプ追加: ${timestamp.time}秒, 動画: ${video.title}, インデックス: ${sourceVideoIndex}`);
          
          matchingTimestamps.push({
            ...timestamp,
            sourceVideo: video.title,
            sourceVideoIndex: sourceVideoIndex, // 検索結果内での対応するインデックス
            // キャラクター情報も追加
            chara1: video.chara1,
            chara2: video.chara2
          });
        });
      } else if (videoUrl === currentUrl) {
        console.log("URLは一致するが、タイトルまたはディレクトリが異なる:", video.title, video.directory);
      }
    });
    
    // タイムスタンプをtimeの値が小さい順に並べ替え
    matchingTimestamps.sort((a, b) => a.time - b.time);
    
    setAllMatchingTimestamps(matchingTimestamps);
  }, [videos, allVideos, url, selectedCharacter]);

  /**
   * キャラクターアイコンの組み合わせごとにビデオをグループ化する関数
   * @param videos グループ化する動画リスト
   * @returns キャラクターの組み合わせごとにグループ化された動画
   */
  const getCharacterGroupedVideos = (videos: MatchupVideo[]) => {
    const charGroups: {[key: string]: {icon1: CharacterIcon | null, icon2: CharacterIcon | null, videos: MatchupVideo[], useChara?: string}} = {};
    
    // 選択されたキャラクターのアイコンを取得
    const selectedCharacterIcon = selectedCharacter ? 
      characterIcons.find(c => c.eng.toLowerCase() === selectedCharacter.toLowerCase()) : null;
    
    videos.forEach(video => {
      // 使用キャラクター（chara1）と対戦相手（chara2）のアイコンを取得
      const useCharacter = characterIcons.find(c => 
        c.anotation.some(a => video.chara1.toLowerCase().includes(a.toLowerCase()))
      );
      const opponentCharacter = characterIcons.find(c => 
        c.anotation.some(a => video.chara2.toLowerCase().includes(a.toLowerCase()))
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
    
    // デバッグ用ログ
    console.log('Generated character groups:', Object.entries(charGroups).map(([key, group]) => ({
      key,
      useChara: group.useChara,
      icon1: group.icon1?.eng,
      icon2: group.icon2?.eng,
      videosCount: group.videos.length
    })));
    
    return charGroups;
  };
  
  /**
   * アコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   * @param charKey キャラクターグループのキー
   */
  const toggleAccordion = (directory: string, charKey: string) => {
    // ディレクトリとキャラクターの組み合わせでユニークなキーを作成
    const uniqueKey = `${directory}-${charKey}`;
    setExpandedGroups(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey]
    }));
  };
  
  /**
   * ディレクトリアコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   */
  const toggleDirectoryAccordion = (directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  };

  // キャラクターが選択されていない場合はメッセージを表示
  if (!selectedCharacter) {
    return (
      <div className="youtube-timestamp" style={{ position: 'relative' }}>
        <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 p-6 mb-4">
          <div className="text-center">
            <div className="text-3xl mb-3">🎮</div>
            <h3 className="text-lg font-semibold mb-2">キャラクターを選択してください</h3>
            <p className="text-muted-foreground text-sm">
              上部のキャラクターセレクターから使用キャラクターを選択すると、
              タイムスタンプとプレイリストが表示されます。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-timestamp" style={{ position: 'relative' }}>
      <AnimatedAccordion
        title="タイムスタンプ"
        isOpen={internalIsOpen}
        onToggle={(isOpen) => {
          setInternalIsOpen(isOpen);
          if (setIsOpen) {
            setIsOpen(isOpen);
          }
          // プレイリストを閉じる
          if (isOpen) {
            setInternalIsPlaylistOpen(false);
            if (setIsPlaylistOpen) {
              setIsPlaylistOpen(false);
            }
          }
        }}
        className="mb-4"
        contentClassName="p-4"
        playerContainerRef={playerContainerRef}
      >
        <TimestampList 
          timestamps={allMatchingTimestamps}
          onTimestampClick={onTimestampClick}
          currentTime={currentTime}
          selectedCharacter={selectedCharacter}
        />
      </AnimatedAccordion>

      <Playlist
        videos={videos}
        groupedVideos={groupedVideos}
        expandedDirectories={expandedDirectories}
        expandedGroups={expandedGroups}
        isOpen={internalIsPlaylistOpen}
        toggleDirectoryAccordion={toggleDirectoryAccordion}
        toggleAccordion={toggleAccordion}
        onVideoSelect={onVideoSelect || (() => {})}
        getCharacterGroupedVideos={getCharacterGroupedVideos}
        setIsOpen={(newIsOpen: boolean) => {
          setInternalIsPlaylistOpen(newIsOpen);
          if (setIsPlaylistOpen) {
            setIsPlaylistOpen(newIsOpen);
          }
          // タイムスタンプを閉じる
          if (newIsOpen) {
            setInternalIsOpen(false);
            if (setIsOpen) {
              setIsOpen(false);
            }
          }
        }}
        playerContainerRef={playerContainerRef}
      />
    </div>
  );
};

export default React.memo(YouTubeTimestamp); 