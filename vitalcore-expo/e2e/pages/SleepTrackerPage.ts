import BasePage from './BasePage';

export default class SleepTrackerPage extends BasePage {
  public get sleepHoursInput() { return this.getByTestId('sleep-hours-input'); }
  public get sleepQualitySlider() { return this.getByTestId('sleep-quality-slider'); }
  public get logSleepBtn() { return this.getByTestId('sleep-log-btn'); }
  public get sleepHistoryList() { return this.getByTestId('sleep-history-list'); }

  public async logSleep(hours: string): Promise<void> {
    await this.waitAndSetValue('sleep-hours-input', hours);
    await this.waitAndClick('sleep-log-btn');
  }
}
