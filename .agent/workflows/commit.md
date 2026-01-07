---
description: Commit and push all changes to GitHub
---

# Commit to GitHub

// turbo-all

## Steps

1. Stage all changes (new, modified, and deleted files):
```bash
git add -A
```

2. Check what's staged:
```bash
git status
```

3. Commit with a descriptive message (replace the message as appropriate):
```bash
git commit -m "Your commit message here"
```

4. Push to GitHub:
```bash
git push
```

## Quick One-Liner
If you want to commit everything quickly:
```bash
git add -A && git commit -m "Update" && git push
```

## Notes
- Use `-A` to include all changes (new files, modifications, deletions)
- Always write meaningful commit messages for better history
- If you get a merge conflict, I'll help you resolve it
