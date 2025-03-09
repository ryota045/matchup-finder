import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合するためのユーティリティ関数
 * clsxとtailwind-mergeを組み合わせて使用します
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 