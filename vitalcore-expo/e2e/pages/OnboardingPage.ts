import BasePage from './BasePage';

export default class OnboardingPage extends BasePage {
  public get fullNameInput() { return this.getByTestId('onboarding-fullname-input'); }
  public get ageInput() { return this.getByTestId('onboarding-age-input'); }
  public get genderMaleBtn() { return this.getByTestId('onboarding-gender-male'); }
  public get genderFemaleBtn() { return this.getByTestId('onboarding-gender-female'); }
  public get heightInput() { return this.getByTestId('onboarding-height-input'); }
  public get weightInput() { return this.getByTestId('onboarding-weight-input'); }
  public get nextBtn() { return this.getByTestId('onboarding-next-btn'); }
  public get backBtn() { return this.getByTestId('onboarding-back-btn'); }
  public get completeBtn() { return this.getByTestId('onboarding-complete-btn'); }

  public async fillStep1(fullName: string, age: string): Promise<void> {
    await this.waitAndSetValue('onboarding-fullname-input', fullName);
    await this.waitAndSetValue('onboarding-age-input', age);
    await this.waitAndClick('onboarding-gender-male');
    await this.waitAndClick('onboarding-next-btn');
  }

  public async fillStep2(height: string, weight: string): Promise<void> {
    await this.waitAndSetValue('onboarding-height-input', height);
    await this.waitAndSetValue('onboarding-weight-input', weight);
    await this.waitAndClick('onboarding-next-btn');
  }
}
