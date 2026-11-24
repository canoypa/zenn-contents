#!/bin/sh
# 記事を書き換えたら textlint を通し、エラーを Claude に返す
f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
case "$f" in
  "$CLAUDE_PROJECT_DIR"/articles/*.md | "$CLAUDE_PROJECT_DIR"/books/*.md) ;;
  *) exit 0 ;;
esac
cd "$CLAUDE_PROJECT_DIR" || exit 0
[ -x node_modules/.bin/textlint ] || exit 0
out=$(node_modules/.bin/textlint --rulesdir .textlint/rules "$f" 2>&1) && exit 0
printf '%s\n' "$out" >&2
exit 2
