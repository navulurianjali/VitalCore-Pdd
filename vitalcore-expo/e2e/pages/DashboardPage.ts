import BasePage from './BasePage';

export default class DashboardPage extends BasePage {
  public get welcomeBanner() { return this.getByTestId('dash-welcome-banner'); }
  public get caloriesCard() { return this.getByTestId('dash-calories-card'); }
  public get waterCard() { return this.getByTestId('dash-water-card'); }
  public get sleepCard() { return this.getByTestId('dash-sleep-card'); }
  public get stepsCard() { return this.getByTestId('dash-steps-card'); }
  public get quickLogWaterBtn() { return this.getByTestId('dash-quicklog-water-btn'); }
  public get quickLogStepsBtn() { return this.getByTestId('dash-quicklog-steps-btn'); }

  public async isDashboardLoaded(): Promise<boolean> {
    return this.isElementDisplayed('dash-calories-card');
  }

  public async quickLogWater(): Promise<void> {
    await this.waitAndClick('dash-quicklog-water-btn');
  }
}
