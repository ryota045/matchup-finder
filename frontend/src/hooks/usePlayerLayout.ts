import { useState, useRef, useCallback } from 'react';

/**
 * プレーヤーのレイアウトに関連する状態とロジックを管理するカスタムフック
 * 
 * @returns レイアウト関連の状態と関数
 */
const usePlayerLayout = () => {
  // プレイリストとタイムスタンプの開閉状態を管理
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true); // 初期状態でプレイリストを開く
  const [isTimestampOpen, setIsTimestampOpen] = useState(false);
  
  // モバイル表示用のタブ切り替え状態
  const [activeTab, setActiveTab] = useState<'playlist' | 'timestamp'>('playlist');
  
  // プレーヤーの高さを参照するためのref
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // アコーディオンの開閉状態を管理
  const [expandedGroups, setExpandedGroups] = useState<{[key: string]: boolean}>({});
  const [expandedDirectories, setExpandedDirectories] = useState<{[key: string]: boolean}>({});

  /**
   * プレイリストの開閉を制御する関数
   * @param isOpen プレイリストを開くかどうか
   */
  const handlePlaylistToggle = useCallback((isOpen: boolean) => {
    setIsPlaylistOpen(isOpen);
    
    // モバイル表示時はタブを切り替える
    if (isOpen && window.innerWidth < 640) {
      setActiveTab('playlist');
    }
    
    // player-md以上の場合は、プレイリストを開くとタイムスタンプを閉じる
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      setIsTimestampOpen(false);
    }
  }, []);

  /**
   * タイムスタンプの開閉を制御する関数
   * @param isOpen タイムスタンプを開くかどうか
   */
  const handleTimestampToggle = useCallback((isOpen: boolean) => {
    setIsTimestampOpen(isOpen);
    
    // モバイル表示時はタブを切り替える
    if (isOpen && window.innerWidth < 640) {
      setActiveTab('timestamp');
    }
    
    // player-md以上の場合は、タイムスタンプを開くとプレイリストを閉じる
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      setIsPlaylistOpen(false);
    }
  }, []);
  
  /**
   * タブ切り替えの処理
   * @param tab アクティブにするタブ
   */
  const handleTabChange = useCallback((tab: 'playlist' | 'timestamp') => {
    setActiveTab(tab);
    
    // タブに合わせてアコーディオンの開閉状態を更新
    if (tab === 'playlist') {
      setIsPlaylistOpen(true);
      setIsTimestampOpen(false);
    } else {
      setIsPlaylistOpen(false);
      setIsTimestampOpen(true);
    }
  }, []);

  /**
   * ディレクトリアコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   */
  const toggleDirectoryAccordion = useCallback((directory: string) => {
    setExpandedDirectories(prev => ({
      ...prev,
      [directory]: !prev[directory]
    }));
  }, []);

  /**
   * キャラクターグループアコーディオンの開閉を切り替える関数
   * @param directory ディレクトリ名
   * @param charKey キャラクターキー
   */
  const toggleAccordion = useCallback((directory: string, charKey: string) => {
    const uniqueKey = `${directory}-${charKey}`;
    setExpandedGroups(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey]
    }));
  }, []);

  return {
    isPlaylistOpen,
    isTimestampOpen,
    activeTab,
    playerContainerRef,
    expandedGroups,
    expandedDirectories,
    setIsPlaylistOpen,
    setIsTimestampOpen,
    setActiveTab,
    setExpandedGroups,
    setExpandedDirectories,
    handlePlaylistToggle,
    handleTimestampToggle,
    handleTabChange,
    toggleDirectoryAccordion,
    toggleAccordion
  };
};

export default usePlayerLayout; 