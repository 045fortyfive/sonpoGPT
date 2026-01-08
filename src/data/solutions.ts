/**
 * 総合ソリューションアンケート - ソリューションデータ定義
 * 
 * アンケート結果に基づいて推奨されるソリューションのデータを定義
 */

import { Solution } from '@/types/survey';

export const solutions: Solution[] = [
  {
    id: 'parking-share',
    title: '駐車場シェアリングで収入を得る',
    description: '使わなくなった駐車場を貸し出して、毎月の収入に。akippaなら初期費用無料で始められます。',
    icon: '🅿️',
    priority: 1,
    cta: { label: '詳しく見る', action: 'external', href: 'https://www.akippa.com/' },
    partner: { name: 'akippa', url: 'https://www.akippa.com/' },
  },
  {
    id: 'insurance-suspend',
    title: '中断証明書を取得する',
    description: '等級を最大10年間保存できます。次に車に乗る時、保険料がお得に。',
    icon: '🛡️',
    priority: 2,
    cta: { label: '相談する', action: 'contact' },
  },
  {
    id: 'insurance-review',
    title: '保険を見直してコスト削減',
    description: '今の保険料、適正ですか？無料診断で最適なプランをご提案します。',
    icon: '💡',
    priority: 3,
    cta: { label: '無料診断を受ける', action: 'contact' },
  },
  {
    id: 'cost-review',
    title: '固定費見直しツール',
    description: '通信費・サブスク・光熱費など、見直しポイントをチェック。',
    icon: '📊',
    priority: 4,
    cta: { label: '診断スタート', action: 'internal' },
  },
  {
    id: 'car-search',
    title: '次の車探しをサポート',
    description: '提携ディーラーからお得な情報をお届け。',
    icon: '🚗',
    priority: 5,
    cta: { label: '相談する', action: 'contact' },
  },
  {
    id: 'inheritance-support',
    title: '遺産・相続手続きサポート',
    description: '提携士業をご紹介。面倒な手続きをスムーズに。',
    icon: '📋',
    priority: 6,
    cta: { label: '相談する', action: 'contact' },
  },
  {
    id: 'mobility-alternative',
    title: '移動手段の探索',
    description: 'カーシェア・公共交通など、運転しない生活をサポート。',
    icon: '🚌',
    priority: 7,
    cta: { label: '詳しく見る', action: 'internal' },
  },
];
