/**
 * 総合ソリューションアンケート - ロジック実装
 * 
 * アンケート回答から推奨ソリューションを算出するロジック
 * シナリオ分岐機能に対応（A:買い替え、B:手放し、C:運転終了）
 */

import { SurveyQuestion, Solution, ScenarioId } from '@/types/survey';
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
 * シナリオに応じて質問をフィルタリング
 * 
 * @param allQuestions すべての質問
 * @param currentScenario 現在のシナリオ（nullの場合は未確定）
 * @returns フィルタリングされた質問リスト
 */
export function getFilteredQuestions(
  allQuestions: SurveyQuestion[],
  currentScenario: ScenarioId | null
): SurveyQuestion[] {
  return allQuestions.filter(q => {
    // Phase 1は常に表示
    if (q.phase === 'trigger') return true;
    
    // シナリオ未確定時はPhase 2以降を表示しない
    if (!currentScenario) return false;

    // シナリオ指定がある質問は、現在のシナリオと一致する場合のみ表示
    if (q.branchId && q.branchId !== currentScenario) return false;

    // シナリオ指定がない質問は全シナリオ共通として表示
    return true;
  });
}

/**
 * 質問を表示すべきかどうかを判定（条件分岐対応）
 * 
 * @param question 判定対象の質問
 * @param answers 現在までの回答
 * @param currentScenario 現在のシナリオ（オプション）
 * @returns 質問を表示すべきかどうか
 */
export function shouldShowQuestion(
  question: SurveyQuestion,
  answers: Record<string, string | string[]>,
  currentScenario?: ScenarioId | null
): boolean {
  // Phase 1は常に表示
  if (question.phase === 'trigger') return true;
  
  // シナリオ未確定時はPhase 2以降を表示しない
  if (currentScenario === null || currentScenario === undefined) return false;

  // シナリオ指定がある質問は、現在のシナリオと一致する場合のみ表示
  if (question.branchId && question.branchId !== currentScenario) return false;

  // showIfが設定されている場合は条件を確認
  if (question.showIf) {
    const answer = answers[question.showIf.questionId];
    if (!answer) return false;
    
    const answerValues = Array.isArray(answer) ? answer : [answer];
    return question.showIf.values.some(v => answerValues.includes(v));
  }

  return true;
}

/**
 * 次の質問を取得
 * 
 * @param currentQuestionId 現在の質問ID
 * @param answers 現在までの回答
 * @param currentScenario 現在のシナリオ（オプション）
 * @returns 次の質問、またはnull（すべて完了した場合）
 */
export function getNextQuestion(
  currentQuestionId: string | null,
  answers: Record<string, string | string[]>,
  currentScenario?: ScenarioId | null
): SurveyQuestion | null {
  // フィルタリングされた質問リストを取得
  const filteredQuestions = getFilteredQuestions(surveyQuestions, currentScenario || null);
  
  const currentIndex = currentQuestionId
    ? filteredQuestions.findIndex(q => q.id === currentQuestionId)
    : -1;

  // 次の質問を探す
  for (let i = currentIndex + 1; i < filteredQuestions.length; i++) {
    const question = filteredQuestions[i];
    if (shouldShowQuestion(question, answers, currentScenario)) {
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
 * @param currentScenario 現在のシナリオ（オプション）
 * @returns アンケートが完了したかどうか
 */
export function isSurveyComplete(
  answers: Record<string, string | string[]>,
  currentScenario?: ScenarioId | null
): boolean {
  // フィルタリングされた質問リストを取得
  const filteredQuestions = getFilteredQuestions(surveyQuestions, currentScenario || null);
  
  // すべての質問に対して回答があるか確認
  for (const question of filteredQuestions) {
    if (shouldShowQuestion(question, answers, currentScenario)) {
      if (!answers[question.id]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * 回答からシナリオを取得
 * 
 * @param answers 現在までの回答
 * @returns シナリオID、またはnull（未確定の場合）
 */
export function getScenarioFromAnswers(
  answers: Record<string, string | string[]>
): ScenarioId | null {
  const triggerAnswer = answers['trigger'];
  if (!triggerAnswer) return null;

  const triggerQuestion = surveyQuestions.find(q => q.id === 'trigger');
  if (!triggerQuestion) return null;

  const answerValue = Array.isArray(triggerAnswer) ? triggerAnswer[0] : triggerAnswer;
  const option = triggerQuestion.options.find(o => o.value === answerValue);
  
  return option?.nextScenario || null;
}
