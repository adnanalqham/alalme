import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BRAVE_PATH = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';

async function runTest(testName, executablePath, extraArgs = []) {
  console.log(`\n==================================================`);
  console.log(`RUNNING TEST: ${testName}`);
  console.log(`Executable: ${executablePath}`);
  console.log(`Args: ${JSON.stringify(extraArgs)}`);
  console.log(`==================================================\n`);

  const results = {
    testName,
    browserExecutable: executablePath,
    consoleMessages: [],
    clerkDiagnostics: [],
    networkRequests: [],
    uiState: null,
    error: null,
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        ...extraArgs,
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Console listener
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      const entry = { type, text, time: new Date().toISOString() };
      results.consoleMessages.push(entry);
      if (text.includes('Clerk') || text.includes('clerk') || text.includes('Diagnostics') || text.includes('auth')) {
        results.clerkDiagnostics.push(entry);
      }
      console.log(`[${testName} Console][${type}] ${text}`);
    });

    page.on('pageerror', err => {
      const entry = { type: 'pageerror', text: err.toString(), time: new Date().toISOString() };
      results.consoleMessages.push(entry);
      results.clerkDiagnostics.push(entry);
      console.log(`[${testName} PageError] ${err.toString()}`);
    });

    // 2. Network listeners
    page.on('requestfailed', req => {
      const url = req.url();
      const failure = req.failure();
      const entry = {
        url,
        method: req.method(),
        status: 'FAILED / BLOCKED',
        errorText: failure ? failure.errorText : 'Unknown failure',
        time: new Date().toISOString(),
      };
      results.networkRequests.push(entry);
      console.log(`[${testName} Network FAILED] ${req.method()} ${url} -> ${entry.errorText}`);
    });

    page.on('response', async res => {
      const url = res.url();
      if (
        url.includes('clerk') ||
        url.includes('accounts.dev') ||
        url.includes('session') ||
        url.includes('auth/me') ||
        url.includes('8000') ||
        url.includes('localhost:3000/api')
      ) {
        let snippet = '';
        try {
          const body = await res.text();
          snippet = body.slice(0, 300);
        } catch (e) {
          snippet = '[unreadable body]';
        }
        const entry = {
          url,
          status: res.status(),
          statusText: res.statusText(),
          responseSnippet: snippet,
          time: new Date().toISOString(),
        };
        results.networkRequests.push(entry);
        console.log(`[${testName} Network Response] ${res.status()} ${url}`);
      }
    });

    console.log(`Loading http://localhost:3000/ ...`);
    const startTime = Date.now();
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Wait 7.5 seconds so both 6s timers (SafeClerkProvider timeout & AuthContext timeout) have resolved
    await new Promise(r => setTimeout(r, 7500));
    const duration = Date.now() - startTime;

    // Evaluate UI and Window State
    results.uiState = await page.evaluate(() => {
      const heading = document.querySelector('h1, h2')?.innerText || '';
      const text = document.body.innerText || '';
      const isErrorScreen = text.includes('تعذر تحميل التطبيق');
      const isSplashScreen = text.includes('العالمي') && text.includes('المنصة الشاملة');
      const isHomePage = text.includes('تسجيل الدخول') || text.includes('قطع الغيار') || text.includes('بحث') || text.includes('العالمي لقطع غيار');
      
      const clerkObj = (window).Clerk;
      return {
        heading,
        isErrorScreen,
        isSplashScreen,
        isHomePage,
        bodySnippet: text.slice(0, 200).replace(/\s+/g, ' '),
        windowClerk: clerkObj ? {
          isLoaded: !!clerkObj.loaded,
          version: clerkObj.version || null,
          hasUser: !!clerkObj.user,
          hasSession: !!clerkObj.session,
        } : null,
      };
    });

    results.durationMs = duration;
    console.log(`[${testName} Final UI State]`, results.uiState);

  } catch (e) {
    console.error(`[${testName} Exception]`, e);
    results.error = e.toString();
  } finally {
    if (browser) await browser.close();
  }

  return results;
}

async function main() {
  const allResults = {};

  // Test A: Brave with Shields ON (default profile in new tmp dir)
  const braveTmp1 = path.resolve('brave_test_shields_on');
  allResults.testA_Brave_Shields_ON = await runTest(
    'A) Brave + Shields ON (Default)',
    BRAVE_PATH,
    [`--user-data-dir=${braveTmp1}`]
  );

  // Test B: Brave with Shields OFF (--disable-brave-shields or flags)
  const braveTmp2 = path.resolve('brave_test_shields_off');
  allResults.testB_Brave_Shields_OFF = await runTest(
    'B) Brave + Shields OFF',
    BRAVE_PATH,
    [
      `--user-data-dir=${braveTmp2}`,
      '--disable-brave-extension',
      '--disable-brave-shields',
      '--brave-adblock-block-ads=false',
      '--brave-adblock-block-trackers=false',
    ]
  );

  // Test C: Chrome (Pure Chromium without Brave Shields)
  const chromeTmp = path.resolve('chrome_test_profile');
  allResults.testC_Chrome = await runTest(
    'C) Google Chrome',
    CHROME_PATH,
    [`--user-data-dir=${chromeTmp}`]
  );

  // Write full results to JSON
  fs.writeFileSync(
    path.resolve('auth_diagnostic_report.json'),
    JSON.stringify(allResults, null, 2),
    'utf-8'
  );

  console.log(`\n==================================================`);
  console.log(`DIAGNOSTIC TESTING COMPLETE. Written to auth_diagnostic_report.json`);
  console.log(`==================================================\n`);
}

main().catch(console.error);
