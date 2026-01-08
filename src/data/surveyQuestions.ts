/**
 * 総合ソリューションアンケート - 質問データ定義
 * 
 * /sellerの設計思想ベース: 「価値提供が先、提案は後」
 * 
 * Phase 1: 満足度調査（純粋なアンケート - 信頼構築）
 * Phase 2: 状況確認と教育（ナーチャリング）
 * Phase 3: 解決策提案（最後に提案）
 */

import { SurveyQuestion } from '@/types/survey';

export const surveyQuestions: SurveyQuestion[] = [
  // ============================================
  // Phase 1: 満足度調査（純粋なアンケート - 信頼構築）
  // ============================================

  // Q1: 満足度
  {
    id: 'satisfaction',
    phase: 'trigger',
    type: 'single',
    text: '今回のご売却体験はいかがでしたか？',
    options: [
      { value: 'very-satisfied', label: 'とても満足', icon: '😊' },
      { value: 'satisfied', label: 'おおむね満足', icon: '🙂' },
      { value: 'neutral', label: '普通', icon: '😐' },
      { value: 'unsatisfied', label: 'やや不満', icon: '😕' },
      { value: 'very-unsatisfied', label: '不満', icon: '😞' },
    ],
  },

  // Q2: よかった点
  {
    id: 'goodPoint',
    phase: 'trigger',
    type: 'single',
    text: 'ありがとうございます。特によかった点を教えてください。',
    options: [
      { value: 'price', label: '査定額の高さ', icon: '💰' },
      { value: 'process', label: '手続きのスムーズさ', icon: '📋' },
      { value: 'staff', label: 'スタッフの対応', icon: '👤' },
      { value: 'speed', label: 'スピード', icon: '⚡' },
    ],
  },

  // Q3: 改善点（シナリオ分岐のトリガーを兼ねる）
  {
    id: 'concern',
    phase: 'trigger',
    type: 'single',
    text: '貴重なフィードバックをありがとうございます。もし気になる点があれば教えてください。',
    options: [
      { value: 'price', label: '査定額', icon: '💵' },
      { value: 'process', label: '手続き', icon: '📝' },
      { value: 'after-sale', label: '売却後のことが不明', icon: '❓', nextScenario: 'B' },
      { value: 'none', label: '特になし', icon: '✅' },
    ],
  },

  // ============================================
  // Phase 2: 状況確認と教育（ナーチャリング）
  // ============================================

  // Q4: 保険の状況（ブリッジメッセージ付き）
  {
    id: 'insurance',
    phase: 'situation',
    type: 'single',
    text: '自動車保険は今どうなっていますか？',
    // ブリッジメッセージとして表示するヒント
    hint: {
      text: '最後に、手続き忘れで損をしないために... 大切な車の「保険」の状況だけ確認させてください。',
      type: 'info',
    },
    options: [
      { value: 'active', label: 'そのまま残っている' },
      { value: 'cancelled', label: '解約した' },
      { value: 'unknown', label: '分からない' },
    ],
  },

  // Q5: 保険が残っている場合 - 今後の対応
  {
    id: 'insuranceAction',
    phase: 'situation',
    type: 'single',
    text: '保険の今後の対応について、どうされますか？',
    showIf: { questionId: 'insurance', values: ['active'] },
    // 教育メッセージ
    hint: {
      text: '車を手放した後も保険が残っていると、使っていないのに保険料が発生し続けます。さらに放置すると「等級」がリセットされ、次に車を持った時に保険料が高くなる可能性があります。',
      type: 'nudge',
    },
    options: [
      { value: 'transfer', label: '次の車に引き継ぐ予定' },
      { value: 'suspend', label: '一時停止（中断証明書）を取りたい', solutionIds: ['insurance-suspend'] },
      { value: 'cancel', label: '解約したい', solutionIds: ['insurance-review'] },
      { value: 'unsure', label: '何をすればいいか分からない', solutionIds: ['insurance-suspend', 'insurance-review'] },
    ],
  },

  // Q6: 今後の予定（保険が残っている場合）
  {
    id: 'futurePlan',
    phase: 'situation',
    type: 'single',
    text: '今後、車を持つ予定はありますか？',
    showIf: { questionId: 'insuranceAction', values: ['suspend', 'unsure'] },
    options: [
      { value: 'decided', label: 'すでに次の車が決まっている' },
      { value: 'maybe', label: 'そのうち乗り換えるかも' },
      { value: 'no-car', label: 'しばらく車なし生活' },
    ],
  },

  // Q7: 駐車場の状況（車なし生活の場合）
  {
    id: 'parking',
    phase: 'situation',
    type: 'single',
    text: '空いた駐車場はどうされますか？',
    showIf: { questionId: 'futurePlan', values: ['no-car'] },
    options: [
      { value: 'vacant', label: '空きになる' },
      { value: 'moving', label: '引っ越すのでなくなる' },
      { value: 'other-use', label: '別の用途で使う' },
    ],
  },

  // Q8: 駐車場収益化の教育
  {
    id: 'parkingAwareness',
    phase: 'situation',
    type: 'single',
    text: '使わなくなった駐車場を貸し出して収入を得られることをご存知ですか？',
    showIf: { questionId: 'parking', values: ['vacant'] },
    hint: {
      text: '空いた駐車場を活用して、月々数千円〜数万円の収入を得ている方もいらっしゃいます。',
      type: 'tip',
    },
    options: [
      { value: 'yes', label: 'はい、知っています' },
      { value: 'no', label: 'いいえ、知りませんでした', solutionIds: ['parking-share'] },
      { value: 'interested', label: '知らなかったけど興味がある', solutionIds: ['parking-share'] },
    ],
  },

  // Q9: 現在の保険料（最後の質問）
  {
    id: 'currentPremium',
    phase: 'situation',
    type: 'single',
    text: '参考までに、現在の年間保険料を教えてください。',
    showIf: { questionId: 'insurance', values: ['active'] },
    hint: {
      text: '保険料の目安を教えていただければ、どのくらい節約できるかお伝えできます。',
      type: 'info',
    },
    options: [
      { value: 'under-3', label: '3万円未満' },
      { value: '3-5', label: '3〜5万円' },
      { value: '5-7', label: '5〜7万円' },
      { value: '7-10', label: '7〜10万円' },
      { value: 'over-10', label: '10万円以上' },
      { value: 'unknown', label: '分からない' },
    ],
  },
];
