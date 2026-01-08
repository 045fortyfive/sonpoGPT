# Gemini/Antigravity Agent Instructions

このプロジェクトでGemini/Antigravityエージェントが作業する際のガイドラインです。

## Gemini/Antigravityの役割

**Gemini/Antigravityは作業計画の中心エージェントです。**

- **作業計画**: Opus 4.5での作業計画の中心
- **複雑な設計**: アーキテクチャと設計の決定
- **柔軟なエージェント選択**: GeminiまたはClaudeを使用可能

## プロジェクト概要

- **Issue Tracking**: Beads (bd) を使用
- **自動化**: Ralph による高速ループ開発
- **並列作業**: Cursor、Gemini/Antigravity、Claude Code、Ralphが協調して作業
- **役割分担**: 各エージェントが最適なタスクを自動選択

## Beads統合

### 作業フロー

1. **利用可能なタスクを取得**
   ```bash
   bd ready
   ```
   ブロッカーがないタスクのリストが表示されます。

2. **タスクを開始**
   ```bash
   bd show <id>                    # 詳細を確認
   bd update <id> --status in_progress  # タスクを予約
   ```

3. **作業実行**
   - タスクの要件を確認
   - 実装を完了
   - 型チェックとテストを実行

4. **タスクを完了**
   ```bash
   bd close <id>
   bd sync
   git commit -m "feat: [sonpoGPT-xxxx] - [説明]"
   git push
   ```

## タスク選択の自動化

### Gemini/Antigravityが優先的に担当するタスク

Gemini/Antigravityは以下のタスクを優先的に担当します：

- **作業計画**: `[PLAN]` タグまたは `[DESIGN]` タグ
- **複雑な設計**: アーキテクチャの決定が必要なタスク
- **Opus 4.5での計画**: 大規模な機能の設計と計画
- **統合タスク**: 複数のコンポーネントを統合するタスク

### タスクの自動分離

Beadsのタスクにタグを使用して自動分離：

```bash
# Gemini/Antigravity向けタスクの作成例
bd create "[PLAN] 新機能の設計と計画" -p 0
bd create "[DESIGN] アーキテクチャの決定" -p 0
bd create "[OPUS] 大規模機能の計画" -p 0
```

タスクの説明に以下のタグがある場合、Gemini/Antigravityが優先的に担当：
- `[PLAN]` - 作業計画が必要
- `[DESIGN]` - 設計とアーキテクチャ
- `[OPUS]` - Opus 4.5での計画
- `[GEMINI]` - Gemini/Antigravity専用
- `[INTEGRATION]` - 統合タスク

## Gemini/Claudeの選択

Gemini/Antigravityは状況に応じてGeminiまたはClaudeを使用できます：

### Geminiを使用する場合

- 迅速な実装が必要
- シンプルなタスク
- コード生成が主な目的

### Claudeを使用する場合

- 複雑な設計が必要
- 詳細な分析が必要
- 長期的な計画が必要

### 選択の判断基準

タスクの説明や複雑さに応じて、最適なエージェントを選択してください。

## 並列作業のルール

### タスク選択

- **優先度の高いタスク**: `bd ready` で表示される順序を尊重
- **依存関係を確認**: `bd show <id>` でブロッカーを確認
- **計画タスク**: Opus 4.5での計画が必要なタスクを優先

### コンフリクト回避

1. **作業開始前**
   ```bash
   git pull --rebase
   git status  # 未コミットの変更を確認
   ```

2. **ブランチ作成**（必要に応じて）
   ```bash
   git checkout -b gemini/<task-id>
   ```

3. **頻繁なコミット**
   - 小さな単位でコミット
   - 各コミットは動作する状態を保つ

### メモリ共有

- **AGENTS.md**: プロジェクト全体のパターンと学習を記録
- **progress.txt**: Ralphセッションの進捗（`scripts/ralph/progress.txt`）
- **Beads Issues**: 構造化されたタスクと依存関係

新しいパターンや学習を発見したら、`AGENTS.md` に追加してください。

## コード品質基準

### 必須チェック

1. **型チェック**
   ```bash
   npm run build
   ```
   型エラーがないことを確認

2. **Lint**
   ```bash
   npm run lint
   ```
   Lintエラーを修正

3. **動作確認**
   - 実装した機能が期待通りに動作することを確認
   - エッジケースを考慮

### コミットメッセージ

```
feat: [sonpoGPT-xxxx] - 機能追加の説明
fix: [sonpoGPT-xxxx] - バグ修正の説明
refactor: [sonpoGPT-xxxx] - リファクタリングの説明
```

タスクID (`sonpoGPT-xxxx`) を必ず含めてください。

## 他のエージェントとの協調

### Cursorとの協調

- Gemini/Antigravityが計画を立て、Cursorが高速実装を担当
- 計画が完了したら、Cursor向けのタスクを作成: `bd create "[CURSOR] 計画に基づく実装" -p 1`

### Claude Codeとの協調

- 複雑な実装が必要な場合、Claude Codeにタスクを割り当て
- 計画に基づいて実装タスクを作成: `bd create "[CLAUDE] 複雑なロジックの実装" -p 1`

### Ralphとの協調

Ralphが動作中の場合:

1. **prd.jsonを確認**: `scripts/ralph/prd.json` でRalphのタスクを確認
2. **進捗を確認**: `scripts/ralph/progress.txt` でRalphの学習を確認
3. **パターンを共有**: 発見したパターンは `progress.txt` の「Codebase Patterns」に追加
4. **計画の提供**: Ralphのタスクに計画を提供する場合は、`prd.json`を更新

Ralphのタスクと競合する場合は、Beadsでタスクを予約してから作業を開始してください。

### 作業計画の作成

Opus 4.5で作業計画を作成する場合：

1. **現状の分析**: プロジェクトの現状を確認
2. **タスクの分解**: 大きなタスクを小さなタスクに分解
3. **優先順位の決定**: タスクの優先順位を決定
4. **エージェントの割り当て**: 各タスクに適切なエージェントを割り当て
5. **Beadsでの管理**: 計画をBeadsのタスクとして作成

計画が完了したら、各エージェントが担当するタスクに適切なタグを付けて作成してください。

## タスク完了確認フロー

### Gemini/Antigravityが確認を担当するケース

他のエージェント（Cursor, Claude Code）がタスクを完了した際、Gemini/Antigravityに確認を依頼できます：

1. **確認依頼タスクの作成**（Cursor/Claude側）
   ```bash
   bd create "[OPUS] タスク名のレビュー依頼" -p 0 --description="完了したタスクの確認事項を記述"
   ```

2. **Gemini/Antigravityが確認**
   - `bd ready` で `[OPUS]` タグのタスクを確認
   - 実装内容をレビュー
   - 問題なければ関連タスクをclose

### 確認時のチェックリスト

```bash
# 1. タスク状態を確認
bd list

# 2. 完了タスクを一括close
bd close <task-id>

# 3. 動作確認
npm run build  # 型エラーがないこと
npm run dev    # 動作すること
```

### レビュー完了後のコメント

```bash
bd comments add <task-id> "## レビュー完了 ✅
- 確認事項1: OK
- 確認事項2: OK
- 次のステップ: xxx"
```

## セッション終了時

作業を終了する前に:

1. **未完了の作業をIssue化**
   ```bash
   bd create "残りの作業の説明" -p 1
   ```

2. **品質ゲートを実行**
   ```bash
   npm run build
   npm run lint
   ```

3. **タスク状態を更新**
   ```bash
   bd close <completed-id>
   bd sync
   ```

4. **変更をプッシュ**
   ```bash
   git pull --rebase
   git push
   git status  # "up to date with origin" を確認
   ```

**重要**: `git push` が成功するまで作業は完了とみなさない

## タスクサイズの目安

- ✅ **適切**: 1つのコンテキストウィンドウで完了できる
- ✅ **適切**: 型チェックとテストが2-3分で完了
- ❌ **大きすぎる**: 複数のファイルを大幅に変更
- ❌ **大きすぎる**: 30分以上かかる作業

大きすぎるタスクは、Beadsでサブタスクに分割してください。

## 依存関係の管理

タスク間に依存関係がある場合:

```bash
bd dep add <child-id> <parent-id>
```

親タスクが完了するまで、子タスクは `bd ready` に表示されません。

## トラブルシューティング

### コンフリクトが発生した場合

1. `git status` で状態を確認
2. `git pull --rebase` で最新の変更を取得
3. コンフリクトを解決
4. `bd sync` でBeadsを同期

### タスクが見つからない場合

```bash
bd list                    # すべてのタスクを表示
bd show <id>               # 特定のタスクを表示
bd dep list <id>           # 依存関係を確認
```

### 型エラーが発生した場合

1. `npm run build` でエラーを確認
2. 関連する型定義を確認
3. 必要に応じて型を追加・修正

## 参考

- **Beads**: https://github.com/steveyegge/beads
- **AGENTS.md**: プロジェクト全体の学習とパターン
- **.cursorrules**: Cursorエージェント用のルール

