"use client";

import { useState } from "react";

interface Question {
    id: string;
    text: string;
    options: { value: string; label: string }[];
}

const questions: Question[] = [
    {
        id: "anxiety",
        text: "いま、保険や手続きについて不安はありますか？",
        options: [
            { value: "very", label: "とても不安" },
            { value: "little", label: "少し不安" },
            { value: "none", label: "特にない" },
            { value: "unknown", label: "何をすればいいか分からない" },
        ],
    },
    {
        id: "insurance",
        text: "現在の自動車保険について教えてください",
        options: [
            { value: "active", label: "まだ残っている" },
            { value: "cancelled", label: "もう解約した" },
            { value: "unknown", label: "よく分からない" },
        ],
    },
    {
        id: "nextCar",
        text: "次に乗る予定はありますか？",
        options: [
            { value: "decided", label: "すでに決まっている" },
            { value: "searching", label: "これから探す" },
            { value: "wait", label: "しばらく乗らない" },
            { value: "undecided", label: "未定" },
        ],
    },
    {
        id: "support",
        text: "どこまでサポートを希望しますか？",
        options: [
            { value: "organize", label: "必要な手続きを整理してほしい" },
            { value: "delegate", label: "保険の切替も任せたい" },
            { value: "info", label: "まずは状況だけ知りたい" },
        ],
    },
];

interface SurveyAProps {
    onComplete: (answers: Record<string, string>) => void;
}

export default function SurveyA({ onComplete }: SurveyAProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const handleSelect = (value: string) => {
        const question = questions[currentQuestion];
        const newAnswers = { ...answers, [question.id]: value };
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            onComplete(newAnswers);
        }
    };

    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Progress bar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg">
                <div className="h-1 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
                <div className="w-full max-w-lg">
                    {/* Question indicator */}
                    <div className="text-center mb-8 fade-in">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                {currentQuestion + 1}
                            </span>
                            <span>/ {questions.length}</span>
                        </span>
                    </div>

                    {/* Question card */}
                    <div className="fade-in" key={question.id}>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center leading-relaxed">
                            {question.text}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {question.options.map((option, index) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className="w-full p-5 text-left bg-gray-50 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 group slide-in"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-900 font-medium group-hover:text-blue-600 transition-colors">
                                            {option.label}
                                        </span>
                                        <svg
                                            className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
