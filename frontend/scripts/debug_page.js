import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  const html = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log('ROOT HTML LENGTH:', html ? html.length : 'NULL');
  console.log('ROOT HTML PREVIEW:', html ? html.substring(0, 300) : 'EMPTY');

  await browser.close();
}

run().catch(console.error);
