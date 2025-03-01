# Matchup Finder

スマブラSPのマッチアップ動画を簡単に検索・視聴できるWebアプリケーションです。キャラクター選択からタイムスタンプ付きの動画再生まで、スマブラSPプレイヤーの学習をサポートします。

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

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと、アプリケーションが表示されます。

## 主要コンポーネント

### YouTubePlayerWithTimestamps

YouTube動画プレーヤーとタイムスタンプリストを組み合わせたコンポーネントです。タイムスタンプをクリックすると、動画の該当時間にジャンプします。

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

---

*このプロジェクトは開発中です。機能やドキュメントは随時更新されます。* 