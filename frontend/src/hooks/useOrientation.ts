import { useState, useEffect } from 'react';

/**
 * 画面の向きと寸法を管理するカスタムフック
 * 
 * @returns 画面の向きと寸法に関する情報
 */
const useOrientation = () => {
  // 画面が横向きかどうかを検出するステート
  const [isLandscape, setIsLandscape] = useState(false);
  // 画面の短い方の寸法を保持するステート
  const [shortestDimension, setShortestDimension] = useState(0);

  // 画面の向きと寸法を検出するための関数
  const checkOrientation = () => {
    // window.innerWidthとwindow.innerHeightを比較して横向きかどうかを判定
    const isLandscapeMode = window.innerWidth > window.innerHeight;
    // 短い方の寸法を取得
    const shortest = Math.min(window.innerWidth, window.innerHeight);
    
    setIsLandscape(isLandscapeMode);
    setShortestDimension(shortest);
  };

  // コンポーネントマウント時と画面サイズ変更時に向きをチェック
  useEffect(() => {
    // 初期チェック
    checkOrientation();
    
    // リサイズイベントリスナーを追加
    window.addEventListener('resize', checkOrientation);
    
    // 向き変更イベントリスナーを追加（モバイルデバイス用）
    window.addEventListener('orientationchange', checkOrientation);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return {
    isLandscape,
    shortestDimension
  };
};

export default useOrientation; 