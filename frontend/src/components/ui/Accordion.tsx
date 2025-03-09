import React, { ReactNode } from 'react';

/**
 * アコーディオンヘッダーコンポーネントのプロパティ
 * @interface AccordionHeaderProps
 * @property {string} title - アコーディオンのタイトル
 * @property {number} [count] - 表示するアイテム数（オプション）
 * @property {boolean} isOpen - アコーディオンが開いているかどうか
 * @property {() => void} onClick - クリック時のコールバック関数
 */
export interface AccordionHeaderProps {
  title: string;
  count?: number;
  isOpen: boolean;
  onClick: () => void;
}

/**
 * アコーディオンのヘッダー部分を表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <AccordionHeader
 *   title="タイムスタンプ"
 *   isOpen={isOpen}
 *   onClick={() => setIsOpen(!isOpen)}
 * />
 * ```
 */
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({ title, isOpen, onClick }) => {
  return (
    <button
      className="w-full flex items-center justify-between p-3 bg-muted/20 dark:bg-muted/5 hover:bg-muted/30 dark:hover:bg-muted/10 border-b border-border dark:border-gray-800"
      onClick={onClick}
    >
      <h3 className="font-medium text-foreground">{title}</h3>
      <svg 
        className={`w-5 h-5 text-foreground transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
  );
};

/**
 * アコーディオンコンテンツコンポーネントのプロパティ
 * @interface AccordionContentProps
 * @property {ReactNode} children - アコーディオンの中身
 * @property {boolean} isOpen - アコーディオンが開いているかどうか
 * @property {string} [maxHeight='500px'] - コンテンツの最大高さ
 */
export interface AccordionContentProps {
  children: ReactNode;
  isOpen: boolean;
  maxHeight?: string;
}

/**
 * アコーディオンのコンテンツ部分を表示するコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <AccordionContent isOpen={isOpen} maxHeight="300px">
 *   <div>アコーディオンの中身</div>
 * </AccordionContent>
 * ```
 */
export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  isOpen,
  maxHeight = '500px'
}) => {
  return (
    <div 
      className={`transition-all duration-300 ease-in-out overflow-hidden bg-card dark:bg-card/80 ${
        isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

/**
 * アコーディオンコンポーネントのプロパティ
 * @interface AccordionProps
 * @property {string} title - アコーディオンのタイトル
 * @property {number} [count] - 表示するアイテム数（オプション）
 * @property {ReactNode} children - アコーディオンの中身
 * @property {boolean} [defaultOpen=false] - 初期状態で開いているかどうか
 * @property {string} [maxHeight='500px'] - コンテンツの最大高さ
 */
export interface AccordionProps {
  title: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
  maxHeight?: string;
}

/**
 * ヘッダーとコンテンツを含む完全なアコーディオンコンポーネント
 * 
 * @component
 * @example
 * ```tsx
 * <Accordion title="プレイリスト" count={5} defaultOpen={true}>
 *   <div>アコーディオンの中身</div>
 * </Accordion>
 * ```
 */
export const Accordion: React.FC<AccordionProps> = ({
  title,
  count,
  children,
  defaultOpen = false,
  maxHeight
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="bg-card dark:bg-card/95 rounded overflow-hidden mb-4 border border-border dark:border-gray-800">
      <AccordionHeader
        title={title}
        count={count}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      />
      <AccordionContent isOpen={isOpen} maxHeight={maxHeight}>
        {children}
      </AccordionContent>
    </div>
  );
};

export default Accordion; 