import BasePage from './BasePage';

export default class FutureLabPage extends BasePage {
  public get overallScore() { return this.getByTestId('futurelab-overall-score'); }
  public get bioAgeDisplay() { return this.getByTestId('futurelab-bio-age'); }
  public get earlyWarningsList() { return this.getByTestId('futurelab-early-warnings'); }
  public get detailedInsightsBtn() { return this.getByTestId('futurelab-details-btn'); }
}
