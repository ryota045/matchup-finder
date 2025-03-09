'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
};

// テーマコンテキストの初期値
const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  resolvedTheme: 'dark',
};

// テーマコンテキストの作成
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

/**
 * システムのカラースキームを取得する関数
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * テーマプロバイダーコンポーネント
 * 最小限のDOM操作でテーマを切り替える
 */
export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'matchup-finder-theme',
  ...props
}: ThemeProviderProps) {
  // テーマの状態管理
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  // 実際に適用されるテーマ（system の場合は light か dark に解決される）
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // テーマを設定する関数
  function setTheme(newTheme: Theme) {
    // テーマ状態を更新
    setThemeState(newTheme);
    
    // 解決されたテーマを計算
    const resolvedValue = newTheme === 'system' ? getSystemTheme() : newTheme;
    
    // 解決されたテーマを更新
    setResolvedTheme(resolvedValue);
    
    // DOM操作: クラスを更新
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedValue);
      
      // ローカルストレージに保存
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        // エラーは無視
      }
    }
  }

  // 初期化処理
  useEffect(() => {
    // SSRの場合は何もしない
    if (typeof window === 'undefined') return;
    
    // ローカルストレージからテーマを取得
    let savedTheme: Theme | null = null;
    try {
      savedTheme = localStorage.getItem(storageKey) as Theme | null;
    } catch (e) {
      // エラーは無視
    }
    
    // 保存されたテーマがあればそれを適用、なければデフォルトテーマを適用
    const themeToApply = savedTheme || defaultTheme;
    
    // テーマを適用
    setTheme(themeToApply);
  }, [defaultTheme, storageKey]);

  // システムのカラースキームが変更されたときの処理
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;
    
    function handleChange() {
      // システムテーマが変更された場合、即座にテーマを更新
      const newResolvedTheme = getSystemTheme();
      
      // DOM操作: クラスを更新
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newResolvedTheme);
      
      // 状態を更新
      setResolvedTheme(newResolvedTheme);
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * テーマフックを使用するためのカスタムフック
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 