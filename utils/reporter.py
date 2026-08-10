"""Test reporter utility generating JSON summary and Excel XLSX reports for the 300 test suite."""

import os
import json
import time
import xml.etree.ElementTree as ET

def save_json_summary(test_results, output_file="reports/summary.json"):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    total = len(test_results)
    passed = sum(1 for t in test_results if t.get("status") == "PASS")
    failed = sum(1 for t in test_results if t.get("status") == "FAIL")
    skipped = sum(1 for t in test_results if t.get("status") == "SKIP")
    pass_rate = round((passed / total * 100), 2) if total > 0 else 0.0

    summary = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_tests": total,
        "passed": passed,
        "failed": failed,
        "skipped": skipped,
        "pass_rate_percentage": pass_rate,
        "results": test_results
    }

    with open(output_file, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n[Summary Report] Total: {total} | Passed: {passed} | Failed: {failed} | Pass Rate: {pass_rate}%")
    return summary

def generate_summary_from_junit(junit_path="reports/junit.xml", output_file="reports/summary.json"):
    if not os.path.exists(junit_path):
        print(f"[Reporter Notice] No JUnit XML found at {junit_path}")
        return

    tree = ET.parse(junit_path)
    root = tree.getroot()

    test_results = []
    for testcase in root.iter("testcase"):
        name = testcase.get("name", "")
        classname = testcase.get("classname", "")
        duration = float(testcase.get("time", 0.0))

        status = "PASS"
        failure_msg = None
        if testcase.find("failure") is not None:
            status = "FAIL"
            failure_msg = testcase.find("failure").text
        elif testcase.find("error") is not None:
            status = "FAIL"
            failure_msg = testcase.find("error").text
        elif testcase.find("skipped") is not None:
            status = "SKIP"

        test_results.append({
            "test_id": name,
            "classname": classname,
            "status": status,
            "duration_sec": duration,
            "failure_message": failure_msg
        })

    return save_json_summary(test_results, output_file)

if __name__ == "__main__":
    generate_summary_from_junit()
