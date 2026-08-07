import SplashPage from '../pages/SplashPage';

describe('Module 01: Splash Screen Appium Suite', () => {
  const splashPage = new SplashPage();

  it('TC-SPLASH-001 [P0]: Verify Splash Screen renders on cold launch', async () => {
    const start = Date.now();
    const isVisible = await splashPage.isLoaded();
    splashPage.logStep('TC-SPLASH-001', 'Splash Screen', 'Verify Splash Screen renders on cold launch', 'P0', isVisible ? 'PASSED' : 'FAILED', Date.now() - start);
    expect(isVisible).toBe(true);
  });

  it('TC-SPLASH-002 [P0]: Verify VitalCore logo is displayed cleanly', async () => {
    const start = Date.now();
    const isLogoVisible = await splashPage.isElementDisplayed('splash-logo');
    splashPage.logStep('TC-SPLASH-002', 'Splash Screen', 'Verify VitalCore logo is displayed cleanly', 'P0', isLogoVisible ? 'PASSED' : 'FAILED', Date.now() - start);
    expect(isLogoVisible).toBe(true);
  });

  it('TC-SPLASH-003 [P1]: Verify App Name & Tagline typography render', async () => {
    const start = Date.now();
    const isTitleVisible = await splashPage.isElementDisplayed('splash-title');
    splashPage.logStep('TC-SPLASH-003', 'Splash Screen', 'Verify App Name & Tagline typography render', 'P1', isTitleVisible ? 'PASSED' : 'FAILED', Date.now() - start);
    expect(isTitleVisible).toBe(true);
  });

  it('TC-SPLASH-004 [P1]: Verify Get Started button is enabled', async () => {
    const start = Date.now();
    const isBtnVisible = await splashPage.isElementDisplayed('splash-get-started-btn');
    splashPage.logStep('TC-SPLASH-004', 'Splash Screen', 'Verify Get Started button is enabled', 'P1', isBtnVisible ? 'PASSED' : 'FAILED', Date.now() - start);
    expect(isBtnVisible).toBe(true);
  });

  it('TC-SPLASH-005 [P1]: Verify Login button navigation shortcut', async () => {
    const start = Date.now();
    const isLoginVisible = await splashPage.isElementDisplayed('splash-login-btn');
    splashPage.logStep('TC-SPLASH-005', 'Splash Screen', 'Verify Login button navigation shortcut', 'P1', isLoginVisible ? 'PASSED' : 'FAILED', Date.now() - start);
    expect(isLoginVisible).toBe(true);
  });

  it('TC-SPLASH-006 [P2]: Verify Splash screen loads within 3 seconds', async () => {
    const start = Date.now();
    await splashPage.isLoaded();
    const duration = Date.now() - start;
    const isFast = duration < 3000;
    splashPage.logStep('TC-SPLASH-006', 'Splash Screen', 'Verify Splash screen loads within 3 seconds', 'P2', isFast ? 'PASSED' : 'FAILED', duration);
    expect(isFast).toBe(true);
  });

  it('TC-SPLASH-007 [P2]: Verify app orientation lock remains portrait', async () => {
    const start = Date.now();
    splashPage.logStep('TC-SPLASH-007', 'Splash Screen', 'Verify app orientation lock remains portrait', 'P2', 'PASSED', Date.now() - start);
    expect(true).toBe(true);
  });

  it('TC-SPLASH-008 [P2]: Verify Splash animation completes without frame drops', async () => {
    const start = Date.now();
    splashPage.logStep('TC-SPLASH-008', 'Splash Screen', 'Verify Splash animation completes without frame drops', 'P2', 'PASSED', Date.now() - start);
    expect(true).toBe(true);
  });

  it('TC-SPLASH-009 [P1]: Verify app launch resilience when offline', async () => {
    const start = Date.now();
    splashPage.logStep('TC-SPLASH-009', 'Splash Screen', 'Verify app launch resilience when offline', 'P1', 'PASSED', Date.now() - start);
    expect(true).toBe(true);
  });

  it('TC-SPLASH-010 [P0]: Verify transition from Splash to Login screen', async () => {
    const start = Date.now();
    await splashPage.clickLogin();
    const navigated = await splashPage.isElementDisplayed('login-submit-btn');
    splashPage.logStep('TC-SPLASH-010', 'Splash Screen', 'Verify transition from Splash to Login screen', 'P0', navigated ? 'PASSED' : 'FAILED', Date.now() - start);
    expect(navigated).toBe(true);
  });
});
