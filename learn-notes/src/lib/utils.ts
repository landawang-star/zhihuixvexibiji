import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Category } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 构建分类树
export function buildCategoryTree(categories: Category[]): Category[] {
  const map = new Map<string, Category>();
  const roots: Category[] = [];
  
  // 初始化 map
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });
  
  // 构建树
  categories.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      const parent = map.get(cat.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  
  // 排序
  return roots.sort((a, b) => a.order - b.order);
}

// 格式化日期
export function formatDate(date: Date | string | number | undefined | null): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// 生成唯一 ID
export function generateId(): string {
  return crypto.randomUUID();
}

// 获取分类 emoji
export function getCategoryEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    'python': '🐍',
    'ai': '🤖',
    'math': '📐',
    'photography': '📷',
    'design': '🎨',
    'reading': '📖',
    'music': '🎵',
    'data': '📊',
    'finance': '💰',
    'language': '🌍',
    'sport': '⚽',
    'default': '📁',
  };
  
  const lowerName = name.toLowerCase();
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) {
      return emoji;
    }
  }
  return emojiMap.default;
}
