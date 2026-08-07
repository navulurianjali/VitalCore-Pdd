# VitalCore Expo App - CI/CD Execution Guide

## Overview
The CI/CD pipeline runs automatically on every `push`, `pull_request`, scheduled nightly cron, or manual trigger (`workflow_dispatch`).

## 21 Execution Pipeline Stages
1. **Checkout Repository**: Pulls latest commit code.
2. **Setup Java**: Configures JDK 17 for Android SDK utilities.
3. **Setup Android SDK**: Configures platform-tools, build-tools, and AVD managers.
4. **Install Android Dependencies**: Downloads npm packages.
5. **Build APK**: Exports Android app bundle.
6. **Start Android Emulator**: Boots Android API 33 Pixel 6 AVD.
7. **Verify Emulator Readiness**: Runs `adb devices` health check.
8. **Install APK**: Installs `app-debug.apk` onto emulator.
9. **Start Appium Server**: Boots Appium with UiAutomator2 driver.
10. **Verify Appium Health**: Queries `http://127.0.0.1:4723/status`.
11. **Execute Appium E2E Tests**: Runs master test runner (`runSuites.ts`).
12. **Capture Screenshots**: Captures element and device screens on failure.
13. **Capture Logs**: Stores Appium and ADB logcat logs.
14. **Generate Excel Report**: Emits 4 workbooks with 7 summary sheets.
15. **Generate HTML Report**: Emits single-page interactive HTML report.
16. **Generate JSON Report**: Emits `execution-results.json`.
17. **Generate Markdown Summary**: Emits `summary.md`.
18. **Upload Artifacts**: Retains outputs in GitHub Actions for 30 days.
19. **Publish Reports to GitHub Pages**: Publishes to `gh-pages` branch.
20. **Update Historical Reports**: Archives under `reports/history/build-N/`.
21. **Publish Action Summary**: Appends metrics to `$GITHUB_STEP_SUMMARY`.
