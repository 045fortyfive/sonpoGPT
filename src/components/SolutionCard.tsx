"use client";

import { Solution } from '@/types/survey';

interface SolutionCardProps {
  solution: Solution;
  onCta: (action: string, href?: string) => void;
}

/**
 * ソリューションカードコンポーネント
 * 
 * アンケート結果に基づいて推奨されるソリューションをカード形式で表示
 */
import { ParkingSimulation } from './solutions/ParkingSimulation';

export default function SolutionCard({ solution, onCta }: SolutionCardProps) {
  // 駐車場シェアリングの場合は専用シミュレーションコンポーネントを表示
  if (solution.id === 'parking-share') {
    return <ParkingSimulation />;
  }
  const handleCtaClick = () => {
    onCta(solution.cta.action || 'contact', solution.cta.href);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 text-2xl">
          {solution.icon}
        </div>

        {/* Title and Description */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg leading-tight">
            {solution.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {solution.description}
          </p>
        </div>
      </div>

      {/* Partner Info */}
      {solution.partner && (
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">提供:</span>
            {solution.partner.logo ? (
              <img
                src={solution.partner.logo}
                alt={solution.partner.name}
                className="h-4 object-contain"
              />
            ) : (
              <span className="text-xs font-medium text-gray-700">
                {solution.partner.name}
              </span>
            )}
            {solution.partner.url && (
              <a
                href={solution.partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                →
              </a>
            )}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleCtaClick}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {solution.cta.label}
      </button>

      {/* Action Indicator */}
      {solution.cta.action && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-400">
            {solution.cta.action === 'contact' && 'お問い合わせフォームへ'}
            {solution.cta.action === 'external' && '外部サイトへ移動'}
            {solution.cta.action === 'internal' && '詳細ページへ'}
          </span>
        </div>
      )}
    </div>
  );
}
