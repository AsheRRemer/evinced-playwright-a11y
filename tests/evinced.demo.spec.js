// tests/evinced.demo.continuous.spec.js
const { test, expect } = require('@playwright/test');
const { mkdirSync, existsSync } = require('node:fs');
const { dirname } = require('node:path');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');

test.setTimeout(120000);

test('demo.evinced.com – continuous dropdown flow (HTML + screenshots)', async ({ page }) => {
  const reportPath = './test-results/demo-continuous.html';

  // Ensure output directory exists
  mkdirSync(dirname(reportPath), { recursive: true });

  const evinced = new EvincedSDK(page);

  // 🔴 Start continuous monitoring BEFORE navigation
  await evinced.evStart({
    enableScreenshots: true,
  });

  // Navigate
  await page.goto('https://demo.evinced.com/');
  await page.waitForLoadState('networkidle');

  // ---- CODEGEN STEPS (verbatim, cleaned) ----

  await page
    .locator('div')
    .filter({ hasText: 'TypeSelectCaravanTiny' })
    .nth(4)
    .click();

  await page.getByText('Select').first().click();
  await page.getByText('Select').nth(1).click();

  // Allow DOM to fully settle after re-renders
  await page.waitForTimeout(2000);

  // 🔴 Stop monitoring and collect issues
  const result = await evinced.evStop();

  // Normalize result shape
  const issues = Array.isArray(result)
    ? result
    : result.failedValidations || [];

  console.log('Issues captured:', issues.length);

  // Save HTML report
  await evinced.evSaveFile(issues, 'html', reportPath);

  expect(existsSync(reportPath)).toBeTruthy();
});
