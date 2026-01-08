/**
 * 総合ソリューションアンケート - 質問データ定義
 * 
 * 車売却をきっかけにしたアンケートの質問データを定義
 */

import { SurveyQuestion } from '@/types/survey';

export const surveyQuestions: SurveyQuestion[] = [
  // Phase 1: Trigger（きっかけ）
  {
    id: 'trigger',
    phase: 'trigger',
    type: 'single',
    text: '車を手放すきっかけは何でしたか？',
    options: [
      { value: 'moving', label: '引っ越し', icon: '🏠' },
      { value: 'lifecycle', label: '結婚・出産・子育て', icon: '👨‍👩‍👧' },
      { value: 'care', label: '親の介護', icon: '🤝' },
      { value: 'income', label: '収入・家計の変化', icon: '💰' },
      { value: 'paperdriver', label: 'ペーパードライバー化', icon: '🚫' },
      { value: 'inheritance', label: '持ち主がいなくなった', icon: '📋' },
      { value: 'other', label: 'その他', icon: '❓' },
    ],
  },

  // Phase 2: Situation（状況）
  {
    id: 'carStatus',
    phase: 'situation',
    type: 'single',
    text: '車の状況を教えてください',
    options: [
      { value: 'sold', label: 'すでに売却済み' },
      { value: 'planning', label: 'これから売る予定' },
      { value: 'thinking', label: '検討中' },
    ],
  },
  {
    id: 'parkingStatus',
    phase: 'situation',
    type: 'single',
    text: '駐車場はどうなりますか？',
    options: [
      { value: 'vacant', label: '空きになる', solutionIds: ['parking-share'] },
      { value: 'continue', label: '引き続き使う（別の車等）' },
      { value: 'moving', label: '引っ越すので不要' },
      { value: 'unknown', label: 'まだ分からない' },
    ],
  },
  {
    id: 'insuranceStatus',
    phase: 'situation',
    type: 'single',
    text: '自動車保険はどうなっていますか？',
    options: [
      { value: 'active', label: 'まだ有効', solutionIds: ['insurance-suspend', 'insurance-review'] },
      { value: 'cancelled', label: '解約済み' },
      { value: 'unknown', label: '分からない', solutionIds: ['insurance-review'] },
    ],
  },

  // Phase 3: Needs（ニーズ - 複数選択）
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
