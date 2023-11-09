const { chromium } = require('playwright'); // Import playwright

describe('Login flow', () => {
  it('should redirect user to the Auth0 login page', async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://lineup-manager.netlify.app/');
    await page.click('text="Login"'); // Replace with your actual login element selector
    // Check if the user is redirected to the Auth0 login page
    expect(page.url()).toContain('auth0.com');
    // ... other assertions for successful login
    await browser.close();
  });

  // ... other tests
});
