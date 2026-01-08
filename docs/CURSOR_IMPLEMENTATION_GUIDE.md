# Cursor実装ガイド - 総合ソリューションアンケート（ロジック強化版）

## 概要

買取完了画面をきっかけに、「買い替え」「手放し」「運転終了」の3シナリオに分岐する人間らしい質問フローを実装する。

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
  text: '今回、お車を売却された主なきっかけは？',
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

1. ✅ **型定義更新**: `SurveyQuestion` に `branchId`、`SurveyOption` に `nextScenario` を追加（完了）
2. ✅ **データ更新**: `surveyQuestions.ts` を上記構造に合わせて書き換え（完了）
3. ✅ **ロジック更新**: シナリオ分岐ロジックを実装（完了）
4. ✅ **UI更新**: `Survey.tsx` と `ChatSurvey.tsx` で回答時に `nextScenario` があればステートを更新する処理を追加（完了）

---

## 動作確認ポイント

- [x] 「結婚」を選ぶ → 次の質問が「次のお車」になる（駐車場の質問が出ない）
- [x] 「引っ越し」を選ぶ → 次の質問が「駐車場」になる
- [x] 「免許返納」を選ぶ → 次の質問が「移動手段の不安」になる

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

1. ✅ **Chat UI基盤**: パッケージ導入 & `ShaderBorder.tsx`（完了）
2. ✅ **Chat実装**: `ChatSurvey.tsx` (アニメーション含む)（完了）
3. ✅ **統合**: `src/app/survey/page.tsx` から呼び出し（完了）
4. ✅ **導入文追加**: 買取完了への感謝と次のステップへの誘導として自然な導入文を追加（完了）

---

## 7. 駐車場収益シミュレーション実装 (New)

akippaなどの駐車場シェアリング提案時に表示する、リッチなシミュレーションUIを実装します。

### 1. `src/components/solutions/ParkingSimulation.tsx`

#### 機能要件
- **Google Maps表示**:
  - APIキーがあれば `react-google-maps` 等を使用
  - ない場合は `iframe` (embed API) または **静的なモック画像**（地図風デザイン + ピン）で代用（MVPとしてはモック推奨）
  - ピンの上に「600円/日」のようなチップを表示

- **収益シミュレーション**:
  - 郵便番号からエリアを特定（モックでOK）
  - 「周辺相場: 600円/日」
  - 「月間予想収益: 5,400円」（稼働率30%計算など現実的な値）

#### UI実装イメージ
```tsx
export function ParkingSimulation({ zipCode }: { zipCode?: string }) {
  // モックデータ (実際はAPI等で取得)
  const pricePerDay = 600;
  const monthlyRevenue = pricePerDay * 30 * 0.3; // 稼働率30%（現実的なシミュレーション）

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 my-4">
      {/* Map Area */}
      <div className="h-48 bg-gray-100 relative">
        {/* Map Mock or Component */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
           <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
             相場: {pricePerDay}円/日
           </div>
        </div>
      </div>
      
      {/* Simulation Result */}
      <div className="p-4">
        <h4 className="text-gray-900 font-bold mb-2">あなたの駐車場なら...</h4>
        <div className="flex justify-between items-end border-b pb-2 mb-2">
           <span className="text-gray-500 text-sm">月間予想収益</span>
           <span className="text-2xl font-bold text-blue-600">
             ¥{monthlyRevenue.toLocaleString()}
           </span>
        </div>
        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          シミュレーション詳細へ
        </Button>
      </div>
    </div>
  );
}
```

### 2. 統合

- **ChatSurvey** 内で、`parking-share` ソリューションが提案される際に、この `ParkingSimulation` コンポーネントを表示するようにロジックを追加してください。
- ユーザーが郵便番号を入力ずみであればそれをプロップスとして渡します。

---

## 8. 実装状況

### 完了した実装

1. ✅ **AI Chat UI実装** (`ChatSurvey.tsx` など) - 完了
   - 対話型チャットUI実装
   - AI思考中エフェクト（ShaderBorder使用）
   - シナリオ分岐機能対応
   - 買取完了への感謝と導入文追加

2. ✅ **統合** - 完了
   - `src/app/survey/page.tsx` で `ChatSurvey` を使用

### 未実装

1. ⏳ **駐車場シミュレーション** (`ParkingSimulation.tsx`)
   - `parking-share` ソリューション提案時に表示するリッチなシミュレーションUI
   - Google Maps表示（モック可）
   - 収益シミュレーション表示

## 9. 次のアクション

1. **駐車場シミュレーション実装** (`ParkingSimulation.tsx`)
2. **ChatSurveyへの統合** - `parking-share` ソリューション表示時に `ParkingSimulation` を表示

