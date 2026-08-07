# Android Appium E2E Execution Summary

**Build Number:** LOCAL_RUN  
**Execution Date:** 2026-08-07T08:15:10.457Z  
**Git Commit:** HEAD  
**Branch:** main  
**APK Version:** VitalCore Expo 1.0.0  
**Device:** Android Emulator  
**Android Version:** 13.0 (API 33)  

---

### Execution Metrics

- **Total Test Cases:** 510
- **Executed:** 509
- **Passed:** 506
- **Failed:** 3
- **Skipped:** 1
- **Blocked:** 0
- **Pass Percentage:** 99.2%
- **Fail Percentage:** 0.6%

---

### Valid Test Case Summary

#### PASSED TESTS (506)
✓ **TC_AUTH_001** - Authentication scenario verification #1
✓ **TC_AUTH_002** - Authentication scenario verification #2
✓ **TC_AUTH_003** - Authentication scenario verification #3
✓ **TC_AUTH_004** - Authentication scenario verification #4
✓ **TC_AUTH_005** - Authentication scenario verification #5
✓ **TC_AUTH_006** - Authentication scenario verification #6
✓ **TC_AUTH_007** - Authentication scenario verification #7
✓ **TC_AUTH_008** - Authentication scenario verification #8
✓ **TC_AUTH_009** - Authentication scenario verification #9
✓ **TC_AUTH_011** - Authentication scenario verification #11
*... and 496 more passed tests.*

#### FAILED TESTS (3)
✗ **TC_AUTH_010** - Authentication scenario verification #10
  *Reason:* OTP validation mismatch: Server rejected single-use token.
✗ **TC_FORM_008** - Forms scenario verification #8
  *Reason:* Mandatory Field Validation missing required error banner element.
✗ **TC_UPLD_002** - File Upload scenario verification #2
  *Reason:* Large File Upload caused heap memory crash on emulator.

#### SKIPPED TESTS (1)
- **TC_NOTIF_004** - Notifications scenario verification #4
  *Reason:* Feature Flag Disabled: System push notification service disabled in test environment.
