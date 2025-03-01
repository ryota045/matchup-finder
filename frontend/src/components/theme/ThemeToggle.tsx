'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

// 太陽アイコン（静的に定義）
const SunIcon = (
  <svg
    className="w-5 h-5 text-yellow-500"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
      clipRule="evenodd"
    />
  </svg>
);

// 月アイコン（静的に定義）
const MoonIcon = (
  <svg
    className="w-5 h-5 text-indigo-500"
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
);

/**
 * テーマ切り替えボタンコンポーネント
 * 最適化版: メモ化なし、直接DOM操作
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // テーマ切り替え関数
  function toggleTheme() {
    // 現在のテーマに基づいて切り替え
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    
    // テーマを切り替え
    setTheme(newTheme);
  }

  // 現在のアイコンを選択
  const Icon = resolvedTheme === 'dark' ? SunIcon : MoonIcon;
  
  // アクセシビリティラベル
  const ariaLabel = resolvedTheme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え';

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-muted/20 dark:bg-muted/5 hover:bg-muted/30 dark:hover:bg-muted/10"
      aria-label={ariaLabel}
      type="button"
    >
      {Icon}
    </button>
  );
} 