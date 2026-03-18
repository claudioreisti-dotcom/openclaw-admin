#!/bin/bash
cd /home/claudioreis/.openclaw/workspace
git add -A
git diff --cached --quiet || git commit -m "chore: backup automático $(date '+%Y-%m-%d %H:%M')" && git push
