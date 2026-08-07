# VitalCore Expo App - Troubleshooting & Diagnostic Guide

## Common Issues & Resolutions

### 1. Appium Server Connection Refused (`ECONNREFUSED 127.0.0.1:4723`)
- **Cause**: Appium server is not running or started on a custom port.
- **Fix**: Run `appium --port 4723` in a separate terminal before starting tests.

### 2. Android Emulator Startup Timeout in GitHub Actions
- **Cause**: Hardware virtualization (KVM) unavailable on standard runner.
- **Fix**: Ensure runner is set to `ubuntu-latest` and `reactivecircus/android-emulator-runner@v2` is configured with `arch: x86_64`.

### 3. GitHub Pages Deployment Permission Error (HTTP 403)
- **Cause**: Workflow lacks write permissions or GitHub Pages is disabled.
- **Fix**: Go to **Settings > Actions > General > Workflow permissions** and select **Read and write permissions**. Enable GitHub Pages source branch `gh-pages`.
