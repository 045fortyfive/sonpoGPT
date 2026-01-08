"use client";

import { useState, useMemo, useEffect } from "react";
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

interface SurveyProps {
  onComplete?: (answers: SurveyAnswers, solutions: ReturnType<typeof getRecommendedSolutions>) => void;
}

/**
 * 総合ソリューションアンケート - 統合コンポーネント
 * 
 * 買取完了画面をきっかけにしたアンケート
 * SurveyA/Bを統合し、新しいデータ構造とロジックを使用
 */
export default function Survey({ onComplete }: SurveyProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [scenario, setScenario] = useState<ScenarioId | null>(null);

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

  // 現在の質問を取得
  const currentQuestion = useMemo(() => {
    if (currentQuestionId === null) {
      // 最初の質問を取得
      return visibleQuestions[0] || null;
    }
    return visibleQuestions.find(q => q.id === currentQuestionId) || null;
  }, [currentQuestionId, visibleQuestions]);

  // 進捗を計算
  const progress = useMemo(() => {
    if (visibleQuestions.length === 0) return 100;
    const answeredCount = visibleQuestions.filter(q => answers[q.id]).length;
    return (answeredCount / visibleQuestions.length) * 100;
  }, [answers, visibleQuestions]);

  // 推奨ソリューションを取得
  const recommendedSolutions = useMemo(() => {
    return getRecommendedSolutions(answers);
  }, [answers]);

  // 選択肢を選択した時の処理
  const handleSelect = (value: string) => {
    if (!currentQuestion) return;

    const newAnswers: SurveyAnswers = { ...answers };

    if (currentQuestion.type === 'multiple') {
      // 複数選択の場合
      const currentValues = Array.isArray(newAnswers[currentQuestion.id])
        ? (newAnswers[currentQuestion.id] as string[])
        : newAnswers[currentQuestion.id]
          ? [newAnswers[currentQuestion.id] as string]
          : [];

      if (currentValues.includes(value)) {
        // 既に選択されている場合は削除
        newAnswers[currentQuestion.id] = currentValues.filter(v => v !== value);
      } else {
        // 選択されていない場合は追加
        newAnswers[currentQuestion.id] = [...currentValues, value];
      }
    } else {
      // 単一選択の場合
      newAnswers[currentQuestion.id] = value;
    }

    setAnswers(newAnswers);

    // 選択したオプションからシナリオを取得
    const selectedOption = currentQuestion.options.find(o => o.value === value);
    if (selectedOption?.nextScenario) {
      setScenario(selectedOption.nextScenario);
    }

    // 次の質問を取得（シナリオを考慮）
    const updatedScenario = selectedOption?.nextScenario || currentScenario;
    const nextQuestion = getNextQuestion(currentQuestion.id, newAnswers, updatedScenario);

    if (nextQuestion) {
      setCurrentQuestionId(nextQuestion.id);
    } else {
      // すべての質問が完了
      setIsComplete(true);
      if (onComplete) {
        onComplete(newAnswers, getRecommendedSolutions(newAnswers));
      }
    }
  };

  // CTAボタンの処理
  const handleCta = (action: string, href?: string) => {
    if (action === 'contact') {
      // お問い合わせフォームへ遷移
      window.location.href = '/inquiry';
    } else if (action === 'external' && href) {
      // 外部サイトへ遷移
      window.open(href, '_blank', 'noopener,noreferrer');
    } else if (action === 'internal' && href) {
      // 内部ページへ遷移
      window.location.href = href;
    }
  };

  // 完了画面
  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        {/* Progress bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg">
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 px-4 py-8">
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

  // 質問画面
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    );
  }

  const currentIndex = visibleQuestions.findIndex(q => q.id === currentQuestion.id);
  const questionNumber = currentIndex + 1;
  const totalQuestions = visibleQuestions.length;

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
                {questionNumber}
              </span>
              <span>/ {totalQuestions}</span>
            </span>
          </div>

          {/* Question card */}
          <div className="fade-in" key={currentQuestion.id}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center leading-relaxed">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentQuestion.type === 'multiple'
                  ? Array.isArray(answers[currentQuestion.id])
                    ? (answers[currentQuestion.id] as string[]).includes(option.value)
                    : false
                  : answers[currentQuestion.id] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full p-5 text-left border rounded-xl transition-all duration-200 group slide-in ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {currentQuestion.type === 'multiple' && (
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
                        {option.icon && (
                          <span className="text-xl">{option.icon}</span>
                        )}
                        <span className={`font-medium transition-colors ${
                          isSelected
                            ? 'text-blue-600'
                            : 'text-gray-900 group-hover:text-blue-600'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                      {currentQuestion.type === 'single' && (
                        <svg
                          className={`w-5 h-5 transition-colors ${
                            isSelected
                              ? 'text-blue-500'
                              : 'text-gray-300 group-hover:text-blue-500'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next button for multiple choice */}
            {currentQuestion.type === 'multiple' && (
              <button
                onClick={() => {
                  const nextQuestion = getNextQuestion(currentQuestion.id, answers, currentScenario);
                  if (nextQuestion) {
                    setCurrentQuestionId(nextQuestion.id);
                  } else {
                    setIsComplete(true);
                    if (onComplete) {
                      onComplete(answers, getRecommendedSolutions(answers));
                    }
                  }
                }}
                disabled={!answers[currentQuestion.id] || (Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as string[]).length === 0)}
                className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
