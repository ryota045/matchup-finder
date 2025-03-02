import React from 'react';
import { MatchupItem, MatchupVideo } from '../../types/matchup';
import YouTubePlayerWithTimestamps from '../player/YouTubePlayerWithTimestamps';

/**
 * 検索結果コンポーネントのプロパティ
 */
interface SearchResultsProps {
  matchupVideos: MatchupVideo[];
  matchupLists: MatchupVideo[];
  selectedCharacter: string;
  selectedCharacters: string[];
  loading: boolean;
  error: string | null;
}

/**
 * 検索結果を表示するコンポーネント
 * 
 * @component
 */
const SearchResults: React.FC<SearchResultsProps> = ({
  matchupVideos,
  matchupLists,
  selectedCharacter,
  selectedCharacters,
  loading,
  error
}) => {
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>検索中...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        <h3 className="font-medium">エラーが発生しました</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="pt-4 md:p-4 bg-card rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">検索結果</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {matchupVideos.length}件のマッチアップ動画が見つかりました
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <YouTubePlayerWithTimestamps
            videos={matchupVideos}
            allVideos={matchupLists}
            selectedCharacter={selectedCharacter}
            selectedOpponentCharacters={selectedCharacters}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 