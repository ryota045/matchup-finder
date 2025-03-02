import React, { ReactNode, useRef, useEffect, useState, RefObject } from 'react';
import { motion } from 'framer-motion';
import { AccordionHeader } from './Accordion';

interface AnimatedAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxHeight?: string;
  playerContainerRef?: RefObject<HTMLDivElement | null>;
}

/**
 * アニメーション付きアコーディオンコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <AnimatedAccordion
 *   title="タイトル"
 *   isOpen={isOpen}
 *   onToggle={setIsOpen}
 * >
 *   <div>コンテンツ</div>
 * </AnimatedAccordion>
 * ```
 */
const AnimatedAccordion: React.FC<AnimatedAccordionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  className = "",
  contentClassName = "",
  maxHeight = "400px",
  playerContainerRef
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const [calculatedMaxHeight, setCalculatedMaxHeight] = useState<string>(maxHeight);
  
  // コンテンツの高さを計算
  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContentHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(contentRef.current);
      return () => {
        if (contentRef.current) {
          resizeObserver.unobserve(contentRef.current);
        }
      };
    }
  }, []);

  // プレーヤーの高さに基づいて最大高さを計算
  useEffect(() => {
    if (playerContainerRef?.current) {
      const updateMaxHeight = () => {
        const currentPlayerHeight = playerContainerRef.current?.clientHeight || 0;
        
        // アコーディオンヘッダーの高さを考慮
        const headerHeight = 40; // アコーディオンヘッダーの高さ（約40px）
        
        // YouTubeTimestampコンポーネント内のアコーディオンの数を取得
        const accordionsCount = document.querySelectorAll('.youtube-timestamp > div').length;
        
        // 閉じているアコーディオンの高さ（ヘッダーのみの高さ）
        const closedAccordionHeight = headerHeight;
        
        // 開いているアコーディオンの最大高さを計算
        // プレーヤーの高さ - 閉じているアコーディオンの高さ - 開いているアコーディオンのヘッダー高さ
        const openAccordionContentMaxHeight = currentPlayerHeight - ((accordionsCount - 1) * closedAccordionHeight) - headerHeight;
        
        // タブレットサイズでは高さを制限
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
        const tabletMaxHeight = 300; // タブレットでの最大高さ
        
        // 最小値を設定して、極端に小さくならないようにする
        const minHeight = 200; // 最小高さ（px）
        const adjustedHeight = isTablet 
          ? `${Math.min(tabletMaxHeight, Math.max(openAccordionContentMaxHeight, minHeight))}px`
          : `${Math.max(openAccordionContentMaxHeight, minHeight)}px`;
        
        setCalculatedMaxHeight(adjustedHeight);
      };

      // 初期計算
      updateMaxHeight();

      // リサイズ時に再計算
      const resizeObserver = new ResizeObserver(() => {
        updateMaxHeight();
      });

      const currentElement = playerContainerRef.current;
      if (currentElement) {
        resizeObserver.observe(currentElement);
        return () => {
          resizeObserver.unobserve(currentElement);
        };
      }
    }
  }, [playerContainerRef]);

  return (
    <div className={`mb-4 ${className}`} style={{ position: 'relative' }}>
      <div className="bg-card dark:bg-card/95 rounded-lg shadow-md dark:shadow-xl border border-border dark:border-gray-800 overflow-hidden">
        <AccordionHeader
          title={title}
          isOpen={isOpen}
          onClick={() => onToggle(!isOpen)}
        />
        <motion.div
          className="overflow-hidden"
          animate={{ 
            height: isOpen ? (contentHeight !== "auto" ? contentHeight : "auto") : 0,
            opacity: isOpen ? 1 : 0
          }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ position: 'relative' }}
        >
          <div 
            ref={contentRef}
            className={`overflow-y-auto custom-scrollbar bg-card dark:bg-card/95 border-t border-border dark:border-gray-800 ${contentClassName}`}
            style={{ maxHeight: playerContainerRef ? calculatedMaxHeight : maxHeight }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedAccordion; 