import { test, expect } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { EvincedSDK } from '@evinced/js-playwright-sdk';

test(
  'a11y-audits.com – hotspot + catalog flow (continuous)',
  async ({ page }) => {
    test.setTimeout(60000);

    const reportPath = './test-results/hotspot-catalog-continuous.html';
    mkdirSync(dirname(reportPath), { recursive: true });

    const evinced = new EvincedSDK(page);

    // 🔴 Start continuous monitoring
    await evinced.evStart({
      enableScreenshots: true,
    });

    // 1. Home
    await page.goto('https://a11y-audits.com/', {
      waitUntil: 'domcontentloaded',
    });

    // 2. Before / After widget (guarded click)
    const cursor = page.locator('.before-after__cursor > svg > path').first();
    if (await cursor.isVisible()) {
      await cursor.click({ force: true });
    }

    // 3. Hotspots (open / close)
    const hotspotIds = [
      '1',
      '0',
      '2',
    ];

    for (const id of hotspotIds) {
      const hotspot = page
        .locator(
          `#block-template--14784757956711__hot-spots-1664424434f5b7d0e0-${id}`
        )
        .getByRole('button', { name: 'Open' });

      if (await hotspot.isVisible()) {
        await hotspot.click();
        await hotspot.click(); // close again
      }
    }

    // 4. FAQ accordions
    const faqQuestions = [
      'Do you ship overseas?',
      'How long will it take to get',
    ];

    for (const question of faqQuestions) {
      const toggle = page
        .locator('summary')
        .filter({ hasText: question })
        .getByRole('button');

      if (await toggle.isVisible()) {
        await toggle.click();
        await toggle.click();
      }
    }

    // 5. Additional accordion
    const extraAccordion = page
      .locator('div:nth-child(3) > summary > .accordion__toggle > .circle-chevron')
      .first();

    if (await extraAccordion.isVisible()) {
      await extraAccordion.click();
      await extraAccordion.click();
    }

    // 6. Catalog navigation

    // Wait for catalog grid (deterministic)
    await page.getByRole('link', { name: 'Catalog' }).click();
  await page.waitForLoadState('networkidle');


    // 7. Apply "In stock only" filter (UI interaction)
  const inStockCheckbox = page.getByRole('checkbox', { name: 'In stock only' });
  if (await inStockCheckbox.isVisible()) {
    await inStockCheckbox.check();
  }

    // 8. Remove filter
    await page.getByRole('checkbox', { name: 'In stock only' }).uncheck();
    await page.waitForURL('**/collections/all', { timeout: 15000 });

    // 9. Footer / CTA interaction
    const footerButton = page
      .locator('#shopify-section-template--14784758382695__main')
      .getByRole('button');

    if (await footerButton.isVisible()) {
      await footerButton.click();
    }

    // 🔴 Stop monitoring
    const issues = await evinced.evStop();

    await evinced.evSaveFile(issues, 'html', reportPath);

    console.log(`Issues captured: ${issues.length}`);
    expect(existsSync(reportPath)).toBeTruthy();
  }
);
