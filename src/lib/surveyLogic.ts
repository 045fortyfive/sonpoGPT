/**
 * 総合ソリューションアンケート - ロジック実装
 * 
 * アンケート回答から推奨ソリューションを算出するロジック
 */

import { SurveyQuestion, Solution } from '@/types/survey';
import { surveyQuestions } from '@/data/surveyQuestions';
import { solutions } from '@/data/solutions';

/**
 * アンケート回答から推奨ソリューションを取得
 * 
 * @param answers アンケートの回答（質問IDをキー、回答値を値とする）
 * @returns 推奨されるソリューションのリスト（優先度順）
 */
export function getRecommendedSolutions(
  answers: Record<string, string | string[]>
): Solution[] {
  const solutionIds = new Set<string>();

  // 各回答から関連ソリューションを収集
  for (const question of surveyQuestions) {
    const answer = answers[question.id];
    if (!answer) continue;

    const answerValues = Array.isArray(answer) ? answer : [answer];
    
    for (const value of answerValues) {
      const option = question.options.find(o => o.value === value);
      if (option?.solutionIds) {
        option.solutionIds.forEach(id => solutionIds.add(id));
      }
    }
  }

  // ソリューションを優先度順に並べ替え
  return solutions
    .filter(s => solutionIds.has(s.id))
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 質問を表示すべきかどうかを判定（条件分岐対応）
 * 
 * @param question 判定対象の質問
 * @param answers 現在までの回答
 * @returns 質問を表示すべきかどうか
 */
export function shouldShowQuestion(
  question: SurveyQuestion,
  answers: Record<string, string | string[]>
): boolean {
  // showIfが設定されていない場合は常に表示
  if (!question.showIf) return true;
  
  // 参照する質問の回答を取得
  const answer = answers[question.showIf.questionId];
  if (!answer) return false;
  
  // 回答値を配列に変換
  const answerValues = Array.isArray(answer) ? answer : [answer];
  
  // 条件に一致する値が含まれているか確認
  return question.showIf.values.some(v => answerValues.includes(v));
}

/**
 * 次の質問を取得
 * 
 * @param currentQuestionId 現在の質問ID
 * @param answers 現在までの回答
 * @returns 次の質問、またはnull（すべて完了した場合）
 */
export function getNextQuestion(
  currentQuestionId: string | null,
  answers: Record<string, string | string[]>
): SurveyQuestion | null {
  const currentIndex = currentQuestionId
    ? surveyQuestions.findIndex(q => q.id === currentQuestionId)
    : -1;

  // 次の質問を探す
  for (let i = currentIndex + 1; i < surveyQuestions.length; i++) {
    const question = surveyQuestions[i];
    if (shouldShowQuestion(question, answers)) {
      return question;
    }
  }

  // すべての質問が完了
  return null;
}

/**
 * アンケートが完了したかどうかを判定
 * 
 * @param answers 現在までの回答
 * @returns アンケートが完了したかどうか
 */
export function isSurveyComplete(
  answers: Record<string, string | string[]>
): boolean {
  // すべての質問に対して回答があるか確認
  for (const question of surveyQuestions) {
    if (shouldShowQuestion(question, answers)) {
      if (!answers[question.id]) {
        return false;
      }
    }
  }
  return true;
}
