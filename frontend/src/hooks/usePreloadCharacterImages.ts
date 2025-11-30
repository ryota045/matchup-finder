'use client';

import { useEffect, useRef } from 'react';
import { characterIcons } from '../data/characterData';

/**
 * キャラクターアイコン画像をブラウザのアイドル時間に事前読み込みするカスタムフック
 * これにより、モーダル表示時のちらつきを防止します
 */
export function usePreloadCharacterImages() {
  const preloadedRef = useRef(false);

  useEffect(() => {
    // 既にプリロード済みの場合はスキップ
    if (preloadedRef.current) return;

    const preloadImages = () => {
        console.log('preloadImages');
      characterIcons.forEach((icon) => {
        const img = new Image();
        img.src = icon.path;
      });
      preloadedRef.current = true;
    };

    // ブラウザがアイドル状態の時に画像をプリロード
    if ('requestIdleCallback' in window) {
      const idleCallbackId = requestIdleCallback(
        () => {
          preloadImages();
        },
        { timeout: 2000 } // 最大2秒待っても実行されなければ強制実行
      );

      return () => {
        cancelIdleCallback(idleCallbackId);
      };
    } else {
      // Safari等、requestIdleCallbackをサポートしていないブラウザ向けのフォールバック
      const timeoutId = setTimeout(preloadImages, 200);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []);
}

export default usePreloadCharacterImages;

