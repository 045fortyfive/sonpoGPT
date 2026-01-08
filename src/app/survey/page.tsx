"use client";

import ChatSurvey from "@/components/ChatSurvey";
import { getRecommendedSolutions } from "@/lib/surveyLogic";
import { SurveyAnswers } from "@/types/survey";

/**
 * 総合ソリューションアンケートページ
 * 
 * 車売却をきっかけにしたアンケートから、複数ソリューションへ導く
 * 対話型チャットUI版を使用
 */
export default function SurveyPage() {
  const handleComplete = (answers: SurveyAnswers, solutions: ReturnType<typeof getRecommendedSolutions>) => {
    // アンケート完了時の処理
    console.log("Survey completed:", { answers, solutions });
    
    // 必要に応じて、APIに送信したり、ローカルストレージに保存したりできます
    // 例: localStorage.setItem('surveyResults', JSON.stringify({ answers, solutions }));
  };

  return <ChatSurvey onComplete={handleComplete} />;
}
