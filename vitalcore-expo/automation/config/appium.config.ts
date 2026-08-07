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
}

export const appiumConfig = {
  host: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.ANDROID_PLATFORM_VERSION || '13.0',
    'appium:app': process.env.APK_PATH || './app-debug.apk',
    'appium:appPackage': 'com.vitalcore.app',
    'appium:appActivity': 'com.vitalcore.app.MainActivity',
    'appium:autoGrantPermissions': true,
    'appium:noReset': false,
    'appium:newCommandTimeout': 300,
  } as AppiumCapabilities,
  outputDir: process.env.REPORTS_DIR || './Test Results',
};
