import BasePage from './BasePage';

export default class ProfilePage extends BasePage {
  public get editProfileBtn() { return this.getByTestId('profile-edit-btn'); }
  public get fullNameText() { return this.getByTestId('profile-fullname-text'); }
  public get emailText() { return this.getByTestId('profile-email-text'); }
  public get dobText() { return this.getByTestId('profile-dob-text'); }
  public get bloodGroupText() { return this.getByTestId('profile-bloodgroup-text'); }
  public get logoutBtn() { return this.getByTestId('profile-logout-btn'); }

  public async logout(): Promise<void> {
    await this.waitAndClick('profile-logout-btn');
  }
}
