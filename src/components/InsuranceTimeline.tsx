interface TimelineStepProps {
    title: string;
    description: string;
    icon: "car" | "document" | "calendar" | "check";
    status?: "current" | "upcoming" | "optional";
}

function TimelineStep({ title, description, icon, status = "upcoming" }: TimelineStepProps) {
    const icons = {
        car: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
        document: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        calendar: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        check: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
    };

    const statusColors = {
        current: "bg-blue-600 text-white border-blue-600",
        upcoming: "bg-white text-gray-600 border-gray-300",
        optional: "bg-amber-50 text-amber-700 border-amber-300",
    };

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${statusColors[status]}`}>
                    {icons[icon]}
                </div>
                <div className="flex-1 w-0.5 bg-gray-200 min-h-[40px]" />
            </div>
            <div className="flex-1 pb-8">
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
}

interface InsuranceTimelineProps {
    pattern: "replacement" | "suspension" | "unknown";
}

export default function InsuranceTimeline({ pattern }: InsuranceTimelineProps) {
    if (pattern === "replacement") {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    手続きのタイムライン
                </h3>

                <div className="space-y-0">
                    <TimelineStep
                        icon="car"
                        title="今日：車を売却"
                        description="売却完了。保険はまだ有効な状態です。"
                        status="current"
                    />

                    <TimelineStep
                        icon="document"
                        title="1週間以内：保険会社に連絡"
                        description="「車両入替したい」と伝える。新しい車の情報を準備。"
                    />

                    <TimelineStep
                        icon="calendar"
                        title="納車日：保険開始"
                        description="新しい車の車検証を提出。保険が新しい車に切り替わります。"
                    />

                    <TimelineStep
                        icon="check"
                        title="完了"
                        description="等級を引き継いだまま、新しい車の保険がスタート！"
                    />
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">納車まで期間が空く場合</p>
                            <p className="text-sm text-gray-600">
                                売却から納車まで1ヶ月以上空く場合は、一時的に保険を「中断」できます。
                                保険料の無駄を省けます。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (pattern === "suspension") {
        return (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    手続きのタイムライン
                </h3>

                <div className="space-y-0">
                    <TimelineStep
                        icon="car"
                        title="今日：車を売却"
                        description="売却完了。保険はまだ有効な状態です。"
                        status="current"
                    />

                    <TimelineStep
                        icon="document"
                        title="14日以内：中断証明書を取得"
                        description="保険会社に連絡して「中断証明書」を発行してもらう。"
                    />

                    <TimelineStep
                        icon="calendar"
                        title="最大10年間保存"
                        description="等級を保存。次の車を購入するまで待機。"
                        status="optional"
                    />

                    <TimelineStep
                        icon="check"
                        title="次の車購入時：保険再開"
                        description="中断証明書を使って、等級を引き継いで保険を再開！"
                    />
                </div>

                <div className="mt-6 p-4 bg-white rounded-xl border border-amber-200">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">重要：14日以内に手続き</p>
                            <p className="text-sm text-gray-600">
                                売却日から14日を過ぎると、中断証明書が発行できなくなります。
                                早めに保険会社に連絡しましょう。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
