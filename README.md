# Matchup Finder

格闘ゲームのマッチアップ動画を簡単に検索・視聴できるWebアプリケーションです。キャラクター選択からタイムスタンプ付きの動画再生まで、格闘ゲームプレイヤーの学習をサポートします。

## 機能

- **キャラクター検索**: 使用キャラクターと対戦キャラクターを選択して、関連する動画を検索
- **タイムスタンプ付き動画再生**: 重要な場面にジャンプできるタイムスタンプ機能
- **プレイリスト管理**: ゲームやキャラクターごとに整理されたプレイリスト
- **レスポンシブデザイン**: モバイルからデスクトップまで、様々なデバイスに対応

## プロジェクト構成

```
matchup-finder/
├── frontend/          # フロントエンドアプリケーション (Next.js)
│   ├── src/
│   │   ├── app/       # Next.jsのページコンポーネント
│   │   │   ├── character/  # キャラクター関連コンポーネント
│   │   │   ├── player/     # プレーヤー関連コンポーネント
│   │   │   ├── playlist/   # プレイリスト関連コンポーネント
│   │   │   ├── timestamp/  # タイムスタンプ関連コンポーネント
│   │   │   ├── ui/         # 汎用UIコンポーネント
│   │   │   └── utils/      # ユーティリティ関数
│   │   └── data/      # 静的データ（キャラクター情報など）
│   ├── public/        # 静的ファイル（画像など）
│   └── package.json   # 依存関係
└── backend/           # バックエンドAPI (必要に応じて)
```

## 技術スタック

- **フロントエンド**:
  - Next.js (React)
  - TypeScript
  - Tailwind CSS
  - YouTube API

- **バックエンド** (必要に応じて):
  - Node.js
  - Express

## 開発環境のセットアップ

### 前提条件

- Node.js (v18以上)
- npm または yarn

### フロントエンドの起動

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/matchup-finder.git
cd matchup-finder

# フロントエンドの依存関係インストール
cd frontend
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

## 主要コンポーネント

### YouTubePlayerWithTimestamps

YouTube動画プレーヤーとタイムスタンプリストを組み合わせたコンポーネントです。タイムスタンプをクリックすると、動画の該当時間にジャンプします。

```tsx
<YouTubePlayerWithTimestamps
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  timestamps={[
    { time: 0, label: "イントロ" },
    { time: 30, label: "サビ" }
  ]}
  videos={relatedVideos}
  selectedVideoIndex={0}
  onVideoSelect={handleVideoSelect}
/>
```

### CharacterSelector

キャラクター選択用のコンポーネントです。使用キャラクターと対戦キャラクターを選択できます。

```tsx
<CharacterSelector 
  onSingleCharacterSelect={setSelectedCharacter}
  onMultipleCharactersSelect={setSelectedCharacters}
/>
```

## ディレクトリ構造の詳細

### components/

- **character/**: キャラクター選択関連のコンポーネント
  - `CharacterSelector.tsx`: キャラクター選択UI
  - `CharacterIcons.tsx`: キャラクターアイコン表示

- **player/**: 動画プレーヤー関連のコンポーネント
  - `youtube/`: YouTube関連のプレーヤーコンポーネント
    - `YouTubePlayer.tsx`: 基本的なYouTubeプレーヤー
    - `YouTubePlayerWithTimestamps.tsx`: タイムスタンプ付きプレーヤー
    - `YouTubeTimestamp.tsx`: タイムスタンプとプレイリスト管理

- **playlist/**: プレイリスト関連のコンポーネント
  - `Playlist.tsx`: プレイリスト表示
  - `DirectoryGroup.tsx`: ディレクトリごとのグループ
  - `CharacterGroup.tsx`: キャラクターごとのグループ
  - `VideoItem.tsx`: 個別の動画アイテム
  - `CharacterIconPair.tsx`: キャラクターアイコンのペア表示

- **timestamp/**: タイムスタンプ関連のコンポーネント
  - `TimestampList.tsx`: タイムスタンプのリスト表示
  - `TimestampItem.tsx`: 個別のタイムスタンプアイテム

- **ui/**: 汎用UIコンポーネント
  - `Accordion.tsx`: アコーディオンコンポーネント

- **utils/**: ユーティリティ関数
  - `YouTubeUtils.ts`: YouTube関連のユーティリティ関数

## 貢献方法

1. このリポジトリをフォークする
2. 機能ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. プルリクエストを作成する

## ライセンス

[MIT License](LICENSE)

## 連絡先

プロジェクトオーナー: [あなたの名前](mailto:your.email@example.com)

---

*このプロジェクトは開発中です。機能やドキュメントは随時更新されます。* 