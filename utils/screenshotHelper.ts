const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer');

export const getScreenshot = async (url: string) => {
    const browser = await chromium.puppeteer.launch({
        executablePath: await chromium.executablePath,
        headless: true,
      });
    const page = await browser.newPage();
    await page.goto(
        `${ url }`,
        {
            waitUntil: 'networkidle0',
        }
    );
    await page.waitForTimeout(1000); // wait for the page to load
    const imageBuffer = await page.screenshot({
        type: 'jpeg',
        quality: 100,
        captureBeyondViewport: true
    });
    return imageBuffer;
}