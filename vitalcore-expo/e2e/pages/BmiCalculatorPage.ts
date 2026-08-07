import BasePage from './BasePage';

export default class BmiCalculatorPage extends BasePage {
  public get heightInput() { return this.getByTestId('bmi-height-input'); }
  public get weightInput() { return this.getByTestId('bmi-weight-input'); }
  public get calculateBtn() { return this.getByTestId('bmi-calculate-btn'); }
  public get resultValue() { return this.getByTestId('bmi-result-value'); }
  public get resultCategory() { return this.getByTestId('bmi-result-category'); }

  public async calculate(heightCm: string, weightKg: string): Promise<void> {
    await this.waitAndSetValue('bmi-height-input', heightCm);
    await this.waitAndSetValue('bmi-weight-input', weightKg);
    await this.waitAndClick('bmi-calculate-btn');
  }
}
