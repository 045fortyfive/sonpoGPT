import React from "react";

export function ParkingSimulation({ zipCode }: { zipCode?: string }) {
    // モックデータ: 稼働率30%
    const pricePerDay = 600;
    const monthlyRevenue = pricePerDay * 30 * 0.3; // 5400円

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 my-4 w-full">
            {/* Map Area Mock */}
            <div className="h-48 bg-gray-100 relative w-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 font-bold text-lg mb-2">Google Map Mock</p>
                    <p className="text-gray-500 text-sm">📍 {zipCode || "〒533-0023"}</p>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md animate-bounce">
                        相場: {pricePerDay}円/日
                    </div>
                </div>
            </div>

            {/* Simulation Result */}
            <div className="p-4">
                <h4 className="text-gray-900 font-bold mb-2">あなたの駐車場なら...</h4>
                <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-4">
                    <span className="text-gray-500 text-sm">月間予想収益</span>
                    <span className="text-2xl font-bold text-blue-600">
                        ¥{monthlyRevenue.toLocaleString()}
                    </span>
                </div>
                <button
                    className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors duration-200 shadow-md"
                    onClick={() => window.open('https://www.akippa.com/owner', '_blank')}
                >
                    シミュレーション詳細へ
                </button>
            </div>
        </div>
    );
}
