# Agent Instructions

This project uses **bd** (beads) for issue tracking and supports **multi-agent parallel development** with Cursor, Gemini, and Ralph.

## Multi-Agent Setup

This project is configured for parallel work by multiple AI agents:

- **Cursor**: Interactive development and code review (see `.cursorrules`)
- **Gemini**: Parallel task execution (see `gemini.md`)
- **Ralph**: Automated iterative development loop (see `scripts/ralph/`)

All agents coordinate through Beads issue tracking to avoid conflicts.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
bd dep add <child> <parent>  # Link tasks
```

## Ralph Automated Development

Ralph is an autonomous AI coding loop that ships features iteratively.

### Running Ralph

```bash
./scripts/ralph/ralph.sh [max_iterations]
```

Example:
```bash
./scripts/ralph/ralph.sh 25  # Run up to 25 iterations
```

### Ralph Workflow

1. Reads `scripts/ralph/prd.json` for user stories
2. Reads `scripts/ralph/progress.txt` for learnings
3. Picks highest priority story where `passes: false`
4. Implements the story
5. Runs typecheck and tests
6. Commits if passing
7. Updates `prd.json` and `progress.txt`
8. Repeats until all stories pass

### Ralph Configuration

- **prd.json**: User stories with acceptance criteria
- **progress.txt**: Session learnings and codebase patterns
- **prompt.md**: Instructions for each iteration

Ralph integrates with Beads - it creates and closes tasks automatically.

## Commit Rules

**重要**: 1タスク1コミットを徹底してください。

- 各タスクは独立したコミットとして記録
- 複数のタスクを1つのコミットにまとめない
- コミットメッセージにタスクIDを含める: `feat: [sonpoGPT-xxxx] - [説明]`
- タスク完了時に必ずコミットしてから`bd close`

例：
```bash
# ✅ 良い例: 1タスク1コミット
git commit -m "feat: [sonpoGPT-xxxx] - タスクの説明"

# ❌ 悪い例: 複数タスクを1つのコミットに
git commit -m "feat: [sonpoGPT-xxxx] [sonpoGPT-yyyy] - 複数のタスク"
```

## Parallel Work Coordination

### Task Selection

- Use `bd ready` to find tasks with no blockers
- Check `bd show <id>` for dependencies
- Reserve tasks with `bd update <id> --status in_progress`

### Conflict Avoidance

1. **Work on different files** when possible
2. **Use separate branches** for major features
3. **Frequent commits** to minimize conflicts
4. **Check before starting**: `git status` and `git pull --rebase`

### Memory Sharing

- **AGENTS.md** (this file): Project-wide patterns and learnings
- **progress.txt**: Ralph session memory (`scripts/ralph/progress.txt`)
- **Beads Issues**: Structured task tracking with dependencies

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## Codebase Patterns

Add reusable patterns here as they are discovered:

- **Next.js**: Server actions in `app/actions.ts`
- **TypeScript**: Export types from `types.ts`
- **React**: Use `useRef<Timeout | null>(null)` for timeouts

## File Structure

```
sonpoGPT/
├── .beads/              # Beads database
├── scripts/
│   └── ralph/          # Ralph automation
│       ├── ralph.sh
│       ├── prompt.md
│       ├── prd.json
│       └── progress.txt
├── AGENTS.md           # This file
├── .cursorrules        # Cursor agent rules
└── gemini.md           # Gemini agent rules
```
