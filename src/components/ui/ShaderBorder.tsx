'use client';

import { PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

interface ShaderBorderProps {
  children: React.ReactNode;
  /** AI思考中かどうか */
  isThinking?: boolean;
  /** カスタムカラー（デフォルトは青系） */
  colors?: string[];
}

/**
 * AI思考中エフェクト用のシェーダーボーダーコンポーネント
 * 
 * PulsingBorderを使用して、AIが次の質問を生成中であることを視覚的に表現します。
 */
export function ShaderBorder({ 
  children, 
  isThinking = false,
  colors = ["#3b82f6", "#60a5fa", "#93c5fd"] // 青系
}: ShaderBorderProps) {
  return (
    <div className="relative">
      {/* 背景シェーダー - AI思考中のみ表示 */}
      <motion.div
        className="absolute inset-0 -z-10 translate-x-[-15%] translate-y-[-15%] scale-125"
        initial={{ opacity: 0 }}
        animate={{ opacity: isThinking ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <PulsingBorder
          colorBack="hsl(0, 0%, 100%)" // 白背景用調整
          colors={colors}
          roundness={0.18}
          thickness={0}
          softness={0}
          intensity={0.3}
          bloom={2}
          spots={2}
          spotSize={0.25}
          pulse={isThinking ? 0.5 : 0} // 思考中はパルスを有効化
          smoke={0.35}
          smokeSize={0.4}
          scale={0.7}
          rotation={0}
          offsetX={0}
          offsetY={0}
          speed={1}
        />
      </motion.div>
      {children}
    </div>
  );
}
