#!/bin/bash
set -e

MAX_ITERATIONS=${1:-10}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🚀 Starting Ralph"
echo "Project: $PROJECT_ROOT"
echo "Max iterations: $MAX_ITERATIONS"

cd "$PROJECT_ROOT"

# Check if prd.json exists
if [ ! -f "$SCRIPT_DIR/prd.json" ]; then
  echo "❌ Error: $SCRIPT_DIR/prd.json not found"
  echo "Please create prd.json with your user stories"
  exit 1
fi

# Check if we're using Beads
if command -v bd &> /dev/null; then
  echo "✓ Beads detected"
else
  echo "⚠️  Warning: Beads (bd) not found. Install from https://github.com/steveyegge/beads"
fi

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "═══ Iteration $i ═══"
  
  # Check if using Claude Code or AmpCode
  if command -v amp &> /dev/null; then
    AGENT_CMD="amp --dangerously-allow-all"
  elif command -v claude &> /dev/null; then
    AGENT_CMD="claude --dangerously-skip-permissions"
  else
    echo "❌ Error: No agent found (amp or claude)"
    echo "Please install AmpCode or Claude Code"
    exit 1
  fi
  
  OUTPUT=$(cat "$SCRIPT_DIR/prompt.md" \
    | $AGENT_CMD 2>&1 \
    | tee /dev/stderr) || true
  
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "✅ All stories completed!"
    exit 0
  fi
  
  # Small delay between iterations
  sleep 2
done

echo ""
echo "⚠️  Max iterations ($MAX_ITERATIONS) reached"
exit 1

