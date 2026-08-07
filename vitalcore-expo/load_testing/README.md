# VitalCore Expo — Load / Baseline Testing Suite

## 📁 Folder Structure

```
load_testing/
├── config.py              ← Central config (users, duration, endpoints, Appium caps)
├── api_load_test.py       ← 100 virtual users → Supabase + Vercel API (HTTP)
├── appium_load_test.py    ← Appium UI flows on real Android device/emulator
├── run_all_tests.py       ← Runs both tests simultaneously + merged report
├── requirements.txt       ← Python dependencies
└── README.md              ← This file
```

---

## ⚙️ One-Time Setup

### 1. Install Python dependencies
```powershell
cd D:\vitalcore-expo\load_testing
pip install -r requirements.txt
```

### 2. Install Appium 2 (global)
```powershell
npm install -g appium
appium driver install uiautomator2
```

### 3. Start Appium server
```powershell
# Open a NEW terminal and keep it running
appium --port 4723
```

### 4. Verify your device / emulator
```powershell
adb devices
# Example output:  emulator-5554   device
```

### 5. Build & install the Expo APK (if not already on device)
```powershell
cd D:\vitalcore-expo
npx expo run:android
# or install a pre-built APK:
# adb install path\to\vitalcore.apk
```

### 6. Update `config.py` if needed
- Change `appium:deviceName` to match your `adb devices` output
- Change `appium:platformVersion` to your Android version
- Change `appium:appPackage` / `appium:appActivity` if they differ

---

## 🚀 Running the Tests

### Option A — API only (no device required, full 100 VU)
```powershell
cd D:\vitalcore-expo\load_testing
python api_load_test.py
```

### Option B — Appium UI only (device required)
```powershell
cd D:\vitalcore-expo\load_testing
python appium_load_test.py
```

### Option C — Both simultaneously (recommended)
```powershell
cd D:\vitalcore-expo\load_testing
python run_all_tests.py
```

---

## 📊 What You Will See

### Live progress (every 10 seconds)
```
[ 10s] Requests so far: 8,421  |  RPS ≈ 84.2
[ 20s] Requests so far: 16,900 |  RPS ≈ 84.5
[ 30s] Requests so far: 25,311 |  RPS ≈ 84.4
...
```

### Final report (printed + saved)
```
========================================================================
  VitalCore Expo  ·  API Baseline / Load Test Report
========================================================================
  Virtual Users  : 100
  Duration       : 60.12 s
  Total Requests : 51,480
  Overall RPS    : 856.8 req/s

  ── OVERALL RESPONSE TIMES ──────────────────────────────────────────
  Avg   : 120 ms    Min : 18 ms    Max : 1450 ms
  P50   : 98 ms     P90 : 280 ms
  P95   : 410 ms    P99 : 890 ms

========================================================================
  ── PER-ENDPOINT BREAKDOWN ──────────────────────────────────────────
========================================================================

  Endpoint   : GET  profiles (anon, limit 1)
  Calls      : 10,290   Errors: 0   Success: 100.0%
  Avg: 105 ms  |  Min: 22 ms  |  Max: 980 ms
  P50: 88 ms   |  P90: 260 ms  |  P95: 380 ms  |  P99: 740 ms
  Status Codes: HTTP 200: 10290
  ------------------------------------------------------------------------
```

---

## 📁 Output Files

| File | Description |
|------|-------------|
| `load_test_report.txt` | Human-readable API test report |
| `load_test_report.json` | Machine-readable API test report |
| `appium_load_test_report.txt` | Human-readable Appium UI test report |
| `appium_load_test_report.json` | Machine-readable Appium UI test report |
| `load_test_merged_report.json` | Both reports combined |

---

## 🎯 Test Parameters Summary

| Parameter | Value |
|-----------|-------|
| **Virtual Users** | 100 |
| **Duration** | 60 seconds |
| **Ramp-Up** | 5 seconds |
| **Endpoints Tested** | 5 Supabase + 4 Vercel = 9 total |
| **Appium UI Flows** | launch, login screen, register screen, scroll |
| **Metrics** | RPS, Avg/Min/Max, P50, P90, P95, P99 |

---

## 🔍 Interpreting Results

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| **P95 Response** | < 300ms | 300–800ms | > 800ms |
| **Error Rate** | < 1% | 1–5% | > 5% |
| **RPS** | > 200 | 50–200 | < 50 |
| **Max Response** | < 1s | 1–3s | > 3s |
