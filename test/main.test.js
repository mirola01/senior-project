
const { chromium } = require('playwright');
const { test, expect } = require('@jest/globals');

// Initialize browser and page variables
let browser;
let page;

beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage();
});

afterAll(async () => {
  await browser.close();
});

// Test cases

test('Check if Auth0 client is initialized', async () => {
  await page.goto('https://lineup-manager.netlify.app/');
  const isAuthenticated = await page.evaluate(() => window.isAuthenticated);
  expect(isAuthenticated).toBe(true);
});

test('Check if Add New Button exists', async () => {
  const addNewBtn = await page.$('#add-new-btn');
  expect(addNewBtn).not.toBeNull();
});