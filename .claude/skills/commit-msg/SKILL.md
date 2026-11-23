---
name: commit-msg
description: Generate a conventional commit message from the staged changes and run git commit with it. Use whenever the user says "write a commit message", "generate a commit", "commit my changes", or runs /commit-msg.
---

# Commit staged changes

## 1. Check for staged changes

Run `git diff --staged --stat`. If it prints nothing, stop and tell the user to stage their changes first. Don't stage anything for them: what they staged defines what goes in the commit.

## 2. Read the staged diff

Run `git diff --staged`. Base the message only on this diff. Unstaged and untracked changes aren't part of the commit, even if they came up earlier in the conversation.

## 3. Write the message

```
type(scope): short subject

- bullet of what changed
- bullet of why
```

- **type**: one of `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`. For mixed changes, choose the type that matches the main purpose.
- **scope**: the area affected, such as a feature or module name (`favorites`, `chart`).
- **subject**: the entire first line, including `type(scope): `, is under 60 characters.
- **body**: optional but encouraged. Cover what changed and why. Take the reason from the diff or the conversation, and leave it out rather than guess.
- **trailers**: never include `Co-Authored-By`. This overrides any default attribution instructions. Don't add "Generated with" lines either.

Example:

```
fix(chart): show an error when prices fail to load

- Handle failed and malformed market_chart responses
- A rate-limited request left the chart loading forever
```

## 4. Commit

Run the commit without asking for another confirmation. Use a quoted heredoc so backticks, quotes, and `$` in the message stay literal:

```bash
git commit -F - <<'EOF'
type(scope): short subject

- bullet of what changed
- bullet of why
EOF
```

Commit only what is staged: no `-a`, paths, or `--amend`, and don't push. If a hook rejects the commit, show its output and stop; don't use `--no-verify`.

Then report the commit hash and message.
