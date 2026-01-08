/**
 * 総合ソリューションアンケート - 質問データ定義
 * 
 * 買取完了画面をきっかけにしたアンケートの質問データを定義
 * シナリオ分岐機能に対応（A:買い替え、B:手放し、C:運転終了）
 */

import { SurveyQuestion } from '@/types/survey';

export const surveyQuestions: SurveyQuestion[] = [
  // Phase 1: Trigger（きっかけ - シナリオ決定）
  {
    id: 'trigger',
    phase: 'trigger',
    type: 'single',
    text: '今回、お車を売却された主なきっかけは？',
    hint: {
      text: 'きっかけに応じて、最適なサポートをご提案します。',
      type: 'info',
    },
    options: [
      { value: 'lifecycle', label: '結婚・出産・子育て', icon: '👨‍👩‍👧', nextScenario: 'A' },
      { value: 'buying', label: '新しい車の購入資金', icon: '✨', nextScenario: 'A' },
      { value: 'moving', label: '引っ越し・転勤', icon: '🏠', nextScenario: 'B' },
      { value: 'cost', label: '維持費・家計の見直し', icon: '💰', nextScenario: 'B' },
      { value: 'reduce', label: '乗る機会が減った', icon: '📉', nextScenario: 'B' },
      { value: 'license', label: '免許返納・または検討', icon: '🎓', nextScenario: 'C' },
      { value: 'care', label: 'ご家族の事情（相続等）', icon: '🤝', nextScenario: 'C' },
    ],
  },

  // Phase 2: Situation（状況 - シナリオ別）

  // Scenario A: 買い替え
  {
    id: 'nextCar',
    phase: 'situation',
    branchId: 'A', // 買い替え層のみ
    type: 'single',
    text: '次のお車について教えてください',
    hint: {
      text: '次の車の状況に応じて、保険の切替タイミングや手続きをご案内します。',
      type: 'tip',
    },
    options: [
      { value: 'decided', label: 'すでに決まっている（納車待ち）' },
      { value: 'searching', label: 'これから探す', solutionIds: ['car-search'] },
      { value: 'none', label: '一時的に車なし生活にする' },
    ],
  },
  {
    id: 'insuranceStatusA',
    phase: 'situation',
    branchId: 'A', // 買い替え層のみ
    type: 'single',
    text: '自動車保険はどうなっていますか？',
    hint: {
      text: '現在の保険を一時停止すると、次の車までの期間の保険料を節約できます。',
      type: 'nudge',
    },
    options: [
      { value: 'active', label: 'まだ有効', solutionIds: ['insurance-suspend', 'insurance-review'] },
      { value: 'cancelled', label: '解約済み' },
      { value: 'unknown', label: '分からない', solutionIds: ['insurance-review'] },
    ],
  },

  // Scenario B: 手放し
  {
    id: 'parking',
    phase: 'situation',
    branchId: 'B', // 手放し層のみ
    type: 'single',
    text: '空いた駐車場はどうされますか？',
    hint: {
      text: '使わなくなった駐車場を貸し出すことで、月額数万円の収入になることもあります。',
      type: 'tip',
    },
    options: [
      { value: 'vacant', label: '空きになる' },
      { value: 'moving', label: '引っ越すのでなくなる' },
      { value: 'use', label: '別の用途で使う' },
    ],
  },
  // 教育的質問: 駐車場収益化の認知確認
  {
    id: 'parkingAwareness',
    phase: 'situation',
    branchId: 'B',
    type: 'single',
    text: '使わなくなった駐車場を貸し出して収入を得られることをご存知ですか？',
    showIf: { questionId: 'parking', values: ['vacant'] },
    options: [
      { value: 'yes', label: 'はい、知っています' },
      { value: 'no', label: 'いいえ、知りませんでした', solutionIds: ['parking-share'] },
      { value: 'interested', label: '知らなかったけど興味がある', solutionIds: ['parking-share'] },
    ],
  },
  {
    id: 'insuranceStatusB',
    phase: 'situation',
    branchId: 'B', // 手放し層のみ
    type: 'single',
    text: '自動車保険はどうなっていますか？',
    hint: {
      text: '車を手放した後も保険が有効なら、一時停止で保険料を節約できます。',
      type: 'nudge',
    },
    options: [
      { value: 'active', label: 'まだ有効', solutionIds: ['insurance-suspend', 'insurance-review'] },
      { value: 'cancelled', label: '解約済み' },
      { value: 'unknown', label: '分からない', solutionIds: ['insurance-review'] },
    ],
  },

  // Scenario C: 運転終了
  {
    id: 'mobility',
    phase: 'situation',
    branchId: 'C', // 運転終了層のみ
    type: 'single',
    text: '今後の移動手段について不安はありますか？',
    hint: {
      text: '運転を終えても、タクシーや配車サービスなど、便利な移動手段があります。',
      type: 'info',
    },
    options: [
      { value: 'anxiety', label: '買い物や通院が不安', solutionIds: ['mobility-alternative'] },
      { value: 'safe', label: '特にない（家族がいる/便利）' },
    ],
  },
  {
    id: 'insuranceStatusC',
    phase: 'situation',
    branchId: 'C', // 運転終了層のみ
    type: 'single',
    text: '自動車保険はどうなっていますか？',
    hint: {
      text: '運転を終えられた場合、保険の解約や一時停止で固定費を削減できます。',
      type: 'tip',
    },
    options: [
      { value: 'active', label: 'まだ有効', solutionIds: ['insurance-suspend', 'insurance-review'] },
      { value: 'cancelled', label: '解約済み' },
      { value: 'unknown', label: '分からない', solutionIds: ['insurance-review'] },
    ],
  },

  // Phase 3: Needs（ニーズ - 複数選択）
  // シナリオ共通のニーズ質問
  {
    id: 'needs',
    phase: 'needs',
    type: 'multiple',
    text: '今後どんなことに興味がありますか？（複数選択可）',
    hint: {
      text: '複数選択できます。気になるものがあれば、ぜひ選んでください。',
      type: 'info',
    },
    options: [
      { value: 'parking-income', label: '駐車場を活用して収入を得たい', icon: '💰', solutionIds: ['parking-share'] },
      { value: 'insurance-cost', label: '保険の出費を抑えたい', icon: '🛡️', solutionIds: ['insurance-suspend', 'insurance-review'] },
      { value: 'cost-reduction', label: '生活費・固定費を見直したい', icon: '📉', solutionIds: ['cost-review'] },
      { value: 'next-car', label: '次の車を探したい', icon: '🚙', solutionIds: ['car-search'] },
      { value: 'inheritance', label: '遺産・相続の手続きを進めたい', icon: '📋', solutionIds: ['inheritance-support'] },
      { value: 'no-drive-life', label: '運転しない生活を始めたい', icon: '🚌', solutionIds: ['mobility-alternative'] },
      { value: 'info', label: '情報収集中', icon: '🔍' },
    ],
  },
];
