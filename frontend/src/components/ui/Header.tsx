'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      // YouTubeプレーヤーの位置を検出
      const youtubePlayer = document.querySelector('.youtube-player-container');
      
      if (youtubePlayer && window.innerWidth < 768) { // モバイルサイズの場合のみ
        const playerRect = youtubePlayer.getBoundingClientRect();
        const headerHeight = document.querySelector('.fixed-header')?.getBoundingClientRect().height || 0;
        
        // YouTubeプレーヤーの上部とヘッダーの下部が接触したかどうか
        const isPlayerTouchingHeader = playerRect.top <= headerHeight;
        
        // スクロール方向を検出
        const isScrollingDown = currentScrollY > lastScrollY.current;
        
        // プレーヤーがヘッダーに接触していて、下にスクロールしている場合はヘッダーを非表示
        if (isPlayerTouchingHeader && isScrollingDown) {
          setIsHeaderVisible(false);
        } else if (!isScrollingDown) {
          // 上にスクロールしている場合はヘッダーを表示
          setIsHeaderVisible(true);
        }
      } else {
        // モバイルサイズでない場合は常に表示
        setIsHeaderVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'ホーム', path: '/' },
    { name: 'マッチアップ検索', path: '/matchup' },
    { name: '動画プレーヤー', path: '/youtube-example' },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`fixed-header bg-background/80 dark:bg-background/90 border-b border-border transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold gradient-text">マッチアップファインダー</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-foreground/80 hover:text-foreground transition-colors">
            ホーム
          </Link>
          <Link href="/matchup" className="text-foreground/80 hover:text-foreground transition-colors">
            検索
          </Link>
          {/* <Link href="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            このサイトについて
          </Link> */}
          <ThemeToggle />
        </nav>

        {/* モバイルメニューボタン */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="メニューを開く"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[var(--header-height)] left-0 right-0 bg-background dark:bg-card border-b border-border shadow-lg z-50">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              href="/" 
              className="p-2 rounded-md hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ホーム
            </Link>
            <Link 
              href="/matchup" 
              className="p-2 rounded-md hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              検索
            </Link>
            {/* <Link 
              href="/about" 
              className="p-2 rounded-md hover:bg-muted/20 dark:hover:bg-muted/10 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              このサイトについて
            </Link> */}
            <div className="p-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header; 