import BasePage from './BasePage';

export default class AICoachPage extends BasePage {
  public get chatInput() { return this.getByTestId('aicoach-chat-input'); }
  public get sendBtn() { return this.getByTestId('aicoach-send-btn'); }
  public get chatMessagesList() { return this.getByTestId('aicoach-messages-list'); }
  public get typingIndicator() { return this.getByTestId('aicoach-typing-indicator'); }

  public async sendMessage(prompt: string): Promise<void> {
    await this.waitAndSetValue('aicoach-chat-input', prompt);
    await this.waitAndClick('aicoach-send-btn');
  }
}
