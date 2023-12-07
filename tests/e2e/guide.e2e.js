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
  
    test('Initial tab state', async () => {
        const firstTabContent = await page.$('.tab-content > div:first-child');
        expect(firstTabContent).toBeTruthy();
        
        // Using Playwright's isVisible method for visibility check
        const isVisible = await firstTabContent.isVisible();
        expect(isVisible).toBeTruthy();
      }, 30000); // Optional increased timeout
    
      test('Tab interaction and content visibility', async () => {
        const tabIds = ['4-4-2', '4-3-3', '3-5-2'];
        for (const tabId of tabIds) {
          await page.click(`#f-${tabId}`);
          await page.waitForTimeout(500);
          const isTabVisible = await page.evaluate((id) => {
            const tabContent = document.querySelector(`#f-${id}`);
            return tabContent && getComputedStyle(tabContent).display !== 'none';
          }, tabId);
          expect(isTabVisible).toBeTruthy();
        }
      }, 30000);
    });

  