# Fix Git: so root repo tracks frontend-web and mobile (not just backend/docs)
# Run this from the repo root: .\fix-git-and-push.ps1
#
# Why: create-next-app and react-native init often run "git init" inside the app folder.
#      When a subfolder has its own .git, the root repo does NOT add those files.
#      Removing nested .git lets the root repo track everything.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "Repo root: $root" -ForegroundColor Cyan

# 1. Remove nested .git so root repo can track frontend-web and mobile
$nested = @(
    "frontend-web\.git",
    "mobile\VisitorManagementApp\.git"
)
foreach ($path in $nested) {
    $full = Join-Path $root $path
    if (Test-Path $full) {
        Write-Host "Removing nested repo: $path" -ForegroundColor Yellow
        Remove-Item -Recurse -Force $full
    } else {
        Write-Host "No nested .git at: $path" -ForegroundColor Gray
    }
}

# 2. Add all files from root (now frontend-web and mobile will be included)
Write-Host "`nAdding all files from root..." -ForegroundColor Cyan
git add .

# 3. Show status
Write-Host "`nGit status:" -ForegroundColor Cyan
git status --short

Write-Host "`nDone. If you see frontend-web/ and mobile/ in the list above, run:" -ForegroundColor Green
Write-Host "  git commit -m \"Add frontend-web and mobile\""
Write-Host "  git push -u origin main"
Write-Host "`nIf frontend-web or mobile still don't appear, run: git status and check for nested .git in other subfolders." -ForegroundColor Gray
