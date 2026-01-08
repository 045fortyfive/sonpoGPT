# Cursor実装ガイド - 総合ソリューションアンケート（ロジック強化版）

## 概要

車売却のきっかけに応じて、「買い替え」「手放し」「運転終了」の3シナリオに分岐する人間らしい質問フローを実装する。

---

## 1. 型定義の更新 (`src/types/survey.ts`)

```typescript
export type QuestionPhase = 'trigger' | 'situation' | 'needs';
export type QuestionType = 'single' | 'multiple';
export type ScenarioId = 'A' | 'B' | 'C'; // A:買い替え, B:手放し, C:運転終了

export interface SurveyOption {
  value: string;
  label: string;
  icon?: string;
  solutionIds?: string[];
  /** この回答選択時に遷移するシナリオ */
  nextScenario?: ScenarioId;
}

export interface SurveyQuestion {
  id: string;
  phase: QuestionPhase;
  text: string;
  type: QuestionType;
  options: SurveyOption[];
  /** 特定シナリオでのみ表示する質問（未指定なら全シナリオ共通） */
  branchId?: ScenarioId; 
}

// ... Solution等は変更なし ...
```

---

## 2. 質問データ定義 (`src/data/surveyQuestions.ts`)

以下のようにデータを定義してください。

### Phase 1: Trigger (シナリオ決定)

```typescript
// Q1: きっかけ
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
}
```

### Phase 2: Situation (シナリオ別)

```typescript
// Q2-A: 買い替え（Scenario A）
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

// Q2-B: 駐車場（Scenario B）
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

// Q2-C: 移動手段（Scenario C）
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
```
※ Phase 3 (Needs) も同様にシナリオに応じた選択肢や質問を追加・調整可能です。

---

## 3. ロジック実装ガイド (`src/lib/surveyLogic.ts`)

```typescript
// ステート管理のイメージ（Survey.tsx内などで使用）
// const [scenario, setScenario] = useState<ScenarioId | null>(null);

export function getFilteredQuestions(
  allQuestions: SurveyQuestion[], 
  currentScenario: ScenarioId | null
): SurveyQuestion[] {
  return allQuestions.filter(q => {
    // Phase 1は常に表示
    if (q.phase === 'trigger') return true;
    
    // シナリオ未確定時はPhase 2以降を表示しない（あるいは共通質問のみ）
    if (!currentScenario) return false;

    // シナリオ指定がある質問は、現在のシナリオと一致する場合のみ表示
    if (q.branchId && q.branchId !== currentScenario) return false;

    return true;
  });
}
```

---

## 4. 実装手順

1. **型定義更新**: `SurveyQuestion` に `branchId`、`SurveyOption` に `nextScenario` を追加
2. **データ更新**: `surveyQuestions.ts` を上記構造に合わせて書き換え
3. **ロジック更新**: シナリオ分岐ロジックを実装
4. **UI更新**: `Survey.tsx` で回答時に `nextScenario` があればステートを更新する処理を追加

---

## 動作確認ポイント

- [ ] 「結婚」を選ぶ → 次の質問が「次のお車」になる（駐車場の質問が出ない）
- [ ] 「引っ越し」を選ぶ → 次の質問が「駐車場」になる
- [ ] 「免許返納」を選ぶ → 次の質問が「移動手段の不安」になる

---

## 5. AI Chat UI 実装ガイド (New)

従来のフォーム形式ではなく、**対話型チャットUI**として実装します。

### 1. 依存パッケージ導入
```bash
npm install framer-motion @paper-design/shaders-react lucide-react clsx tailwind-merge
```

### 2. シェーダーコンポーネント実装 (`src/components/ui/ShaderBorder.tsx`)
`shaders-chat-app` の `PulsingBorder` を活用し、AI思考中エフェクトを作成します。

```tsx
'use client';
import { PulsingBorder } from "@paper-design/shaders-react";
import { motion } from "framer-motion";

export function ShaderBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* 背景シェーダー */}
      <div className="absolute inset-0 -z-10 translate-x-[-15%] translate-y-[-15%] scale-125">
         <PulsingBorder
            colorBack="hsl(0, 0%, 100%)" // 白背景用調整
            colors={["#3b82f6", "#60a5fa", "#93c5fd"]} // 青系
            // ...適宜パラメータ調整
         />
      </div>
      {children}
    </div>
  );
}
```

### 3. Chatコンポーネント (`src/components/ChatSurvey.tsx`)

#### 構成
- **MessageList**: `user` (右側) / `assistant` (左側) のメッセージを表示
- **ThinkingBubble**: AIが次の質問を生成中（`isReasoning`）に表示。**ここでShaderBorderを使用**。
- **ActionArea**: ユーザーの回答選択肢を表示（`surveyQuestions` の `options`）。

#### ロジック連携
- `surveyLogic.ts` の `getFilteredQuestions` を使用して次の質問を取得
- 回答選択 → `answers` 更新 → `isReasoning` true → (数秒待機) → 次の質問表示

### 4. 統合
`src/components/Survey.tsx` を `ChatSurvey` に置き換えます。

---

## 6. 実装手順まとめ

1. **型・データ修正**: `ScenarioId`, `branchId` 追加
2. **ロジック実装**: `surveyLogic.ts` (分岐ロジック)
3. **Chat UI基盤**: パッケージ導入 & `ShaderBorder.tsx`
4. **Chat実装**: `ChatSurvey.tsx` (アニメーション含む)
5. **統合**: `page.tsx` から呼び出し
