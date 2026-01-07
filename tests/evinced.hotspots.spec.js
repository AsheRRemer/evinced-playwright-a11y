import { test, expect } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { EvincedSDK } from '@evinced/js-playwright-sdk';

test('a11y-audits.com – hotspot + catalog flow (continuous)', async ({ page }) => {
  test.setTimeout(180000);

  const reportPath = './test-results/hotspot-catalog-continuous.html';
  mkdirSync(dirname(reportPath), { recursive: true });

  const evincedService = new EvincedSDK(page);

  // 1. Navigate FIRST (allow Shopify to hydrate)
  await page.goto('https://a11y-audits.com/', {
    waitUntil: 'domcontentloaded',
  });

  // Small settle for hydration
  await page.waitForTimeout(500);

  // 2. Start continuous analysis AFTER navigation
  await evincedService.evStart({
    enableScreenshots: true,
    includePassedValidations: true,
  });

await page.goto('https://a11y-audits.com/');
  await page.waitForLoadState('networkidle');

  // Allow baseline scan to complete
  await page.waitForTimeout(3000);

  // ---- Your hotspot interactions ----
  await page
    .locator('#block-template--14784757956711__hot-spots-1664424434f5b7d0e0-1')
    .getByRole('button', { name: 'Open' })
    .click();

  await page
    .locator('#block-template--14784757956711__hot-spots-1664424434f5b7d0e0-0')
    .getByRole('button', { name: 'Open' })
    .click();

  await page
    .locator('#block-template--14784757956711__hot-spots-1664424434f5b7d0e0-2')
    .getByRole('button', { name: 'Open' })
    .click();

  await page.waitForTimeout(1500);
  // ----------------------------------


  // 8. Stop analysis and collect report
  const report = await evincedService.evStop();

  // 9. Save report
  await evincedService.evSaveFile(report, 'html', reportPath);

  expect(existsSync(reportPath)).toBeTruthy();
});
