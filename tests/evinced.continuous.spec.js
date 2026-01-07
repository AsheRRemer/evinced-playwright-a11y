import { test, expect } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { EvincedSDK } from '@evinced/js-playwright-sdk';

test('a11y-audits.com – catalog availability filter (continuous)', async ({ page }) => {
  const reportPath = './test-results/catalog-availability.html';

  // Ensure output directory exists
  mkdirSync(dirname(reportPath), { recursive: true });

  const evinced = new EvincedSDK(page);

  // 🔴 Start continuous monitoring
  await evinced.evStart({
    enableScreenshots: true,
  });

  // 1. Home page
  await page.goto('https://a11y-audits.com/');
  await page.waitForLoadState('networkidle');

  // 2. Before/after widget interaction (guarded)
  const cursor = page.locator('.before-after__cursor > svg > path:nth-child(2)');
  if (await cursor.isVisible()) {
    await cursor.click({ force: true });
  }

  // 3. Catalog navigation
  await page.getByRole('link', { name: 'Catalog' }).click();
  await page.waitForLoadState('networkidle');

  // 4. Apply "In stock only" filter (UI interaction)
  const inStockCheckbox = page.getByRole('checkbox', { name: 'In stock only' });
  if (await inStockCheckbox.isVisible()) {
    await inStockCheckbox.check();
  }

  // 5. Deterministic filtered page load
  await page.goto(
    'https://a11y-audits.com/collections/all?filter.v.availability=1'
  );
  await page.waitForLoadState('networkidle');

  // 🔴 Stop monitoring and collect issues
  const issues = await evinced.evStop();

  // Save HTML report
  await evinced.evSaveFile(issues, 'html', reportPath);

  console.log('Issues captured:', issues.length);
  expect(existsSync(reportPath)).toBeTruthy();
});
