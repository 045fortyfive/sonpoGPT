"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { SurveyQuestion, SurveyAnswers, ScenarioId } from '@/types/survey';
import { surveyQuestions } from '@/data/surveyQuestions';
import { 
  getNextQuestion, 
  getRecommendedSolutions, 
  shouldShowQuestion,
  getFilteredQuestions,
  getScenarioFromAnswers
} from '@/lib/surveyLogic';
import SolutionCard from './SolutionCard';
import { ShaderBorder } from './ui/ShaderBorder';
import { motion, AnimatePresence } from "framer-motion";

interface SurveyProps {
  onComplete?: (answers: SurveyAnswers, solutions: ReturnType<typeof getRecommendedSolutions>) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  options?: { value: string; label: string; icon?: string }[];
  timestamp: Date;
}

/**
 * 総合ソリューションアンケート - チャットUI版
 * 
 * 対話型チャットUIとして実装。AI思考中ステートのハンドリング含む
 */
export default function ChatSurvey({ onComplete }: SurveyProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [scenario, setScenario] = useState<ScenarioId | null>(null);
  const [isReasoning, setIsReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 回答からシナリオを取得（回答が更新されたら再計算）
  const scenarioFromAnswers = useMemo(() => {
    return getScenarioFromAnswers(answers);
  }, [answers]);

  // シナリオが確定したらステートを更新
  useEffect(() => {
    if (scenarioFromAnswers && scenarioFromAnswers !== scenario) {
      setScenario(scenarioFromAnswers);
    }
  }, [scenarioFromAnswers, scenario]);

  const currentScenario = scenarioFromAnswers || scenario;

  // 表示すべき質問のリストを計算（シナリオ分岐対応）
  const visibleQuestions = useMemo(() => {
    const filtered = getFilteredQuestions(surveyQuestions, currentScenario);
    return filtered.filter(q => shouldShowQuestion(q, answers, currentScenario));
  }, [answers, currentScenario]);

  // 推奨ソリューションを取得
  const recommendedSolutions = useMemo(() => {
    return getRecommendedSolutions(answers);
  }, [answers]);

  // スクロールを最下部に
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isReasoning]);

  // 最初の質問を表示（導入文付き）
  useEffect(() => {
    if (messages.length === 0 && visibleQuestions.length > 0) {
      const firstQuestion = visibleQuestions[0];
      
      // 買取完了への感謝と導入文
      const welcomeMessage: ChatMessage = {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        content: 'お車のご売却、おつかれさまでした！\n\n売却後も、保険や手続きなど気になることがあると思います。\n\nあなたにぴったりのサポートをご提案するために、いくつか質問させてください。',
        timestamp: new Date()
      };
      
      // 最初の質問
      const firstQuestionMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: firstQuestion.text,
        options: firstQuestion.options.map(opt => ({
          value: opt.value,
          label: opt.label,
          icon: opt.icon
        })),
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage, firstQuestionMessage]);
    }
  }, [visibleQuestions]);

  // 選択肢を選択した時の処理
  const handleSelect = async (value: string, questionId: string) => {
    if (isReasoning) return;

    const question = visibleQuestions.find(q => q.id === questionId);
    if (!question) return;

    const newAnswers: SurveyAnswers = { ...answers };

    if (question.type === 'multiple') {
      // 複数選択の場合
      const currentValues = Array.isArray(newAnswers[questionId])
        ? (newAnswers[questionId] as string[])
        : newAnswers[questionId]
          ? [newAnswers[questionId] as string]
          : [];

      if (currentValues.includes(value)) {
        // 既に選択されている場合は削除
        newAnswers[questionId] = currentValues.filter(v => v !== value);
      } else {
        // 選択されていない場合は追加
        newAnswers[questionId] = [...currentValues, value];
      }
    } else {
      // 単一選択の場合
      newAnswers[questionId] = value;
      
      // 選択したオプションのラベルを取得
      const selectedOption = question.options.find(o => o.value === value);
      const selectedLabel = selectedOption?.label || value;

      // ユーザーの回答をメッセージに追加し、回答済みの質問メッセージから選択肢を削除（ループバグ防止）
      setMessages(prev => {
        const updated = prev.map(msg => {
          // この質問に対応するアシスタントメッセージを探す
          if (msg.role === 'assistant' && msg.options && 
              (msg.content === question.text || 
               msg.options.some(opt => question.options.some(o => o.value === opt.value)))) {
            // 選択肢を削除（回答済みなので選択肢は不要）
            return { ...msg, options: undefined };
          }
          return msg;
        });
        
        // ユーザーの回答を追加
        return [...updated, {
          id: `msg-${Date.now()}`,
          role: 'user',
          content: selectedLabel,
          timestamp: new Date()
        }];
      });
    }

    setAnswers(newAnswers);

    // 選択したオプションからシナリオを取得
    const selectedOption = question.options.find(o => o.value === value);
    if (selectedOption?.nextScenario) {
      setScenario(selectedOption.nextScenario);
    }

    // AI思考中ステートを有効化
    setIsReasoning(true);

    // 次の質問を取得（シナリオを考慮）
    const updatedScenario = selectedOption?.nextScenario || currentScenario;
    
    // 少し待機してから次の質問を表示（AI思考中の演出）
    await new Promise(resolve => setTimeout(resolve, 1500));

    const nextQuestion = getNextQuestion(questionId, newAnswers, updatedScenario);

    setIsReasoning(false);

    if (nextQuestion) {
      // 次の質問をメッセージに追加
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextQuestion.text,
        options: nextQuestion.options.map(opt => ({
          value: opt.value,
          label: opt.label,
          icon: opt.icon
        })),
        timestamp: new Date()
      }]);
    } else {
      // すべての質問が完了
      setIsComplete(true);
      if (onComplete) {
        onComplete(newAnswers, getRecommendedSolutions(newAnswers));
      }
    }
  };

  // 複数選択の場合の「次へ」ボタン処理
  const handleNext = async (questionId: string) => {
    if (isReasoning) return;

    const question = visibleQuestions.find(q => q.id === questionId);
    if (!question || question.type !== 'multiple') return;

    const answer = answers[questionId];
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;

    // AI思考中ステートを有効化
    setIsReasoning(true);

    // 少し待機してから次の質問を表示
    await new Promise(resolve => setTimeout(resolve, 1500));

    const nextQuestion = getNextQuestion(questionId, answers, currentScenario);

    setIsReasoning(false);

    if (nextQuestion) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: nextQuestion.text,
        options: nextQuestion.options.map(opt => ({
          value: opt.value,
          label: opt.label,
          icon: opt.icon
        })),
        timestamp: new Date()
      }]);
    } else {
      setIsComplete(true);
      if (onComplete) {
        onComplete(answers, getRecommendedSolutions(answers));
      }
    }
  };

  // CTAボタンの処理
  const handleCta = (action: string, href?: string) => {
    if (action === 'contact') {
      window.location.href = '/inquiry';
    } else if (action === 'external' && href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (action === 'internal' && href) {
      window.location.href = href;
    }
  };

  // 完了画面
  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* Results */}
        <div className="flex-1 px-4 py-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            {/* Completion message */}
            <div className="text-center mb-8 fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                診断が完了しました
              </h2>
              <p className="text-gray-600">
                あなたにぴったりのソリューションをご提案します
              </p>
            </div>

            {/* Solutions */}
            {recommendedSolutions.length > 0 ? (
              <div className="space-y-4">
                {recommendedSolutions.map((solution) => (
                  <SolutionCard
                    key={solution.id}
                    solution={solution}
                    onCta={handleCta}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                <p className="text-gray-600">
                  ご回答ありがとうございました。お問い合わせフォームからご相談ください。
                </p>
                <button
                  onClick={() => handleCta('contact')}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                >
                  お問い合わせする
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 現在の質問を取得（最後のアシスタントメッセージから）
  const getCurrentQuestion = (): SurveyQuestion | null => {
    // 最後のアシスタントメッセージを探す
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant' && messages[i].options) {
        // このメッセージに対応する質問を探す
        const question = visibleQuestions.find(q => {
          // 質問のテキストとメッセージのコンテンツが一致するか、またはオプションが一致するか
          return q.text === messages[i].content || 
                 q.options.some(o => messages[i].options?.some(opt => opt.value === o.value));
        });
        if (question) return question;
      }
    }
    return null;
  };

  const currentQuestion = getCurrentQuestion();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Chat Messages */}
      <div className="flex-1 px-4 py-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* 選択肢 */}
                  {message.options && message.options.length > 0 && (() => {
                    // このメッセージに対応する質問を探す（visibleQuestionsとsurveyQuestionsの両方から）
                    const questionForMessage = visibleQuestions.find(q => 
                      q.text === message.content || 
                      q.options.some(o => message.options?.some(opt => opt.value === o.value))
                    ) || surveyQuestions.find(q => 
                      q.text === message.content || 
                      q.options.some(o => message.options?.some(opt => opt.value === o.value))
                    );
                    
                    if (!questionForMessage) return null;

                    // 単一選択で回答済みの場合は選択肢を表示しない
                    if (questionForMessage.type === 'single' && answers[questionForMessage.id]) {
                      return null;
                    }

                    // 複数選択で回答がない場合も、メッセージが古い可能性があるので確認
                    if (questionForMessage.type === 'multiple' && !answers[questionForMessage.id]) {
                      // 回答がない場合は表示しない（次の質問に進んでいる可能性がある）
                      return null;
                    }

                    return (
                      <div className="mt-4 space-y-2">
                        {message.options.map((option) => {
                          const isSelected = questionForMessage.type === 'multiple'
                            ? Array.isArray(answers[questionForMessage.id])
                              ? (answers[questionForMessage.id] as string[]).includes(option.value)
                              : false
                            : answers[questionForMessage.id] === option.value;

                          return (
                            <button
                              key={option.value}
                              onClick={() => handleSelect(option.value, questionForMessage.id)}
                              disabled={isReasoning}
                              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-600'
                                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 text-gray-900'
                              } ${isReasoning ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center gap-2">
                                {questionForMessage.type === 'multiple' && (
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                )}
                                {option.icon && <span className="text-xl">{option.icon}</span>}
                                <span className="font-medium">{option.label}</span>
                              </div>
                            </button>
                          );
                        })}
                        
                        {/* 複数選択の場合の「次へ」ボタン */}
                        {questionForMessage.type === 'multiple' && (
                          <button
                            onClick={() => handleNext(questionForMessage.id)}
                            disabled={
                              !answers[questionForMessage.id] || 
                              (Array.isArray(answers[questionForMessage.id]) && (answers[questionForMessage.id] as string[]).length === 0) || 
                              isReasoning
                            }
                            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            次へ
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI思考中バブル */}
          {isReasoning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <ShaderBorder isThinking={true}>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-gray-600 text-sm">考え中...</span>
                  </div>
                </div>
              </ShaderBorder>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
