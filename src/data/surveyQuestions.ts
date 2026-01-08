/**
 * 総合ソリューションアンケート - 質問データ定義
 * 
 * 車売却をきっかけにしたアンケートの質問データを定義
 * シナリオ分岐機能に対応（A:買い替え、B:手放し、C:運転終了）
 */

import { SurveyQuestion } from '@/types/survey';

export const surveyQuestions: SurveyQuestion[] = [
  // Phase 1: Trigger（きっかけ - シナリオ決定）
  {
    id: 'trigger',
    phase: 'trigger',
    type: 'single',
    text: '今回、お車を手放された主なきっかけは？',
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
    options: [
      { value: 'vacant', label: '空きになる（貸して収益化したい）', solutionIds: ['parking-share'] },
      { value: 'moving', label: '引っ越すのでなくなる' },
      { value: 'use', label: '別の用途で使う' },
    ],
  },
  {
    id: 'insuranceStatusB',
    phase: 'situation',
    branchId: 'B', // 手放し層のみ
    type: 'single',
    text: '自動車保険はどうなっていますか？',
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
