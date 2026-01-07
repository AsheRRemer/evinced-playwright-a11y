const { test, expect } = require('@playwright/test');
const { mkdirSync, existsSync } = require('node:fs');
const { dirname } = require('node:path');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

test.setTimeout(120000);

test('a11y-audits.com – hotspot workflow (continuous, failed issues only)', async ({ page }) => {
  const reportPath = './test-results/hotspots.html';

  // Ensure output directory exists
  mkdirSync(dirname(reportPath), { recursive: true });

  const evinced = new EvincedSDK(page);

  // 🔴 Start continuous monitoring (NO passed validations)
  await evinced.evStart({
    enableScreenshots: true,
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

  // 🔴 Stop tracking
  const report = await evinced.evStop();

  // Normalize to FAILED issues only
  const issues = Array.isArray(report)
    ? report
    : report?.failedValidations ?? [];

  console.log('Failed accessibility issues:', issues.length);

  // Save FAILED issues report only
  await evinced.evSaveFile(issues, 'html', reportPath);

  expect(existsSync(reportPath)).toBeTruthy();
  expect(issues.length).toBeGreaterThan(0);
});
