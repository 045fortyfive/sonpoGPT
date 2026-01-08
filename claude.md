# Claude Code Agent Instructions

このプロジェクトでClaude Codeエージェントが作業する際のガイドラインです。

## プロジェクト概要

- **Issue Tracking**: Beads (bd) を使用
- **役割**: Claude Codeは汎用的な開発タスクを担当
- **並列作業**: Cursor、Gemini、Claude Code、Ralphが協調して作業

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

### 優先的に担当するタスク

Claude Codeは以下のタスクを優先的に担当します：

- **汎用的な開発タスク**: 特定のエージェントに特化していない作業
- **複雑なロジック**: 詳細な設計が必要な機能
- **バグ修正**: 既存コードの修正
- **リファクタリング**: コード品質の改善

### タスクの自動分離

Beadsのタスクにラベルや優先度を使用して自動分離：

```bash
# タスク作成時にラベルを追加（可能な場合）
bd create "タスクタイトル" -p 1 --label claude

# または、タスクの説明に [CLAUDE] タグを含める
bd create "[CLAUDE] タスクタイトル" -p 1
```

タスクの説明に以下のタグがある場合、優先的に担当：
- `[CLAUDE]` - Claude Code専用
- `[GENERAL]` - 汎用的なタスク
- `[REFACTOR]` - リファクタリング

## 並列作業のルール

### タスク選択

- **優先度の高いタスク**: `bd ready` で表示される順序を尊重
- **依存関係を確認**: `bd show <id>` でブロッカーを確認
- **他のエージェントとの競合回避**: タスクを予約してから作業開始

### コンフリクト回避

1. **作業開始前**
   ```bash
   git pull --rebase
   git status  # 未コミットの変更を確認
   ```

2. **ブランチ作成**（必要に応じて）
   ```bash
   git checkout -b claude/<task-id>
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

- Cursorが高速実装を担当する場合、Claude Codeは設計やレビューを担当
- 複雑な部分はClaude Codeが担当し、シンプルな実装はCursorに任せる

### Gemini/Antigravityとの協調

- Geminiが作業計画を立てる場合、Claude Codeはその計画に基づいて実装
- GeminiがOpus 4.5で計画を立てたら、Claude Codeはその計画を尊重

### Ralphとの協調

Ralphが動作中の場合:

1. **prd.jsonを確認**: `scripts/ralph/prd.json` でRalphのタスクを確認
2. **進捗を確認**: `scripts/ralph/progress.txt` でRalphの学習を確認
3. **パターンを共有**: 発見したパターンは `progress.txt` の「Codebase Patterns」に追加

Ralphのタスクと競合する場合は、Beadsでタスクを予約してから作業を開始してください。

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
- **gemini.md**: Gemini/Antigravityエージェント用のルール
