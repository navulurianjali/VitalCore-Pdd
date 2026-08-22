from datetime import datetime
from .config import HTML_REPORT_PATH

def generate_html_report(test_results, total_duration_seconds):
    """
    Generates a clean HTML report summarizing test execution results.
    """
    total_tests = len(test_results)
    passed_tests = sum(1 for item in test_results if item['status'] == 'PASS')
    failed_tests = sum(1 for item in test_results if item['status'] == 'FAIL')
    skipped_tests = sum(1 for item in test_results if item['status'] == 'SKIPPED')
    
    pass_pct = round((passed_tests / total_tests * 100), 2) if total_tests > 0 else 0.0

    rows_html = ""
    for item in test_results:
        st = item.get("status", "PASS")
        status_bg = "#dcfce7" if st == "PASS" else ("#fee2e2" if st == "FAIL" else "#fef3c7")
        status_color = "#166534" if st == "PASS" else ("#991b1b" if st == "FAIL" else "#92400e")
        
        err_msg = item.get("error", "")
        err_html = f"<div class='error-msg'>{err_msg}</div>" if err_msg else "-"
        
        screenshot = item.get("screenshot", "")
        img_html = f"<a href='{screenshot}' target='_blank'>View Screenshot</a>" if screenshot else "-"

        rows_html += f"""
        <tr>
            <td><code>{item.get('test_id', '-')}</code></td>
            <td>{item.get('module', '-')}</td>
            <td><strong>{item.get('name', '-')}</strong><br><small>{item.get('description', '')}</small></td>
            <td><span class='badge' style='background:{status_bg}; color:{status_color}'>{st}</span></td>
            <td>{round(item.get('duration', 0), 2)}s</td>
            <td>{img_html}</td>
            <td>{err_html}</td>
        </tr>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VitalCore Selenium Test Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }}
        h1 {{ margin-top: 0; color: #1e293b; font-size: 24px; font-weight: 700; }}
        .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; }}
        .metric-card {{ background: #f1f5f9; padding: 16px; border-radius: 12px; text-align: center; }}
        .metric-value {{ font-size: 28px; font-weight: 800; margin-top: 4px; }}
        .metric-label {{ font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 14px; }}
        th, td {{ padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; vertical-align: top; }}
        th {{ background-color: #0f172a; color: #ffffff; font-weight: 600; }}
        .badge {{ padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; display: inline-block; }}
        .error-msg {{ color: #dc2626; font-size: 12px; max-width: 300px; word-break: break-word; font-family: monospace; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 VitalCore Selenium Automation Report</h1>
        <p>Execution Date: <strong>{datetime.now().strftime('%B %d, %Y - %H:%M:%S')}</strong> | Duration: <strong>{round(total_duration_seconds, 2)}s</strong></p>

        <div class="metrics-grid">
            <div class="metric-card"><div class="metric-label">Total Tests</div><div class="metric-value">{total_tests}</div></div>
            <div class="metric-card" style="background:#dcfce7;"><div class="metric-label" style="color:#166534">Passed</div><div class="metric-value" style="color:#166534">{passed_tests}</div></div>
            <div class="metric-card" style="background:#fee2e2;"><div class="metric-label" style="color:#991b1b">Failed</div><div class="metric-value" style="color:#991b1b">{failed_tests}</div></div>
            <div class="metric-card" style="background:#fef3c7;"><div class="metric-label" style="color:#92400e">Skipped</div><div class="metric-value" style="color:#92400e">{skipped_tests}</div></div>
            <div class="metric-card"><div class="metric-label">Pass Rate</div><div class="metric-value" style="color:#2563eb">{pass_pct}%</div></div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Test ID</th>
                    <th>Module</th>
                    <th>Test Case</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Screenshot</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
    </div>
</body>
</html>
"""
    with open(HTML_REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    return HTML_REPORT_PATH
