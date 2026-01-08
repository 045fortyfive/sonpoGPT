/**
 * 総合ソリューションアンケート - TypeScript型定義
 * 
 * 車売却をきっかけにしたアンケートから、複数ソリューションへ導く質問フローの型定義
 */

/**
 * 質問のフェーズ
 * - trigger: きっかけ（車を手放す理由）
 * - situation: 状況（車や保険の状態）
 * - needs: ニーズ（今後興味があること）
 */
export type QuestionPhase = 'trigger' | 'situation' | 'needs';

/**
 * 質問のタイプ
 * - single: 単一選択
 * - multiple: 複数選択
 */
export type QuestionType = 'single' | 'multiple';

/**
 * シナリオID
 * - A: 買い替え
 * - B: 手放し
 * - C: 運転終了
 */
export type ScenarioId = 'A' | 'B' | 'C';

/**
 * アンケートの選択肢
 */
export interface SurveyOption {
  /** 選択肢の値（内部で使用） */
  value: string;
  /** 選択肢のラベル（表示用） */
  label: string;
  /** アイコン（絵文字など） */
  icon?: string;
  /** この選択肢が選ばれた時に関連するソリューションID */
  solutionIds?: string[];
  /** この回答選択時に遷移するシナリオ */
  nextScenario?: ScenarioId;
}

/**
 * アンケートの質問
 */
export interface SurveyQuestion {
  /** 質問のID */
  id: string;
  /** 質問のフェーズ */
  phase: QuestionPhase;
  /** 質問文 */
  text: string;
  /** 質問のタイプ（単一選択/複数選択） */
  type: QuestionType;
  /** 選択肢のリスト */
  options: SurveyOption[];
  /** 特定シナリオでのみ表示する質問（未指定なら全シナリオ共通） */
  branchId?: ScenarioId;
  /** 条件分岐：前の回答に応じてこの質問を表示するかどうか */
  showIf?: {
    /** 参照する質問ID */
    questionId: string;
    /** 表示条件となる回答値のリスト */
    values: string[];
  };
}

/**
 * CTA（Call to Action）のアクションタイプ
 * - contact: お問い合わせ
 * - external: 外部リンク
 * - internal: 内部ページ
 */
export type CtaAction = 'contact' | 'external' | 'internal';

/**
 * CTA（Call to Action）
 */
export interface Cta {
  /** ボタンのラベル */
  label: string;
  /** リンク先URL（external/internalの場合） */
  href?: string;
  /** アクションタイプ */
  action?: CtaAction;
}

/**
 * パートナー情報
 */
export interface Partner {
  /** パートナー名 */
  name: string;
  /** パートナーロゴのURL */
  logo?: string;
  /** パートナーのURL */
  url?: string;
}

/**
 * ソリューション
 */
export interface Solution {
  /** ソリューションID */
  id: string;
  /** ソリューションのタイトル */
  title: string;
  /** ソリューションの説明 */
  description: string;
  /** アイコン（絵文字など） */
  icon: string;
  /** 優先度（数値が小さいほど優先度高） */
  priority: number;
  /** CTA（Call to Action） */
  cta: Cta;
  /** パートナー情報（あれば） */
  partner?: Partner;
}

/**
 * アンケート結果
 */
export interface SurveyResult {
  /** 回答（質問IDをキー、回答値を値とする） */
  answers: Record<string, string | string[]>;
  /** 推奨されるソリューションのリスト */
  recommendedSolutions: Solution[];
}

/**
 * アンケートの回答データ（API送信用）
 */
export interface SurveyAnswers {
  /** 質問IDをキー、回答値を値とする */
  [questionId: string]: string | string[];
}
