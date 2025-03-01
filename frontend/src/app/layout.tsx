import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/ui/Header";
import Footer from "../components/ui/Footer";
import { ThemeProvider } from "../components/theme/ThemeProvider";

// フォントの設定（パフォーマンス最適化）
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // 必要なときだけロード
});

// メタデータの設定
export const metadata: Metadata = {
  title: "マッチアップファインダー | スマブラSPの対戦動画検索",
  description: "スマブラSPのマッチアップ動画を簡単に検索・視聴できるWebアプリケーション",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
};

/**
 * ルートレイアウトコンポーネント
 * アプリケーション全体のレイアウトを定義
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* ダークモードのフラッシュを防止するインラインスクリプト（最小化版） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark')`
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark" storageKey="matchup-finder-theme">
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow main-content">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
