# VitalCore Expo App - Local Appium Execution Guide

## Prerequisites
1. **Node.js** (v18 or higher) & npm
2. **Java Development Kit (JDK 17)**
3. **Android Studio & SDK**: `ANDROID_HOME` configured in environment variables.
4. **Appium Server**:
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   ```

## Running Appium Tests Locally

1. **Navigate to the automation directory**:
   ```bash
   cd vitalcore-expo/automation
   ```

2. **Install Automation Dependencies**:
   ```bash
   npm install
   ```

3. **Start Local Appium Server**:
   ```bash
   appium
   ```

4. **Execute 430+ Test Case Suite**:
   ```bash
   npm test
   ```

5. **View Generated Reports**:
   - **Excel Workbooks**: `Test Results/Excel/Automation_Test_Report.xlsx`
   - **HTML Dashboard**: `Test Results/HTML/execution-report.html`
   - **JSON Results**: `Test Results/JSON/execution-results.json`
   - **Markdown Summary**: `Test Results/Summary/summary.md`
