import { BasePage } from './BasePage';

export class SleepPage extends BasePage {
  constructor() { super('SleepScreen'); }
  readonly logSleepBtn = 'text=Log Sleep';
}

export class FitnessPage extends BasePage {
  constructor() { super('FitnessScreen'); }
  readonly startWorkoutBtn = 'text=Start Workout';
}

export class CalorieTrackerPage extends BasePage {
  constructor() { super('CalorieTrackerScreen'); }
  readonly addMealBtn = 'text=Add Meal';
}

export class FutureLabPage extends BasePage {
  constructor() { super('FutureLabScreen'); }
  readonly runSimulationBtn = 'text=Run Twin Simulation';
}

export class CommunityPage extends BasePage {
  constructor() { super('CommunityScreen'); }
  readonly postUpdateBtn = 'text=Share Progress';
}

export class ChallengesPage extends BasePage {
  constructor() { super('ChallengesScreen'); }
  readonly joinChallengeBtn = 'text=Join Challenge';
}

export class SettingsPage extends BasePage {
  constructor() { super('SettingsScreen'); }
  readonly toggleThemeBtn = 'accessibilityLabel=theme_toggle';
}

export class CameraPage extends BasePage {
  constructor() { super('CameraScreen'); }
  readonly captureBtn = 'text=Capture Food';
}
