import BasePage from './BasePage';

export default class CommunityPage extends BasePage {
  public get postInput() { return this.getByTestId('community-post-input'); }
  public get submitPostBtn() { return this.getByTestId('community-submit-post-btn'); }
  public get feedList() { return this.getByTestId('community-feed-list'); }
  public get likeBtn() { return this.getByTestId('community-like-btn'); }

  public async createPost(text: string): Promise<void> {
    await this.waitAndSetValue('community-post-input', text);
    await this.waitAndClick('community-submit-post-btn');
  }
}
