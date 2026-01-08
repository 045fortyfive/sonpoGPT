'use client';

import { motion } from "framer-motion";
import { Lightbulb, Info, Sparkles } from "lucide-react";

export interface HintCardProps {
  /** ヒントのテキスト */
  text: string;
  /** ヒントのタイプ（デフォルト: 'info'） */
  type?: 'info' | 'tip' | 'nudge';
  /** アイコン（オプション、指定がない場合はタイプに応じたデフォルトアイコン） */
  icon?: React.ReactNode;
}

/**
 * ナーチャリング用のヒントカードコンポーネント
 * 
 * アンケート途中でユーザーをサポートするヒントを表示します。
 */
export function HintCard({ text, type = 'info', icon }: HintCardProps) {
  // タイプに応じたデフォルトアイコン
  const defaultIcon = icon || (
    type === 'tip' ? (
      <Lightbulb className="w-5 h-5" />
    ) : type === 'nudge' ? (
      <Sparkles className="w-5 h-5" />
    ) : (
      <Info className="w-5 h-5" />
    )
  );

  // タイプに応じたスタイル
  const typeStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    tip: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    nudge: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  };

  const styles = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${styles.bg} ${styles.border} border rounded-xl p-4 mb-4`}
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className={`${styles.iconBg} ${styles.iconColor} rounded-lg p-2 flex-shrink-0`}>
          {defaultIcon}
        </div>
        
        {/* テキスト */}
        <p className="text-sm text-gray-700 leading-relaxed flex-1 pt-0.5">
          {text}
        </p>
      </div>
    </motion.div>
  );
}
