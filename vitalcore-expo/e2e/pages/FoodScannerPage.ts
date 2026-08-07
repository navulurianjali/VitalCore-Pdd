import BasePage from './BasePage';

export default class FoodScannerPage extends BasePage {
  public get searchInput() { return this.getByTestId('food-search-input'); }
  public get foodList() { return this.getByTestId('food-items-list'); }
  public get addCustomFoodBtn() { return this.getByTestId('food-add-custom-btn'); }
  public get cameraScanBtn() { return this.getByTestId('food-camera-scan-btn'); }

  public async searchFood(query: string): Promise<void> {
    await this.waitAndSetValue('food-search-input', query);
  }
}
