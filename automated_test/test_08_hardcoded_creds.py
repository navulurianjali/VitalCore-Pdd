"""
DAST Category 8: Hardcoded Credentials & Secrets Scan
Statically scan the codebase for:
  - Hardcoded API keys / tokens / secrets
  - Committed .env values
  - Admin email addresses embedded in source
  - Known patterns: Supabase anon keys, Gemini keys, AWS keys, GCP keys, etc.
"""
import os, re, json
from datetime import datetime
from pathlib import Path

# Patterns that should never appear in committed source files
PATTERNS = [
    # Generic secrets
    (r"(?i)(password|passwd|pwd)\s*=\s*['\"][^'\"]{4,}", "Hardcoded password"),
    (r"(?i)(secret|api_key|apikey|api-key)\s*[=:]\s*['\"][^'\"]{8,}", "Hardcoded secret/API key"),
    # Supabase
    (r"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+", "Supabase JWT token in source"),
    # Gemini / Google
    (r"AIza[0-9A-Za-z\-_]{35}", "Google API key (AIza...)"),
    (r"AQ\.[a-zA-Z0-9\-_]{30,}", "Gemini API key pattern"),
    # AWS
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    (r"(?i)aws_secret_access_key\s*=\s*['\"][^'\"]{20,}", "AWS Secret Key"),
    # GitHub
    (r"ghp_[0-9a-zA-Z]{36}", "GitHub PAT"),
    # Slack
    (r"xox[baprs]-[0-9A-Za-z\-]{10,}", "Slack token"),
    # Admin email in source
    (r"admin@vitalcore\.ai", "Hardcoded admin email"),
    # Bearer tokens hardcoded
    (r"Bearer [A-Za-z0-9\-_\.]{20,}", "Hardcoded Bearer token"),
    # Private keys
    (r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----", "Private key in source"),
]

SKIP_DIRS  = {".git", ".next", "node_modules", "__pycache__", ".pytest_cache"}
SKIP_EXTS  = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff",
              ".woff2", ".ttf", ".eot", ".svg", ".lock", ".tsbuildinfo",
              ".xlsx", ".pdf", ".zip"}
SKIP_FILES = {"package-lock.json", "yarn.lock"}

def run(project_root: str, base_url=None, user_token=None, admin_token=None):
    results = []
    root    = Path(project_root)

    for filepath in root.rglob("*"):
        # Skip non-files
        if not filepath.is_file():
            continue
        # Skip binary / excluded dirs / excluded ext
        if any(part in SKIP_DIRS for part in filepath.parts):
            continue
        if filepath.suffix.lower() in SKIP_EXTS:
            continue
        if filepath.name in SKIP_FILES:
            continue

        try:
            content = filepath.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        for pattern, label in PATTERNS:
            for m in re.finditer(pattern, content):
                line_num = content[:m.start()].count("\n") + 1
                matched  = m.group()
                # Redact the sensitive value beyond first 6 chars for the report
                redacted = matched[:6] + "…[REDACTED]" if len(matched) > 6 else "[REDACTED]"

                # Is this file in .gitignore scope?
                is_env     = filepath.suffix in (".env", ".local") or ".env" in filepath.name
                is_ignored = (
                    ".env.local" in str(filepath) or
                    filepath.name.startswith(".env")
                )

                # .env.local is in .gitignore, but we still flag it as informational
                # because it contains real keys that shouldn't be committed to git
                finding  = True
                severity = "Low" if is_ignored else "Critical"

                note = (
                    f"File: {filepath.relative_to(root)} | Line {line_num} | "
                    f"Match (redacted): {redacted} | "
                    f"{'In .gitignore scope (good) but contains live key' if is_ignored else 'NOT in .gitignore — committed secret!'}"
                )

                results.append({
                    "endpoint": str(filepath.relative_to(root)),
                    "method":   "STATIC",
                    "role":     "N/A",
                    "status":   "N/A",
                    "expected_status": "N/A",
                    "finding":  finding,
                    "severity": severity,
                    "response_time_ms": 0,
                    "test_category": "Hardcoded Creds",
                    "note": note,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                })
                marker = "⚠ FINDING" if severity != "Low" else "ℹ info"
                print(f"  [{marker}] Hardcoded Creds ({label}) | {filepath.relative_to(root)}:{line_num} → severity={severity}")

    if not results:
        results.append({
            "endpoint": "CODEBASE", "method": "STATIC", "role": "N/A",
            "status": "N/A", "expected_status": "N/A",
            "finding": False, "severity": "Info",
            "response_time_ms": 0, "test_category": "Hardcoded Creds",
            "note": "No hardcoded secrets detected in committed source files.",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })
        print("  [✓ pass] Hardcoded Creds | No secrets found in source files")

    return results
