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
      
      if (youtubePlayer) { 
        const playerRect = youtubePlayer.getBoundingClientRect();
        const headerHeight = document.querySelector('.fixed-header')?.getBoundingClientRect().height || 0;
        
        // YouTubeプレーヤーの上部とヘッダーの下部が接触したかどうか
        const isPlayerTouchingHeader = playerRect.top <= headerHeight;

        console.log("playerRect.top", playerRect.top);
        console.log("playerRect.y", playerRect.y);
        
        // スクロール方向を検出
        const isScrollingDown = currentScrollY > lastScrollY.current;
        
        // プレーヤーがヘッダーに接触していて、下にスクロールしている場合はヘッダーを非表示
        if (isPlayerTouchingHeader && isScrollingDown) {
          setIsHeaderVisible(false);
        } else if (!isScrollingDown && !isPlayerTouchingHeader) {
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

  return (
    <header className={`fixed-header bg-background/80 dark:bg-background/90 border-b border-border transition-transform duration-300 ${!isHeaderVisible ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold gradient-text">マッチアップファインダー</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="flex items-center space-x-6">
          <ThemeToggle />
        </nav>
      </div>

    </header>
  );
};

export default Header; 