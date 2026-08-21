import 'dotenv/config';

export const seleniumConfig = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',
  windowWidth: parseInt(process.env.WINDOW_WIDTH || '1440', 10),
  windowHeight: parseInt(process.env.WINDOW_HEIGHT || '900', 10),
  implicitWait: parseInt(process.env.IMPLICIT_WAIT || '8000', 10),
  pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10),
  reportsDir: process.env.REPORTS_DIR || './Test Results',
  simulate: process.env.SIMULATE === 'true',
};

export const testCredentials = {
  email: process.env.TEST_EMAIL || 'testuser@vitalcore.app',
  password: process.env.TEST_PASSWORD || 'TestPass@123',
};

// Application routes
export const routes = {
  landing: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  aiCoach: '/ai-coach',
  calorieTracker: '/calorie-tracker',
  challenges: '/challenges',
  community: '/community',
  fitness: '/fitness',
  sleep: '/sleep',
  history: '/history',
  profile: '/profile',
  settings: '/settings',
  about: '/about',
  contact: '/contact',
  features: '/features',
  futureLab: '/future-lab',
  privacy: '/privacy',
  terms: '/terms',
  admin: '/admin',
};
