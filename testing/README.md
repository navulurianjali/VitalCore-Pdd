# VitalCore Testing Suite — 1200 Test Cases

Central testing folder for all four testing types in the VitalCore project.

## Structure

```
testing/
├── selenium/          # 300 Web E2E tests (Selenium + Python)
├── dast/              # 300 Security tests (OWASP ZAP + HTTP)
├── backend/           # 300 Backend/API tests (pytest + requests)
├── appium/            # 300 Mobile E2E tests (Appium + TypeScript)
└── README.md
```

## Test Summary

| Type      | Count | Technology           | Target                   |
|-----------|-------|----------------------|--------------------------|
| Selenium  | 300   | Python + Selenium 4  | VitalCore web app        |
| DAST      | 300   | Python + OWASP ZAP   | VitalCore web app (sec)  |
| Backend   | 300   | pytest + requests    | Next.js API + Supabase   |
| Appium    | 300   | TypeScript + Appium  | VitalCore Expo Android   |
| **Total** | **1200** |                   |                          |

## Prerequisites

### Python (Backend, DAST, Selenium)
```bash
pip install pytest requests openpyxl selenium python-dotenv python-owasp-zap-v2.4
```

### Node.js (Appium)
```bash
cd testing/appium
npm install
```

### OWASP ZAP (DAST)
- Download ZAP from https://www.zaproxy.org/download/
- Start ZAP in daemon mode: `zap.sh -daemon -port 8080`

### Appium Server
```bash
npm install -g appium
appium
```

## Running Tests

### Backend (300 API tests)
```bash
cd testing/backend
pip install -r requirements.txt
APP_URL=http://localhost:3000 pytest tests/ -v --tb=short
```

### Selenium (300 E2E tests)
```bash
cd testing/selenium
pip install -r requirements.txt
APP_URL=http://localhost:3000 pytest tests/ -v --tb=short
```

### DAST (300 Security tests)
```bash
cd testing/dast
APP_URL=http://localhost:3000 python tests/test_cases_300.py
```

### Appium (300 Mobile E2E tests)
```bash
cd testing/appium
npm run test
```

## Environment Variables

| Variable                   | Description                    | Default                        |
|----------------------------|--------------------------------|--------------------------------|
| `BASE_URL` / `APP_URL`     | VitalCore Next.js app URL      | `http://127.0.0.1:3000`       |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL           | (from .env.local)              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | (from .env.local)              |
| `TEST_EMAIL`               | Test user email for auth tests | `testuser@vitalcore.ai`        |
| `TEST_PASSWORD`            | Test user password             | `VitalCoreTest123!`            |
| `ZAP_PROXY`                | OWASP ZAP proxy URL            | `http://127.0.0.1:8080`        |

## Reports

All test reports are generated automatically after test execution:

- `testing/backend/reports/backend_results.xlsx` — Excel report
- `testing/backend/reports/backend_results.html` — HTML report  
- `testing/backend/reports/backend_results.json` — JSON report
- `testing/dast/reports/dast_results.xlsx` — DAST Excel report
- `testing/dast/reports/dast_results.html` — DAST HTML report
- `testing/selenium/reports/` — Selenium HTML reports
- `testing/appium/reports/` — Appium test reports
