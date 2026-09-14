import puppeteer from 'puppeteer-core';
import path from 'path';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Scroll down smoothly through the whole page to trigger IntersectionObserver
  await page.evaluate(async () => {
    // Add reveal-active to all elements immediately so nothing is hidden
    document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('reveal-active'));

    const scrollHeight = document.body.scrollHeight;
    for (let y = 0; y < scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 50));
    }
    window.scrollTo(0, 0);
  });

  await new Promise(r => setTimeout(r, 1000));

  const artifactDir = '/Users/manishmanida/.gemini/antigravity-ide/brain/adfb9ad4-e5b5-49b9-87cb-1ccc84629a94';

  // 1. Hero
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_hero.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved screenshot_hero.png');

  // 2. Full Page
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_full_home.png'), fullPage: true });
  console.log('Saved screenshot_full_home.png');

  // 3. Organisations section
  const orgElem = await page.$('#organisations');
  if (orgElem) {
    await orgElem.screenshot({ path: path.join(artifactDir, 'screenshot_organisations.png') });
    console.log('Saved screenshot_organisations.png');
  }

  // 4. Gaps section
  const gapsElem = await page.$('#gaps');
  if (gapsElem) {
    await gapsElem.screenshot({ path: path.join(artifactDir, 'screenshot_gaps.png') });
    console.log('Saved screenshot_gaps.png');
  }

  // 5. Research page
  await page.goto('http://localhost:5173/research', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('reveal-active')));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_research.png'), fullPage: true });
  console.log('Saved screenshot_research.png');

  // 6. Patents page
  await page.goto('http://localhost:5173/patents', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('reveal-active')));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_patents.png'), fullPage: true });
  console.log('Saved screenshot_patents.png');

  // 7. Trends page
  await page.goto('http://localhost:5173/trends', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('reveal-active')));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_trends.png'), fullPage: true });
  console.log('Saved screenshot_trends.png');

  // 8. Chat page test
  await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.querySelectorAll('.reveal-init').forEach(el => el.classList.add('reveal-active')));
  await new Promise(r => setTimeout(r, 400));
  
  // Type a query into the chat input
  const inputSelector = 'input[placeholder*="Ask anything"]';
  await page.type(inputSelector, 'What patents exist for Lithium extraction in India?');
  await page.keyboard.press('Enter');
  
  // Wait for AI response to finish rendering
  await new Promise(r => setTimeout(r, 800));
  
  // Capture viewports
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_chat_interactive.png'), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved screenshot_chat_interactive.png');

  await browser.close();
  console.log('Done capturing screenshots!');
}

run().catch(console.error);
