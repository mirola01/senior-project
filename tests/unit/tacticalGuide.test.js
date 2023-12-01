const { chromium } = require('playwright');

describe('Tactical Guide Tab Functionality', () => {
  let browser;
  let page;
  const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFwdDJJZlM5SllPZ1pvdVRHOUdRTCJ9...'; // truncated for brevity

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('https://lineup-manager.netlify.app/tactical-guide.html'); // Replace with the correct path
  });

  afterEach(async () => {
    await page.close();
  });

  test('Presence of accessToken displays the guide content', async () => {
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, accessToken);

    await page.reload();

    // Assertions for guide content visibility
    const guideContent = await page.$('.tab-content'); // Assuming the guide content is within a div with class 'tab-content'
    expect(guideContent).toBeTruthy();
    await expect(guideContent).toBeVisible();
  });

  test('Absence of accessToken redirects to login', async () => {
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
    });

    await page.reload();

    // Assertions for redirection to login page
    const loginPageURL = 'https://lineup-manager.netlify.app/'; // Replace with your actual login page URL
    await page.waitForNavigation();
    expect(page.url()).toBe(loginPageURL);
  });

  // Additional test cases...
});
