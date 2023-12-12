  const { chromium } = require('playwright');

  describe('Tactical Guide Tab Functionality', () => {
    let browser;
    let page;
    let context;
    const accessToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFwdDJJZlM5SllPZ1pvdVRHOUdRTCJ9'; 
  
    beforeAll(async () => {
        browser = await chromium.launch();
    });
  
    afterAll(async () => {
      await browser.close();
    });
  
    beforeEach(async () => {
        // Create a new browser context
        context = await browser.newContext();
      
        // Set localStorage in the context
        await context.addInitScript((token) => {
          localStorage.setItem('accessToken', token);
        }, accessToken);
      
        // Launch a new page within the context
        page = await context.newPage();
        await page.goto('https://lineup-manager.netlify.app/tactical-guide.html', { waitUntil: 'networkidle' });
    });
  
    afterEach(async () => {
      await page.close();
      await context.close();
    });
  
    test("Initial Tab State - First Tab Active and Visible", async () => {
      const firstTabContent = await page.isVisible('#f-4-4-2');
      expect(firstTabContent).toBeTruthy();
    });

    test("Tab Click Functionality Test", async () => {
      await page.click('#f1');
      const isVisible = await page.isVisible('#f-4-3-3');
      expect(isVisible).toBeTruthy();
      const isNotVisible = await page.isVisible('#f-4-4-2');
      expect(isNotVisible).toBeFalsy();

      const isActive = await page.$eval('#f1', el => el.classList.contains('active-tac'));
      expect(isActive).toBeTruthy();
    });

    test("Access Token Verification - Redirects if No Token", async () => {
      await context.clearCookies();
      await context.clearLocalStorage();

      await page.reload();
      
      const isRedirected = page.url().includes('https://lineup-manager.netlify.app/');
      expect(isRedirected).toBeTruthy();
    });
      
    });
  