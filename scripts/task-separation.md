# タスク自動分離ガイド

このドキュメントでは、Beadsを使用したタスクの自動分離方法を説明します。

## タスクタグの一覧

### Cursor向けタスク

- `[CURSOR]` - Cursor専用タスク
- `[FAST]` - 高速実装が必要
- `[UI]` - UIコンポーネント
- `[API]` - API実装（Claude Skills使用可能）

**例:**
```bash
bd create "[CURSOR] ログインフォームの実装" -p 1
bd create "[FAST] エラーハンドリングの追加" -p 1
bd create "[UI] ダッシュボードコンポーネント" -p 1
```

### Gemini/Antigravity向けタスク

- `[PLAN]` - 作業計画が必要
- `[DESIGN]` - 設計とアーキテクチャ
- `[OPUS]` - Opus 4.5での計画
- `[GEMINI]` - Gemini/Antigravity専用
- `[INTEGRATION]` - 統合タスク

**例:**
```bash
bd create "[PLAN] 認証システムの設計" -p 0
bd create "[DESIGN] データベーススキーマの設計" -p 0
bd create "[OPUS] 大規模機能の計画" -p 0
```

### Claude Code向けタスク

- `[CLAUDE]` - Claude Code専用
- `[GENERAL]` - 汎用的なタスク
- `[REFACTOR]` - リファクタリング
- `[BUGFIX]` - バグ修正

**例:**
```bash
bd create "[CLAUDE] 複雑なビジネスロジックの実装" -p 1
bd create "[GENERAL] ユーティリティ関数の追加" -p 1
bd create "[REFACTOR] コードの整理" -p 2
```

### Ralph向けタスク

Ralphは `scripts/ralph/prd.json` から自動的にタスクを読み取ります。

タグは使用しませんが、`prd.json`に追加することで自動処理されます。

## タスク作成のベストプラクティス

### 1. 適切なタグを選択

タスクの性質に応じて適切なタグを選択してください：

- **高速実装が必要** → `[CURSOR]` または `[FAST]`
- **計画や設計が必要** → `[PLAN]` または `[DESIGN]`
- **複雑なロジック** → `[CLAUDE]`
- **小さなストーリー** → `prd.json`に追加

### 2. 優先度の設定

- `-p 0` - 最高優先度（計画や設計）
- `-p 1` - 高優先度（重要な機能）
- `-p 2` - 通常優先度（一般的なタスク）

### 3. 依存関係の設定

タスク間に依存関係がある場合：

```bash
bd dep add <child-id> <parent-id>
```

例：
```bash
# 親タスク: 設計
bd create "[PLAN] 認証システムの設計" -p 0
# 子タスク: 実装
bd create "[CURSOR] 認証フォームの実装" -p 1
bd dep add <child-id> <parent-id>
```

## エージェントのタスク選択フロー

### Cursor

1. `bd ready` で利用可能なタスクを確認
2. `[CURSOR]`, `[FAST]`, `[UI]`, `[API]` タグのタスクを優先
3. タスクを予約: `bd update <id> --status in_progress`
4. 高速実装を実行
5. Claude Skillsを使用可能な場合は活用

### Gemini/Antigravity

1. `bd ready` で利用可能なタスクを確認
2. `[PLAN]`, `[DESIGN]`, `[OPUS]`, `[GEMINI]` タグのタスクを優先
3. Opus 4.5で作業計画を作成
4. 計画に基づいて実装タスクを作成（適切なタグを付与）
5. GeminiまたはClaudeを選択して作業

### Claude Code

1. `bd ready` で利用可能なタスクを確認
2. `[CLAUDE]`, `[GENERAL]`, `[REFACTOR]`, `[BUGFIX]` タグのタスクを優先
3. タスクを予約: `bd update <id> --status in_progress`
4. 実装を実行

### Ralph

1. `scripts/ralph/prd.json` からストーリーを読み取る
2. `passes: false` の最高優先度ストーリーを選択
3. 実装を実行
4. Beadsタスクを自動的に作成・更新

## トラブルシューティング

### タスクが適切に分離されない場合

1. タスクに適切なタグが付いているか確認
2. タスクの説明を確認（タグが含まれているか）
3. 優先度が適切か確認

### 複数のエージェントが同じタスクを選択した場合

1. Beadsでタスクを予約: `bd update <id> --status in_progress`
2. 作業開始前に `git status` で確認
3. 必要に応じてブランチを分離

### タスクの優先順位が不明確な場合

1. 依存関係を確認: `bd dep list <id>`
2. タスクの詳細を確認: `bd show <id>`
3. 必要に応じて優先度を調整: `bd update <id> --priority <0-2>`

## 参考

- **Beads**: https://github.com/steveyegge/beads
- **AGENTS.md**: プロジェクト全体の学習とパターン
- **.cursorrules**: Cursorエージェント用のルール
- **gemini.md**: Gemini/Antigravityエージェント用のルール
- **claude.md**: Claude Codeエージェント用のルール
