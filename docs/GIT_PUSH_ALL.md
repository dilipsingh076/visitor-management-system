# Why only backend/docs show up in Git (and how to fix it)

## What’s going on

After `git init` and `git add .` at the **repo root**, only **backend** and **docs** show up in changes or on GitHub; **frontend-web** and **mobile** do not.

**Most likely cause:** **Nested `.git` folders.**

- **Next.js** (`create-next-app`) and **React Native** (`npx react-native init`) often run `git init` inside the app folder.
- So you can have:
  - `Visitor management systme/.git`  ← your main repo
  - `Visitor management systme/frontend-web/.git`  ← nested repo
  - `Visitor management systme/mobile/VisitorManagementApp/.git`  ← nested repo
- When the **root** repo does `git add .`, Git does **not** add the contents of a directory that has its own `.git`. So only backend and docs get tracked.

## Fix (choose one)

### Option A: Run the fix script (recommended)

From the **repo root** (folder that contains `backend`, `frontend-web`, `mobile`, `docs`):

```powershell
.\fix-git-and-push.ps1
```

Then, if the script shows frontend-web and mobile in `git status`:

```powershell
git commit -m "Add frontend-web and mobile"
git push -u origin main
```

### Option B: Fix manually

1. **Remove nested `.git` folders** (so the root repo can track those folders):

   ```powershell
   # From repo root
   if (Test-Path "frontend-web\.git") { Remove-Item -Recurse -Force "frontend-web\.git" }
   if (Test-Path "mobile\VisitorManagementApp\.git") { Remove-Item -Recurse -Force "mobile\VisitorManagementApp\.git" }
   ```

2. **Add and commit from root:**

   ```powershell
   git add .
   git status
   ```

   You should see files under `frontend-web/` and `mobile/`. Then:

   ```powershell
   git commit -m "Add frontend-web and mobile"
   git push -u origin main
   ```

## If you already pushed only backend/docs

1. Fix nested `.git` and add everything as above.
2. Commit and push:

   ```powershell
   git add .
   git commit -m "Add frontend-web and mobile"
   git push origin main
   ```

After that, GitHub will show **backend**, **docs**, **frontend-web**, and **mobile** in one repo.

## Check for nested `.git`

From repo root:

```powershell
Get-ChildItem -Path . -Filter ".git" -Recurse -Directory -Force -ErrorAction SilentlyContinue | Select-Object FullName
```

You should see only **one** `.git` (the one at the root). If you see `.git` inside `frontend-web` or `mobile\VisitorManagementApp`, remove those folders as in Option B step 1, then `git add .` again.
