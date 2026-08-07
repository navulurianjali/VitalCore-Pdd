import BasePage from './BasePage';

export default class PerformancePage extends BasePage {
  public get launchTimeLabel() { return this.getByTestId('perf-launch-time'); }
  public get fpsCounter() { return this.getByTestId('perf-fps-counter'); }
  public get memoryUsage() { return this.getByTestId('perf-memory-usage'); }

  public async measureAppLaunchTime(): Promise<number> {
    const start = Date.now();
    await this.isElementDisplayed('dash-calories-card');
    return Date.now() - start;
  }
}
