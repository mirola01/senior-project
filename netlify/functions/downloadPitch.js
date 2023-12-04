const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async function(event) {
    let browser = null;

    try {
        // Launch the browser
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        // Open a new page
        let page = await browser.newPage();

        // Navigate to the specified URL
        await page.goto('https://lineup-manager.netlify.app/create');

        // Wait for the pitch element to load
        await page.waitForSelector('.pitch');

        // Take a screenshot of the pitch area
        const pitchElement = await page.$('.pitch');
        const screenshot = await pitchElement.screenshot({ encoding: 'base64' });

        return {
            statusCode: 200,
            body: screenshot,
            isBase64Encoded: true,
            headers: {
                'Content-Type': 'image/png',
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Screenshot failed' }),
        };
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
