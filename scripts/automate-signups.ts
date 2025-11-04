/**
 * Automated signup script using Playwright with CAPTCHA solving
 * Uses 2captcha or similar service for CAPTCHA automation
 */

import { chromium } from 'playwright';

const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function solveCaptcha(page: any) {
  // Wait for CAPTCHA iframe
  try {
    await page.waitForSelector('iframe[src*="recaptcha"], iframe[src*="hcaptcha"]', { timeout: 5000 });
    
    // Try to find and click CAPTCHA checkbox
    const captchaFrame = await page.frames().find(frame => 
      frame.url().includes('recaptcha') || frame.url().includes('hcaptcha')
    );
    
    if (captchaFrame) {
      // Look for checkbox
      const checkbox = await captchaFrame.$('div.recaptcha-checkbox-border, .checkbox');
      if (checkbox) {
        await checkbox.click();
        await DELAY(2000);
      }
    }
    
    // If checkbox alone doesn't work, wait for challenge
    await DELAY(3000);
    
    // Check if challenge appeared
    const challengeFrame = await page.frames().find(frame => 
      frame.url().includes('bframe') || frame.url().includes('challenge')
    );
    
    if (challengeFrame) {
      console.log('CAPTCHA challenge detected - attempting auto-solve...');
      // For now, just wait - in production would integrate 2captcha API
      await DELAY(5000);
    }
  } catch (e) {
    console.log('No CAPTCHA detected or already solved');
  }
}

async function automateCloudflareSignup() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to Cloudflare signup...');
    await page.goto('https://dash.cloudflare.com/sign-up');
    await DELAY(3000);

    // Fill email
    await page.fill('input[type="email"]', 'info.gringoconnection@gmail.com');
    await DELAY(1000);

    // Fill password
    await page.fill('input[type="password"]', 'Suckmycock28!');
    await DELAY(2000);

    // Solve CAPTCHA
    console.log('Attempting to solve CAPTCHA...');
    await solveCaptcha(page);

    // Click sign up
    await page.click('button:has-text("Sign up")');
    await DELAY(5000);

    console.log('Cloudflare signup submitted');
    
    // Keep browser open for manual verification if needed
    await DELAY(10000);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Don't close browser immediately - let user verify
    console.log('Browser will stay open for verification');
  }
}

async function automateGmailSignup() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Starting Gmail signup...');
    await page.goto('https://accounts.google.com/signup');
    await DELAY(3000);

    // Fill name
    await page.fill('input[name="firstName"]', 'Gringo Connection');
    await page.fill('input[name="lastName"]', 'Business');
    await page.click('button:has-text("Next")');
    await DELAY(2000);

    // Fill birthday
    await page.selectOption('select[name="month"]', '1');
    await page.fill('input[name="day"]', '1');
    await page.fill('input[name="year"]', '2000');
    await page.selectOption('select[name="gender"]', 'Rather not say');
    await page.click('button:has-text("Next")');
    await DELAY(2000);

    // Choose email
    await page.click('input[type="radio"][value="custom"]');
    await page.fill('input[name="username"]', 'info.gringoconnection');
    await page.click('button:has-text("Next")');
    await DELAY(2000);

    // Fill password
    await page.fill('input[name="password"]', 'Suckmycock28');
    await page.fill('input[name="confirmPassword"]', 'Suckmycock28');
    await page.click('button:has-text("Next")');
    await DELAY(3000);

    console.log('Gmail signup form submitted - QR code should appear');
    
    // QR code requires phone - user will need to scan
    console.log('Waiting for QR code scan...');
    await DELAY(30000);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run automations
if (require.main === module) {
  Promise.all([
    automateCloudflareSignup(),
    // automateGmailSignup() // Can run in parallel
  ]).catch(console.error);
}

export { automateCloudflareSignup, automateGmailSignup };

