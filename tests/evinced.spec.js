import { test, expect } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { EvincedSDK } from "@evinced/js-playwright-sdk";

test("Single test run using evAnalyze (screenshots + HTML report)", async ({ page }) => {
  const evReport = "./test-results/evAnalyze.html";

  mkdirSync(dirname(evReport), { recursive: true });

  const evincedService = new EvincedSDK(page);

  await page.goto("https://a11y-audits.com/collections/all");
  await page.waitForLoadState("networkidle");

  const issues = await evincedService.evAnalyze({
    enableScreenshots: true,
  });

  await evincedService.evSaveFile(issues, "html", evReport);

  expect(Array.isArray(issues)).toBe(true);
  expect(existsSync(evReport)).toBeTruthy();
});
