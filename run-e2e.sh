#!/bin/bash
set -e

echo "════════════════════════════════════════════════════════════════"
echo "🚀 Starting Appium Server on port 4723..."
echo "════════════════════════════════════════════════════════════════"
nohup appium --port 4723 --relaxed-security --log-timestamp --local-timezone > appium_server.log 2>&1 &
APPIUM_PID=$!

cleanup() {
  echo "🛑 Stopping Appium Server (PID: $APPIUM_PID)..."
  kill $APPIUM_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "⏳ Waiting for Appium Server to be ready..."
for i in $(seq 1 30); do
  if curl -s http://127.0.0.1:4723/status 2>/dev/null | grep -q '"ready":true'; then
    echo "✅ Appium server is online and ready!"
    break
  fi
  echo "Waiting for Appium server... ($i/30)"
  sleep 1
done

echo "📱 Verifying Android Device..."
adb devices
adb wait-for-device

echo "════════════════════════════════════════════════════════════════"
echo "🧪 Executing VitalCore Appium 30 E2E Test Suite..."
echo "════════════════════════════════════════════════════════════════"
cd vitalcore-expo
npx ts-node appium-tests/runner/runAll.ts
TEST_EXIT_CODE=$?

echo "✅ Appium E2E Test execution finished with code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE
