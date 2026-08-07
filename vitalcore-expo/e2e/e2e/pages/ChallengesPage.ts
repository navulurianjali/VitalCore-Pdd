import BasePage from './BasePage';

export default class ChallengesPage extends BasePage {
  public get searchInput() { return this.getByTestId('challenges-search-input'); }
  public get categoryAll() { return this.getByTestId('challenges-cat-all'); }
  public get categoryFitness() { return this.getByTestId('challenges-cat-fitness'); }
  public get joinChallengeBtn() { return this.getByTestId('challenges-join-btn'); }
  public get leaveChallengeBtn() { return this.getByTestId('challenges-leave-btn'); }
  public get createCustomModalBtn() { return this.getByTestId('challenges-create-modal-btn'); }

  public async filterCategory(category: string): Promise<void> {
    const catTestId = `challenges-cat-${category.toLowerCase().replace(/\s+/g, '-')}`;
    await this.waitAndClick(catTestId);
  }
}
