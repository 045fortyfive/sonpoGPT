'use client';

import React, { useState, useEffect } from "react";

interface ParkingSimulationProps {
    zipCode?: string;
}

/**
 * 駐車場収益シミュレーションコンポーネント
 * 
 * Google Maps Embed API（iframe）を使用して郵便番号周辺の地図を表示
 * 収益シミュレーションを稼働率30%で計算
 */
export function ParkingSimulation({ zipCode }: ParkingSimulationProps) {
    const [address, setAddress] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    // モックデータ: 稼働率30%
    const pricePerDay = 600;
    const monthlyRevenue = pricePerDay * 30 * 0.3; // 5400円

    // 郵便番号から住所を取得（無料API使用）
    useEffect(() => {
        const fetchAddress = async () => {
            if (!zipCode) {
                setIsLoading(false);
                return;
            }

            try {
                // 郵便番号のハイフンを除去
                const cleanZip = zipCode.replace(/-/g, '');
                const response = await fetch(
                    `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`
                );
                const data = await response.json();

                if (data.results && data.results[0]) {
                    const result = data.results[0];
                    setAddress(`${result.address1}${result.address2}${result.address3}`);
                }
            } catch (error) {
                console.error('住所取得エラー:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAddress();
    }, [zipCode]);

    // 地図表示用のクエリ（住所または郵便番号）
    const mapQuery = address || zipCode || "東京都";

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 my-4 w-full">
            {/* Google Maps Embed (iframe) */}
            <div className="h-48 w-full relative">
                {isLoading ? (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <div className="animate-pulse text-gray-400">地図を読み込み中...</div>
                    </div>
                ) : (
                    <iframe
                        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed&z=15`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                )}

                {/* 相場チップ */}
                <div className="absolute bottom-3 left-3">
                    <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        💰 相場: {pricePerDay}円/日
                    </div>
                </div>
            </div>

            {/* 住所表示 */}
            {address && (
                <div className="px-4 pt-3 pb-1">
                    <p className="text-sm text-gray-500">
                        📍 {address}
                    </p>
                </div>
            )}

            {/* Simulation Result */}
            <div className="p-4">
                <h4 className="text-gray-900 font-bold mb-2">あなたの駐車場なら...</h4>
                <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-4">
                    <span className="text-gray-500 text-sm">月間予想収益（稼働率30%）</span>
                    <span className="text-2xl font-bold text-blue-600">
                        ¥{monthlyRevenue.toLocaleString()}
                    </span>
                </div>
                <button
                    className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors duration-200 shadow-md"
                    onClick={() => window.open('https://www.akippa.com/owner', '_blank')}
                >
                    詳しく相談する
                </button>
            </div>
        </div>
    );
}
