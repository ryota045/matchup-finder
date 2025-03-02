import React from 'react';

/**
 * モバイルタブコントロールのプロパティ
 * @interface MobileTabControlsProps
 * @property {'playlist' | 'timestamp'} activeTab - アクティブなタブ
 * @property {(tab: 'playlist' | 'timestamp') => void} onTabChange - タブが変更されたときのコールバック関数
 */
interface MobileTabControlsProps {
  activeTab: 'playlist' | 'timestamp';
  onTabChange: (tab: 'playlist' | 'timestamp') => void;
}

/**
 * モバイル表示時のタブ切り替えUIコンポーネント
 * 
 * スマホ表示時のみ表示されるタブ切り替えUIを提供します。
 * 
 * @component
 */
const MobileTabControls: React.FC<MobileTabControlsProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className="flex sm:hidden mb-2 border-b border-border dark:border-gray-800 bg-card dark:bg-card/95 rounded-t-lg shadow-md dark:shadow-xl">
      <button
        className={`flex-1 py-3 px-4 text-center font-medium rounded-tl-lg transition-colors ${
          activeTab === 'playlist' 
            ? 'text-primary border-b-2 border-primary bg-background/50 dark:bg-background/20' 
            : 'text-muted-foreground hover:bg-background/30 dark:hover:bg-background/10'
        }`}
        onClick={() => onTabChange('playlist')}
      >
        プレイリスト
      </button>
      <button
        className={`flex-1 py-3 px-4 text-center font-medium rounded-tr-lg transition-colors ${
          activeTab === 'timestamp' 
            ? 'text-primary border-b-2 border-primary bg-background/50 dark:bg-background/20' 
            : 'text-muted-foreground hover:bg-background/30 dark:hover:bg-background/10'
        }`}
        onClick={() => onTabChange('timestamp')}
      >
        タイムスタンプ
      </button>
    </div>
  );
};

export default MobileTabControls; 