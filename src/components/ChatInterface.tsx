"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import InsuranceTimeline from "./InsuranceTimeline";
import SavingsOffer from "./SavingsOffer";
import { calculateSavings } from "@/lib/insurancePricing";

interface UserProfile {
    name: string;
    age: number;
    carName: string;
}

const mockProfile: UserProfile = {
    name: "山田 太郎",
    age: 43,
    carName: "トヨタ プリウス (2018年式)"
};

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    options?: { value: string; label: string }[];
    isGuidance?: boolean;
    timelinePattern?: "replacement" | "suspension" | "unknown";
    isTyping?: boolean; // New: track if message is currently typing
}

function Typewriter({ text, onComplete }: { text: string; onComplete?: () => void }) {
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[index]);
                setIndex((prev) => prev + 1);
            }, 20); // Faster typing
            return () => clearTimeout(timeout);
        } else if (onComplete) {
            onComplete();
        }
    }, [index, text, onComplete]);

    return <ReactMarkdown>{displayedText}</ReactMarkdown>;
}

interface ChatInterfaceProps {
    surveyType: "seller" | "inquiry";
}

// Initial reflection questions (Jab)
const initialQuestions = [
    {
        id: "satisfaction",
        text: `山田様、今回のプリウスの売却おつかれさまでした！\n\n率直な満足度はいかがでしたか？`,
        options: [
            { value: "very_satisfied", label: "とても満足" },
            { value: "satisfied", label: "おおむね満足" },
            { value: "neutral", label: "普通" },
            { value: "unsatisfied", label: "少し不満がある" },
        ],
    },
    {
        id: "good_point",
        text: "ありがとうございます。\n\n特に良かった点があれば教えてください。",
        options: [
            { value: "price", label: "査定価格" },
            { value: "speed", label: "対応の早さ" },
            { value: "staff", label: "スタッフの対応" },
            { value: "process", label: "手続きのスムーズさ" },
            { value: "other", label: "特になし" },
        ],
    },
    {
        id: "issue",
        text: "逆に、今回の売却で困ったことや、分かりにくかった点はありましたか？",
        options: [
            { value: "none", label: "特になかった" },
            { value: "price", label: "価格の説明" },
            { value: "process", label: "手続きの流れ" },
            { value: "time", label: "時間がかかった" },
            { value: "after", label: "売却後のことが不明" },
        ],
    },
];

// Insurance focused questions
const insuranceQuestions = [
    {
        id: "insurance_status",
        text: "今の自動車保険の状態をお伺いしてもよろしいでしょうか？",
        options: [
            { value: "active", label: "そのまま残っている" },
            { value: "cancelled", label: "すでに解約した" },
            { value: "unknown", label: "わからない" },
        ],
    },
    {
        id: "next_car",
        text: "今後のムダをなくすために教えてください。次の車のご予定はどうなっていますか？",
        options: [
            { value: "decided", label: "もう購入（または購入予定）が決まっている" },
            { value: "searching", label: "これから探す" },
            { value: "wait", label: "しばらく車に乗らない" },
        ],
    },
];

// Inquiry flow questions
const inquiryQuestions = [
    {
        id: "insurance",
        text: "こんにちは。保険や手続きについて、一緒に整理していきましょう。\n\n自動車保険の状況は？",
        options: [
            { value: "active", label: "まだ有効" },
            { value: "needSwitch", label: "切替が必要" },
            { value: "accident", label: "事故対応中" },
            { value: "unknown", label: "分からない" },
        ],
    },
    {
        id: "needs",
        text: "何を一番知りたいですか？",
        options: [
            { value: "todo", label: "今やるべきこと" },
            { value: "insurance", label: "保険の扱い" },
            { value: "accident", label: "事故対応" },
            { value: "nextCar", label: "次の車の保険" },
        ],
    },
];

// ガイダンスのシークエンスを生成（ケース別アドバイス）
interface GuidanceMessage {
    content: string;
}

function getGuidanceSequence(): GuidanceMessage[] {
    const sequence: GuidanceMessage[] = [];

    // ケース1: 納車まで期間が空く場合
    sequence.push({
        content: `**🚗 納車まで期間が空く場合**\n\n次の車まで1ヶ月以上空く場合は、「中断証明書」を発行しておくと、現在の等級を最大10年間保存できます。\nいざ次の車に乗る時にお得です。`
    });

    // ケース2: 切り替え（車両入替）の場合
    sequence.push({
        content: `**🔄 新しい車に切り替える場合**\n\n今の等級をそのまま引き継ぐことができます。\n必要なものは「新しい車の車検証」と「現在の保険証券」だけ。\n保険会社に連絡すれば手続きできます。`
    });

    // ケース3: 解約を考えている場合
    sequence.push({
        content: `**⚠️ 解約を考えている場合**\n\nそのまま解約してしまうと、今まで積み上げた等級（割引）がリセットされてしまいます。\n将来また車に乗る可能性があれば、「中断証明書」の発行をおすすめします。`
    });

    return sequence;
}


export default function ChatInterface({ surveyType }: ChatInterfaceProps) {
    const questions = surveyType === "seller"
        ? [...initialQuestions, ...insuranceQuestions]
        : inquiryQuestions;
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [surveyComplete, setSurveyComplete] = useState(false);
    const [showPriceInput, setShowPriceInput] = useState(false);
    const [showSavings, setShowSavings] = useState(false);
    const [showOffer, setShowOffer] = useState(false);
    const [chatEnabled, setChatEnabled] = useState(false);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [savingsData, setSavingsData] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Progress calculation
    const totalSteps = questions.length + (surveyType === "seller" ? 1 : 0); // +1 for price input if seller
    const currentStep = surveyComplete ? (showSavings ? totalSteps : questions.length) : currentQuestion;
    const progress = (currentStep / totalSteps) * 100;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentQuestion, showPriceInput, showSavings, showOffer, chatEnabled]);

    useEffect(() => {
        if (chatEnabled && inputRef.current) {
            inputRef.current.focus();
        }
    }, [chatEnabled]);

    // Show first question on mount
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { role: "assistant", content: questions[0].text, options: questions[0].options, isTyping: true },
            ]);
        }
    }, []);

    // Generate personalized feedback response
    const getFeedbackResponse = (issueValue: string): string => {
        switch (issueValue) {
            case "price":
                return "価格の説明がわかりにくく、大変ご迷惑をおかけして申し訳ございませんでした。\n\n今後の改善に向けて、社内で共有し徹底させていただきます。\n\n貴重なご意見ありがとうございました。";
            case "process":
                return "手続きの流れについて、ご不安な思いをさせてしまい申し訳ございません。\n\nより分かりやすい案内ができるよう、改善に努めてまいります。\n\nご指摘ありがとうございました。";
            case "time":
                return "お時間をとらせてしまい、大変申し訳ございませんでした。\n\nよりスムーズな対応ができるよう、オペレーションを見直してまいります。\n\n貴重なご意見をありがとうございます。";
            default:
                return "貴重なフィードバックをありがとうございます！\n\n山田様のお力になれて、スタッフ一同大変嬉しく思います。";
        }
    };

    const handleOptionSelect = (value: string, label: string) => {
        const q = questions[currentQuestion];
        const questionId = 'id' in q ? q.id : `q${currentQuestion}`;
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);

        // Add user's selection as a message
        setMessages((prev) => [...prev, { role: "user", content: label }]);

        if (currentQuestion < questions.length - 1) {
            const nextQ = questions[currentQuestion + 1];

            // Special handling for transition from issue question to insurance questions
            if (questionId === "issue") {
                const feedbackMsg = getFeedbackResponse(value);
                const bridgeMsg = "最後に、手続き忘れで損をしないために... 大切な車の『保険』の状況だけ確認させてください。";

                // 1. Feedback message (Apology/Thanks)
                setTimeout(() => {
                    setMessages((prev) => [...prev, { role: "assistant", content: feedbackMsg, isTyping: true }]);

                    // 2. Bridge message (Wait for previous to finish reading ~3s)
                    setTimeout(() => {
                        setMessages((prev) => [...prev, { role: "assistant", content: bridgeMsg, isTyping: true }]);

                        // 3. Next question (Wait for bridge ~2s)
                        setTimeout(() => {
                            setMessages((prev) => [...prev, { role: "assistant", content: nextQ.text, options: nextQ.options, isTyping: true }]);
                            setCurrentQuestion(currentQuestion + 1);
                        }, 2500);

                    }, 4000);

                }, 800);
            } else {
                // Normal transition (single question)
                setTimeout(() => {
                    setMessages((prev) => [...prev, { role: "assistant", content: nextQ.text, options: nextQ.options, isTyping: true }]);
                    setCurrentQuestion(currentQuestion + 1);
                }, 800);
            }
        } else {
            // Survey complete
            setSurveyComplete(true);

            // 1. Show "Organizing" state (not diagnosis)
            const thinkingMsg = "ちょっと整理しますね...";
            setTimeout(() => {
                setMessages((prev) => [...prev, { role: "assistant", content: thinkingMsg, isTyping: true }]);

                // 2. Play out the guidance sequence (case-by-case advice)
                const guidanceSequence = getGuidanceSequence();

                // Helper to chain messages
                let delay = 1500;

                // First, remove thinking msg and show first case
                setTimeout(() => {
                    setMessages((prev) => {
                        const filtered = prev.filter(m => m.content !== thinkingMsg);
                        return [
                            ...filtered,
                            {
                                role: "assistant",
                                content: "売却後の保険について、いくつかケースをご紹介しますね。",
                                isTyping: true
                            }
                        ];
                    });
                }, delay);

                // Show each case
                for (let i = 0; i < guidanceSequence.length; i++) {
                    delay += 3500;
                    setTimeout(() => {
                        setMessages((prev) => [
                            ...prev,
                            {
                                role: "assistant",
                                content: guidanceSequence[i].content,
                                isTyping: true
                            }
                        ]);
                    }, delay);
                }

                // 3. Ask about price
                delay += 4000;
                setTimeout(() => {
                    setMessages((prev) => [
                        ...prev,
                        { role: "assistant", content: "最後に、現在の自動車保険料は月額いくらくらいでしょうか？\n一番お得なプランと比較できます。", isTyping: true }
                    ]);

                    setTimeout(() => {
                        setShowPriceInput(true);
                    }, 1000);
                }, delay);
            }, 800);
        }
    };

    const handlePriceSelect = (price: number) => {
        setCurrentPrice(price);
        setShowPriceInput(false);

        // Calculate savings (Using 43 years old, 20 grade for Yamada-san)
        const savings = calculateSavings(price, 43, 20, true);
        setSavingsData(savings);

        setMessages((prev) => [
            ...prev,
            { role: "user", content: `現在の保険料: 月額 ¥${price.toLocaleString()} ` },
        ]);

        setTimeout(() => {
            setShowSavings(true);
            setShowOffer(true);
        }, 300);
    };

    const enableChat = () => {
        setChatEnabled(true);
        setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "何でもお気軽にご質問ください。" },
        ]);
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const chatMessages = messages
                .filter((m) => m.role !== "system" && !m.options && !m.isGuidance)
                .map((m) => ({ role: m.role, content: m.content }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...chatMessages, { role: "user", content: userMessage }],
                    surveyData: { type: surveyType, answers },
                }),
            });

            const data = await response.json();
            if (data.message) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
            }
        } catch {
            setMessages((prev) => [...prev, { role: "assistant", content: "エラーが発生しました。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">損保GPT</h1>
                            <p className="text-xs text-gray-500">保険・手続きの整理サポート</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* User Profile Card */}
            {!chatEnabled && (
                <div className="bg-gray-50 border-b border-gray-100 p-4">
                    <div className="max-w-3xl mx-auto flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                            {/* User Avatar Placeholder */}
                            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">{mockProfile.name} 様</span>
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{mockProfile.age}歳</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                査定・売却データ: <span className="text-blue-600 font-medium">{mockProfile.carName}</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Yumi Welcome Banner */}
            {!chatEnabled && messages.length > 0 && currentQuestion === 0 && (
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
                        <div className="relative w-64 h-64 mx-auto mb-4">
                            <video
                                src="https://assets.masco.dev/dd6028/yumi-fb5f/elegant-polite-bow-58eea82e.webm"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">愛車のご売却、ありがとうございます。</h2>
                        <p className="text-gray-600 text-sm">
                            アンケートを実施させていただくAIコンシェルジュのYumiです。
                        </p>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {!chatEnabled && (
                <div className="sticky top-[73px] z-10 bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-gray-100 shadow-sm">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                                {surveyComplete ? "診断完了" : `質問 ${currentStep + 1} / ${totalSteps}`
                                }
                            </span >
                            <span className="text-xs font-medium text-gray-400">{Math.round(progress)}%</span>
                        </div >
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div >
                </div >
            )
            }

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={`fade-in ${message.role === "user" ? "flex justify-end" : ""}`}>
                                <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse max-w-[85%]" : "max-w-full"}`}>
                                    {/* Avatar */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border ${message.role === "user"
                                        ? "bg-gray-100 border-gray-200"
                                        : "bg-blue-50 border-blue-100"
                                        }`}>
                                        {message.role === "user" ? (
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        ) : (
                                            <img
                                                src="/icon.png"
                                                alt="Yumi"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Message content */}
                                    <div className="flex-1">
                                        <div className={`inline-block px-4 py-3 rounded-2xl ${message.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-900"
                                            }`}>
                                            {message.role === "assistant" ? (
                                                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h2:text-base prose-h3:text-sm prose-p:text-[15px] prose-p:leading-relaxed prose-li:text-[15px] prose-strong:text-gray-900 prose-table:text-sm prose-code:bg-gray-200 prose-code:px-1 prose-code:rounded">
                                                    {message.isTyping ? (
                                                        <Typewriter
                                                            text={message.content}
                                                            onComplete={() => {
                                                                // Optional: keep as static once done
                                                            }}
                                                        />
                                                    ) : (
                                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                                            )}
                                        </div>

                                        {/* Options */}
                                        {message.options && !surveyComplete && index === messages.length - 1 && (
                                            <div className="mt-4 space-y-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">選択して進む</span>
                                                </div>
                                                {message.options.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleOptionSelect(option.value, option.label)}
                                                        className="flex items-center justify-between w-full text-left px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all duration-300 group"
                                                    >
                                                        <span className="text-gray-900 text-[15px] font-medium transition-colors group-hover:text-blue-700">{option.label}</span>
                                                        <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-blue-400 group-hover:bg-blue-50 transition-all">
                                                            <svg className="w-3.5 h-3.5 text-transparent group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Timeline Component */}
                                        {message.timelinePattern && (
                                            <div className="mt-4">
                                                <InsuranceTimeline pattern={message.timelinePattern} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3 fade-in">
                                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                                    <div className="w-full h-full bg-blue-50">
                                        <video
                                            src="https://assets.masco.dev/dd6028/yumi-fb5f/elegant-polite-bow-58eea82e.webm"
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover transform scale-150 translate-y-2"
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Price Input */}
                        {showPriceInput && !showSavings && (
                            <div className="fade-in-up">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4 shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                                    Q
                                                </div>
                                                <p className="text-sm font-bold text-blue-900">現在の保険料について</p>
                                            </div>
                                            <p className="text-[15px] text-gray-800 mb-4 leading-relaxed">
                                                削減額をシミュレーションするために、今の保険料を選択してください。
                                            </p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {[
                                                    { label: "月3,000円未満", value: 2500 },
                                                    { label: "月3,000〜5,000円", value: 4000 },
                                                    { label: "月5,000〜8,000円", value: 6500 },
                                                    { label: "月8,000円以上", value: 10000 },
                                                ].map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handlePriceSelect(option.value)}
                                                        className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-md transition-all duration-200 group"
                                                    >
                                                        <span className="text-gray-900 text-sm font-medium">{option.label}</span>
                                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Savings Display */}
                        {showSavings && savingsData && (
                            <div className="fade-in-up">
                                <SavingsOffer {...savingsData} />
                            </div>
                        )}

                        {/* Offer CTA */}
                        {showOffer && (
                            <div className="fade-in-up mt-6 space-y-4">
                                {/* Insurance Plan */}
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white border border-amber-100 flex items-center justify-center flex-shrink-0 p-2 shadow-sm">
                                            {/* Amazon Gift Card Icon Mock */}
                                            <div className="text-center">
                                                <span className="block text-[10px] font-bold text-gray-400">GIFT CARD</span>
                                                <span className="block text-lg font-black text-amber-500">¥1,000</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-1">【無料】保険見直し相談でプレゼント</h3>
                                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                                現在の保険料より<span className="font-bold text-red-500">年間約3.2万円</span>お安くなる可能性があります。<br />
                                                専門家とのオンライン相談（無料）で、<span className="font-bold text-amber-600">Amazonギフトカード1,000円分</span>を必ずプレゼント！
                                            </p>
                                            <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
                                                <span>予約して特典をもらう</span>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                            <p className="text-[10px] text-gray-400 mt-2">※ キャンペーン適用には条件があります。</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional question button */}
                                {!chatEnabled && (
                                    <button
                                        onClick={enableChat}
                                        className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm"
                                    >
                                        💬 他にも質問がある
                                    </button>
                                )}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Input area - only show when chat is enabled */}
            {
                chatEnabled && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-100">
                        <div className="max-w-3xl mx-auto px-4 py-4">
                            <div className="relative flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="ご質問を入力..."
                                    rows={1}
                                    className="flex-1 bg-transparent px-4 py-3 resize-none text-[15px] placeholder:text-gray-400 focus:outline-none max-h-32"
                                    disabled={isLoading}
                                    style={{ minHeight: "48px" }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={isLoading || !input.trim()}
                                    className="m-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-xs text-gray-400 text-center mt-3">
                                AIが回答します。詳細は保険会社にご確認ください。
                            </p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
