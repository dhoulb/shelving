#!/usr/bin/env bash
# Publish a folder to a folder on the `docs` branch (served by GitHub Pages), without a full checkout.
#
# Usage: deploy-docs.sh <source folder> <destination folder> [keep]
# - `pr-454`: replace `pr-454/` on the branch with the source folder (a PR preview).
# - `. keep`: copy the source folder onto the branch root and keep all other files (the `main` deploy).
#   Old root files and every `pr-*/` preview stay.
# - An empty source folder removes the destination folder (the preview teardown).
#
# The `docs` branch holds every deploy and PR preview (hundreds of MB). This script clones only its newest commit,
# with no file contents (`--filter=blob:none`), and checks out no files except `CNAME` (sparse checkout). So it
# downloads almost nothing, and only the changed files go up in the push.
#
# The branch has many writers (each PR preview and each `main` deploy), so a push can fail as non-fast-forward.
# Then the script fetches the new tip and applies the change again, up to 5 times.
set -euo pipefail

SOURCE=$(realpath "$1")
DEST=$2
KEEP=${3:-}
REMOTE="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
WORK=$(mktemp -d)

git clone --quiet --depth 1 --filter=blob:none --no-checkout --single-branch --branch docs "$REMOTE" "$WORK"
cd "$WORK"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git sparse-checkout set --no-cone /CNAME
git checkout --quiet docs

for attempt in 1 2 3 4 5; do
	if [ "$KEEP" != "keep" ]; then
		git rm -r -q --cached --sparse --ignore-unmatch -- "$DEST"
	fi
	mkdir -p "$DEST"
	cp -r "$SOURCE"/. "$DEST"/
	git add --sparse -A -- "$DEST"
	if git diff --cached --quiet; then
		echo "Nothing changed in ${DEST}."
		exit 0
	fi
	git commit --quiet -m "deploy: ${GITHUB_SHA} to ${DEST}"
	if git push --quiet origin HEAD:docs; then
		echo "Published ${DEST} (attempt ${attempt})."
		exit 0
	fi
	echo "Push raced with another deploy on attempt ${attempt}. Fetching the new tip and trying again."
	sleep $((attempt * 2))
	git fetch --quiet --depth 1 origin docs
	git reset --quiet --soft FETCH_HEAD
	git reset --quiet
done
echo "::error::Failed to publish ${DEST} after 5 attempts."
exit 1
