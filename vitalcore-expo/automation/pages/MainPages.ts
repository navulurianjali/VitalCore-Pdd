import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor() {
    super('DashboardScreen');
  }
  readonly homeTab = 'text=Home';
  readonly aiCoachTab = 'text=AI Coach';
  readonly profileTab = 'text=Profile';
  readonly healthScoreCard = 'text=Vital Score';
  readonly sleepTile = 'text=Sleep Analysis';
  readonly fitnessTile = 'text=Fitness Tracker';
}

export class AICoachPage extends BasePage {
  constructor() {
    super('AICoachScreen');
  }
  readonly chatInput = 'placeholder=Ask your AI health twin...';
  readonly sendBtn = 'text=Send';
  readonly chatHistory = 'accessibilityLabel=chat_history';
}

export class ProfilePage extends BasePage {
  constructor() {
    super('ProfileScreen');
  }
  readonly editProfileBtn = 'text=Edit Profile';
  readonly settingsBtn = 'text=Settings';
  readonly logoutBtn = 'text=Sign Out';
}
