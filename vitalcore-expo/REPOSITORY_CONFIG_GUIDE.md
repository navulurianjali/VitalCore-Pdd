# VitalCore Expo App - Repository & GitHub Pages Setup Guide

## Live Report URL
After pipeline execution, your reports will be live at:
`https://<github-username>.github.io/<repository-name>/reports/latest/execution-report.html`

## Step-by-Step GitHub Pages Configuration
1. Push code to GitHub repository (`navulurianjali/VitalCore-Pdd`).
2. Go to repository **Settings** -> **Pages**.
3. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `gh-pages` / `/ (root)`
4. Go to **Settings** -> **Actions** -> **General**:
   - Select **Read and write permissions**.
   - Check **Allow GitHub Actions to create and approve pull requests**.
5. Save settings.
