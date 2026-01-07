import { test, expect } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { EvincedSDK } from '@evinced/js-playwright-sdk';

test('a11y-audits.com – catalog filtering flow (continuous)', async ({ page }) => {
  const reportPath = './test-results/catalog-filtering.html';
  mkdirSync(dirname(reportPath), { recursive: true });

  const evinced = new EvincedSDK(page);

  // 🔴 Start continuous tracking
  await evinced.evStart({
    enableScreenshots: true,
  });

  // 1. Open catalog
  await page.goto('https://a11y-audits.com/collections/all');
  await page.waitForLoadState('networkidle');

  // 2. Apply "In stock only" via URL (deterministic)
  await page.goto(
    'https://a11y-audits.com/collections/all?filter.v.availability=1'
  );
  await page.waitForLoadState('networkidle');

  // 3. Adjust price range (if slider exists)
  const fromPrice = page.getByRole('slider', { name: /from price/i });
  if (await fromPrice.isVisible()) {
    await fromPrice.fill('204');
  }

  // 4. Navigate with price filter applied
  await page.goto(
    'https://a11y-audits.com/collections/all?filter.v.availability=1&filter.v.price.gte=204'
  );
  await page.waitForLoadState('networkidle');

  // 🔴 Stop tracking
  const issues = await evinced.evStop();

  // Save report
  await evinced.evSaveFile(issues, 'html', reportPath);

  console.log('Issues captured:', issues.length);
  expect(existsSync(reportPath)).toBeTruthy();
});
