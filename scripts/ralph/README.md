# Ralph - Autonomous AI Coding Loop

Ralphは自動化されたAIコーディングループで、機能を反復的に実装します。

## 概要

Ralphは以下のように動作します：

1. `prd.json`からユーザーストーリーを読み取る
2. `progress.txt`から学習を読み取る
3. `passes: false`の最高優先度ストーリーを選択
4. ストーリーを実装
5. 型チェックとテストを実行
6. パスしたらコミット
7. `prd.json`と`progress.txt`を更新
8. すべてのストーリーが完了するまで繰り返し

## セットアップ

### 1. prd.jsonの準備

`prd.json`にユーザーストーリーを定義します：

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

### 2. エージェントの確認

Ralphは以下のエージェントをサポート：

- **AmpCode**: `amp --dangerously-allow-all`
- **Claude Code**: `claude --dangerously-skip-permissions`

どちらかがインストールされている必要があります。

### 3. Beadsの統合（オプション）

Beadsがインストールされている場合、Ralphは自動的にタスクを作成・管理します。

## 実行方法

```bash
# デフォルト（10回まで）
npm run ralph

# または直接実行
./scripts/ralph/ralph.sh 25  # 25回まで実行
```

## ストーリーサイズのガイドライン

### ✅ 適切なサイズ

- 1つのコンテキストウィンドウで完了できる
- 型チェックとテストが2-3分で完了
- 明確な受け入れ基準がある

### ❌ 大きすぎる

- 複数のファイルを大幅に変更
- 30分以上かかる作業
- 曖昧な受け入れ基準

大きすぎるストーリーは、Beadsでサブタスクに分割してください。

## 進捗の確認

```bash
# ストーリーの状態
cat scripts/ralph/prd.json | jq '.userStories[] | {id, passes}'

# 学習内容
cat scripts/ralph/progress.txt

# コミット履歴
git log --oneline -10
```

## トラブルシューティング

### エージェントが見つからない

```bash
# AmpCodeのインストール確認
which amp

# Claude Codeのインストール確認
which claude
```

### 型エラーが発生する

`npm run build`でエラーを確認し、修正してください。

### コンフリクトが発生する

```bash
git pull --rebase
# コンフリクトを解決
git push
```

## ベストプラクティス

1. **小さなストーリー**: 1つずつ完了させる
2. **明確な基準**: 受け入れ基準を具体的に
3. **フィードバックループ**: 型チェックとテストを必須に
4. **学習の記録**: パターンは`progress.txt`に追加
5. **AGENTS.md更新**: 再利用可能なパターンは`AGENTS.md`にも追加

## 参考

- [Ralphの元の投稿](https://x.com/finnbags/status/2008725074296402071)
- [Beads Documentation](https://github.com/steveyegge/beads)
- `AGENTS.md` - プロジェクト全体の学習

