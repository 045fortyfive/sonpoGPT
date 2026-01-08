import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="fade-in-up mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-xl shadow-blue-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">損保GPT</h1>
            <p className="text-gray-500 text-lg">保険・手続きの整理サポート</p>
          </div>

          {/* Entry points */}
          <div className="space-y-4 fade-in" style={{ animationDelay: "0.1s" }}>
            {/* Survey path - 総合ソリューションアンケート */}
            <Link
              href="/survey"
              className="block w-full group"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-semibold text-lg mb-1">総合ソリューション診断</p>
                    <p className="text-emerald-100 text-sm">車売却後の最適なソリューションを提案</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Seller path */}
            <Link
              href="/seller"
              className="block w-full group"
            >
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-semibold text-lg mb-1">車を売却した方</p>
                    <p className="text-blue-100 text-sm">保険・手続きを無料で整理します</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Inquiry path */}
            <Link
              href="/inquiry"
              className="block w-full group"
            >
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/30 hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-semibold text-lg text-gray-900 mb-1">お問い合わせの方</p>
                    <p className="text-gray-500 text-sm">保険や手続きが分からない方へ</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">完全無料</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">売り込みなし</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-400">
          本サービスは、必要な手続き先を整理することで運営されています。
        </p>
      </footer>
    </div>
  );
}
