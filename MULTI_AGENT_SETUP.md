# マルチエージェント開発環境セットアップ

このプロジェクトは、複数のAIエージェント（Cursor、Gemini、Ralph）が並列で作業できるように設定されています。

## 構成要素

1. **Beads**: GitベースのIssueトラッキングシステム
2. **Ralph**: 自動化されたAIコーディングループ
3. **Cursor**: **高速実装のメイン** - シンプルで明確なタスクを迅速に実装、Claude Skills活用（`.cursorrules`）
4. **Gemini/Antigravity**: **作業計画の中心** - Opus 4.5での作業計画、複雑な設計、Gemini/Claude両方使用可能（`gemini.md`）
5. **Claude Code**: **汎用的な開発タスク** - 複雑なロジック、バグ修正、リファクタリング（`claude.md`）

## セットアップ手順

### 1. Beadsの確認

Beadsが既に初期化されていることを確認：

```bash
bd ready
```

問題がある場合は：

```bash
bd doctor --fix
```

### 2. Ralphの準備

`scripts/ralph/prd.json`にユーザーストーリーを定義：

```json
{
  "branchName": "ralph/feature",
  "userStories": [
    {
      "id": "US-001",
      "title": "機能のタイトル",
      "acceptanceCriteria": [
        "受け入れ基準1",
        "受け入れ基準2",
        "TypeScript typecheck passes",
        "Lint passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### 3. エージェントのインストール

Ralphを使用するには、以下のいずれかが必要：

- **AmpCode**: `amp --dangerously-allow-all`
- **Claude Code**: `claude --dangerously-skip-permissions`

## 使用方法

### Cursorでの作業

1. `.cursorrules`が自動的に読み込まれます
2. Beadsでタスクを確認：
   ```bash
   bd ready
   ```
3. タスクを開始：
   ```bash
   bd update <id> --status in_progress
   ```
4. 作業完了後：
   ```bash
   bd close <id>
   bd sync
   git push
   ```

### Gemini/Antigravityでの作業

1. `gemini.md`を参照
2. Beadsでタスクを確認（`[PLAN]`, `[DESIGN]`, `[OPUS]`タグを優先）
3. Opus 4.5で作業計画を作成
4. 計画に基づいて実装タスクを作成（適切なタグを付与）
5. GeminiまたはClaudeを選択して作業

### Claude Codeでの作業

1. `claude.md`を参照
2. Beadsでタスクを確認（`[CLAUDE]`, `[GENERAL]`, `[REFACTOR]`タグを優先）
3. タスクを予約: `bd update <id> --status in_progress`
4. 実装を実行

### Ralphでの自動化

1. `prd.json`を準備
2. Ralphを実行：
   ```bash
   npm run ralph
   # または
   ./scripts/ralph/ralph.sh 25
   ```
3. Ralphが自動的に：
   - ストーリーを実装
   - 型チェックとテストを実行
   - コミット
   - 進捗を更新

## タスク自動分離

タスクはタグに基づいて自動的にエージェントに割り当てられます：

### タスクタグ

- `[CURSOR]` または `[FAST]` - Cursor（高速実装）
- `[PLAN]` または `[DESIGN]` または `[OPUS]` - Gemini/Antigravity（作業計画）
- `[CLAUDE]` または `[GENERAL]` または `[REFACTOR]` - Claude Code（汎用的な開発）
- `[RALPH]` - Ralph（自動化ループ）

### タスク作成例

```bash
# Cursor向け（高速実装）
bd create "[CURSOR] UIコンポーネントの実装" -p 1

# Gemini/Antigravity向け（作業計画）
bd create "[PLAN] 新機能の設計と計画" -p 0

# Claude Code向け（汎用的な開発）
bd create "[CLAUDE] 複雑なロジックの実装" -p 1
```

詳細は `scripts/task-separation.md` を参照してください。

## 並列作業のベストプラクティス

### 1. タスクの分離

- 適切なタグを付けてタスクを作成
- 異なるファイルを編集
- 異なる機能領域で作業
- Beadsでタスクを予約

### 2. コンフリクト回避

- 作業開始前に `git pull --rebase`
- 小さなコミットを頻繁に
- 独立したブランチを使用

### 3. メモリ共有

- **AGENTS.md**: プロジェクト全体のパターン
- **progress.txt**: Ralphセッションの学習
- **Beads Issues**: 構造化されたタスク管理

## ワークフロー例

### シナリオ1: CursorとGemini/Antigravityが並列作業

1. **Gemini/Antigravity**: `[PLAN]`タグのタスクで作業計画を作成
2. **Cursor**: `[CURSOR]`タグのタスクで高速実装を実行
3. それぞれ独立して作業
4. 完了後、それぞれ `bd close` → `bd sync` → `git push`

### シナリオ2: 全エージェントが協調

1. **Gemini/Antigravity**: Opus 4.5で大規模機能の計画を作成
2. **Gemini/Antigravity**: 計画に基づいて実装タスクを作成（適切なタグを付与）
3. **Cursor**: `[CURSOR]`タグのタスクで高速実装
4. **Claude Code**: `[CLAUDE]`タグのタスクで複雑なロジックを実装
5. **Ralph**: 小さなストーリーを自動実装

### シナリオ2: Ralphが自動化

1. `prd.json`に10個のストーリーを定義
2. `npm run ralph`を実行
3. Ralphが1つずつ実装
4. すべて完了したら `<promise>COMPLETE</promise>` を返す

### シナリオ3: 混合ワークフロー

1. **Ralph**: 小さなストーリーを自動実装
2. **Cursor**: 複雑な機能をインタラクティブに開発
3. **Gemini**: テストやドキュメントを並列で作成

## トラブルシューティング

### Beadsの同期エラー

```bash
bd sync
git pull --rebase
git push
```

### Ralphが停止した

- `prd.json`の`passes`状態を確認
- `progress.txt`でエラーを確認
- 型エラーを修正: `npm run build`

### コンフリクトが発生

```bash
git pull --rebase
# コンフリクトを解決
git add .
git rebase --continue
bd sync
git push
```

## ファイル構造

```
sonpoGPT/
├── .beads/                    # Beadsデータベース
├── scripts/
│   └── ralph/                # Ralph自動化
│       ├── ralph.sh          # メインループ
│       ├── prompt.md         # エージェント指示
│       ├── prd.json          # ユーザーストーリー
│       ├── progress.txt      # 進捗ログ
│       └── README.md         # Ralphドキュメント
├── AGENTS.md                  # プロジェクト全体の学習
├── .cursorrules               # Cursor用ルール（高速実装メイン）
├── gemini.md                  # Gemini/Antigravity用ルール（作業計画の中心）
├── claude.md                  # Claude Code用ルール（汎用的な開発）
├── MULTI_AGENT_SETUP.md      # このファイル
└── scripts/
    └── task-separation.md     # タスク自動分離ガイド
```

## 参考リンク

- [Beads GitHub](https://github.com/steveyegge/beads)
- [Ralphの元の投稿](https://x.com/finnbags/status/2008725074296402071)
- `AGENTS.md` - プロジェクト全体の学習とパターン
- `scripts/ralph/README.md` - Ralphの詳細ドキュメント

## 次のステップ

1. `prd.json`に実際のユーザーストーリーを追加
2. `progress.txt`にコードベースのパターンを追加
3. 最初のRalphセッションを実行
4. 複数エージェントで並列作業を試す

