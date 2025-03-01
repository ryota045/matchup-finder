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
 *   title="プレイリスト"
 *   count={5}
 *   isOpen={isOpen}
 *   onClick={() => setIsOpen(!isOpen)}
 * />
 * ```
 */
export const AccordionHeader: React.FC<AccordionHeaderProps> = ({ 
  title, 
  count, 
  isOpen, 
  onClick 
}) => {
  return (
    <div 
      className="flex items-center justify-between p-3 bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
      onClick={onClick}
      aria-expanded={isOpen}
      role="button"
      tabIndex={0}
      aria-label={`${title}を開閉`}
    >
      <h3 className="text-lg font-semibold">
        {title} {count !== undefined && `(${count}件)`}
      </h3>
      <span 
        className={`text-gray-600 transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    </div>
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
      className={`transition-all duration-500 ease-in-out overflow-hidden ${
        isOpen ? `max-h-[${maxHeight}] opacity-100` : 'max-h-0 opacity-0'
      }`}
    >
      {children}
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
    <div className="bg-gray-100 rounded overflow-hidden mb-4">
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