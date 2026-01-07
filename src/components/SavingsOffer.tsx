import { topInsurers } from "@/lib/insurancePricing";

interface SavingsOfferProps {
    currentMonthlyPrice: number;
    recommendedPrice: number;
    monthlySavings: number;
    yearlySavings: number;
    savingsPercentage: number;
}

export default function SavingsOffer({
    currentMonthlyPrice,
    recommendedPrice,
    monthlySavings,
    yearlySavings,
    savingsPercentage,
}: SavingsOfferProps) {
    if (monthlySavings <= 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">すでに適正価格です！</h3>
                        <p className="text-sm text-gray-600">
                            現在の保険料は市場相場と比較して適正な範囲内です。
                            引き続き、車両入替などの手続きをスムーズに進めましょう。
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">保険料を削減できる可能性があります</h3>
                    <p className="text-sm text-gray-600">
                        あなたの年代・等級なら、もっとお得な保険料で同等の補償が受けられます
                    </p>
                </div>
            </div>

            {/* Savings Display */}
            <div className="bg-white rounded-xl p-5 mb-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">現在の保険料</p>
                        <p className="text-2xl font-bold text-gray-900">¥{currentMonthlyPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">/ 月</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">推奨保険料</p>
                        <p className="text-2xl font-bold text-emerald-600">¥{recommendedPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">/ 月</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">月間削減額</span>
                        <span className="text-lg font-bold text-emerald-600">-¥{monthlySavings.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">年間削減額</span>
                        <span className="text-xl font-bold text-emerald-600">-¥{yearlySavings.toLocaleString()}</span>
                    </div>
                    {savingsPercentage > 0 && (
                        <div className="mt-3 inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                            約{savingsPercentage}%削減
                        </div>
                    )}
                </div>
            </div>

            {/* Top Insurers */}
            <div className="bg-white rounded-xl p-5">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">おすすめの保険会社</h4>
                <div className="space-y-3">
                    {topInsurers.map((insurer, index) => (
                        <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{insurer.name}</p>
                                {insurer.discount && (
                                    <p className="text-xs text-emerald-600 font-medium">最大¥{insurer.discount.toLocaleString()}割引</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">{insurer.features.join(" / ")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
