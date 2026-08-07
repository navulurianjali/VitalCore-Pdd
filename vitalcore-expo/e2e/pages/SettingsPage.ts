import BasePage from './BasePage';

export default class SettingsPage extends BasePage {
  public get modeWellnessBtn() { return this.getByTestId('settings-mode-wellness'); }
  public get modePerformanceBtn() { return this.getByTestId('settings-mode-performance'); }
  public get modeElderlyBtn() { return this.getByTestId('settings-mode-elderly'); }
  public get themeToggle() { return this.getByTestId('settings-theme-toggle'); }
  public get notificationsToggle() { return this.getByTestId('settings-notifications-toggle'); }
  public get deleteAccountBtn() { return this.getByTestId('settings-delete-account-btn'); }

  public async selectMode(mode: 'wellness' | 'performance' | 'elderly'): Promise<void> {
    await this.waitAndClick(`settings-mode-${mode}`);
  }
}
