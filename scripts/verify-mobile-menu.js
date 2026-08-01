const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testMobileMenu() {
  console.log('📱 Testing Mobile Header & Hamburger Menu Button...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  const innerWidth = await page.evaluate(() => window.innerWidth);
  console.log(`Measured window.innerWidth = ${innerWidth}px`);

  const btnDetails = await page.evaluate(() => {
    const btn = document.querySelector('.mobile-menu-btn');
    if (!btn) return null;
    const style = window.getComputedStyle(btn);
    const rect = btn.getBoundingClientRect();
    return {
      display: style.display,
      visibility: style.visibility,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left
    };
  });

  console.log('Mobile menu button computed details:', btnDetails);

  const screenshotsDir = path.join(process.cwd(), 'verification-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const closedPath = path.join(screenshotsDir, 'mobile-menu-closed.png');
  await page.screenshot({ path: closedPath });
  console.log(`📸 Saved screenshot: ${closedPath}`);

  if (btnDetails && btnDetails.display !== 'none' && btnDetails.width > 0) {
    console.log('✅ Mobile hamburger menu button is VISIBLE!');
    await page.evaluate(() => {
      document.querySelector('.mobile-menu-btn').click();
    });
    await page.waitForTimeout(500);
    const openPath = path.join(screenshotsDir, 'mobile-menu-opened.png');
    await page.screenshot({ path: openPath });
    console.log(`📸 Saved opened drawer screenshot: ${openPath}`);
  } else {
    console.error('❌ Button is not visible!');
    process.exit(1);
  }

  await browser.close();
}

testMobileMenu().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
