import BasePage from './BasePage';

export default class WaterTrackerPage extends BasePage {
  public get add250mlBtn() { return this.getByTestId('water-add-250ml-btn'); }
  public get add500mlBtn() { return this.getByTestId('water-add-500ml-btn'); }
  public get currentTotal() { return this.getByTestId('water-current-total'); }
  public get goalProgress() { return this.getByTestId('water-goal-progress'); }

  public async addWater(amount: 250 | 500): Promise<void> {
    const testId = amount === 250 ? 'water-add-250ml-btn' : 'water-add-500ml-btn';
    await this.waitAndClick(testId);
  }
}
