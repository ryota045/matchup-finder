import { useState, useRef, useCallback } from 'react';

/**
 * プレーヤーのレイアウトに関連する状態とロジックを管理するカスタムフック
 *
 * @returns レイアウト関連の状態と関数
 */
const usePlayerLayout = () => {
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(true);
  const [isTimestampOpen, setIsTimestampOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlist' | 'timestamp'>('playlist');
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  // expandedCharacters: キャラクターの組み合わせアコーディオンの開閉状態（キー: charKey）
  const [expandedCharacters, setExpandedCharacters] = useState<{ [key: string]: boolean }>({});
  // expandedDirectories: キャラクター内チャンネルアコーディオンの開閉状態（キー: charKey-directory）
  const [expandedDirectories, setExpandedDirectories] = useState<{ [key: string]: boolean }>({});

  const handlePlaylistToggle = useCallback((isOpen: boolean) => {
    setIsPlaylistOpen(isOpen);
    if (isOpen && window.innerWidth < 640) {
      setActiveTab('playlist');
    }
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      setIsTimestampOpen(false);
    }
  }, []);

  const handleTimestampToggle = useCallback((isOpen: boolean) => {
    setIsTimestampOpen(isOpen);
    if (isOpen && window.innerWidth < 640) {
      setActiveTab('timestamp');
    }
    if (isOpen && window.matchMedia('(min-width: 1100px)').matches) {
      setIsPlaylistOpen(false);
    }
  }, []);

  const handleTabChange = useCallback((tab: 'playlist' | 'timestamp') => {
    setActiveTab(tab);
    if (tab === 'playlist') {
      setIsPlaylistOpen(true);
      setIsTimestampOpen(false);
    } else {
      setIsPlaylistOpen(false);
      setIsTimestampOpen(true);
    }
  }, []);

  /**
   * キャラクターグループアコーディオンの開閉を切り替える関数
   * @param charKey キャラクターの組み合わせキー
   */
  const toggleCharacterAccordion = useCallback((charKey: string) => {
    setExpandedCharacters(prev => ({
      ...prev,
      [charKey]: !prev[charKey],
    }));
  }, []);

  /**
   * キャラクター内チャンネルアコーディオンの開閉を切り替える関数
   * @param charKey キャラクターの組み合わせキー
   * @param directory チャンネル（ディレクトリ）名
   */
  const toggleDirectoryAccordion = useCallback((charKey: string, directory: string) => {
    const uniqueKey = `${charKey}-${directory}`;
    setExpandedDirectories(prev => ({
      ...prev,
      [uniqueKey]: !prev[uniqueKey],
    }));
  }, []);

  return {
    isPlaylistOpen,
    isTimestampOpen,
    activeTab,
    playerContainerRef,
    expandedCharacters,
    expandedDirectories,
    setIsPlaylistOpen,
    setIsTimestampOpen,
    setActiveTab,
    setExpandedCharacters,
    setExpandedDirectories,
    handlePlaylistToggle,
    handleTimestampToggle,
    handleTabChange,
    toggleCharacterAccordion,
    toggleDirectoryAccordion,
  };
};

export default usePlayerLayout;
