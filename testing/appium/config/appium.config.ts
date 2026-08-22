import 'dotenv/config';

export interface AppiumCapabilities {
  platformName: string;
  'appium:automationName': string;
  'appium:deviceName': string;
  'appium:platformVersion'?: string;
  'appium:app'?: string;
  'appium:appPackage'?: string;
  'appium:appActivity'?: string;
  'appium:autoGrantPermissions'?: boolean;
  'appium:noReset'?: boolean;
  'appium:fullReset'?: boolean;
  'appium:newCommandTimeout'?: number;
  'appium:avd'?: string;
  'appium:uiautomator2ServerInstallTimeout'?: number;
  'appium:adbExecTimeout'?: number;
}

export const appiumConfig = {
  host: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  connectionRetryTimeout: 10000,
  connectionRetryCount: 1,
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13.0',
    'appium:app': process.env.APK_PATH || './app-debug.apk',
    'appium:appPackage': process.env.APP_PACKAGE || 'com.vitalcore.app',
    'appium:appActivity': process.env.APP_ACTIVITY || 'com.vitalcore.app.MainActivity',
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:newCommandTimeout': 300,
    'appium:uiautomator2ServerInstallTimeout': 60000,
    'appium:adbExecTimeout': 60000,
  } as AppiumCapabilities,
  reportsDir: process.env.REPORTS_DIR || './Test Results',
  simulate: process.env.SIMULATE === 'true',
};

export const testCredentials = {
  validUser: {
    email: process.env.TEST_EMAIL || 'testuser@vitalcore.app',
    password: process.env.TEST_PASSWORD || 'TestPass@123',
  },
  email: process.env.TEST_EMAIL || 'testuser@vitalcore.app',
  password: process.env.TEST_PASSWORD || 'TestPass@123',
};
