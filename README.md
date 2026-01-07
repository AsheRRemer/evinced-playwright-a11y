# Evinced Playwright Accessibility Tests

This repository demonstrates static and continuous accessibility testing
using Playwright and the Evinced SDK.

## What This Covers
- Static accessibility analysis using `evAnalyze`
- Continuous accessibility monitoring using `evStart` / `evStop`
- Dynamic user flows on a real ecommerce site
- HTML report generation
- Comparison between static and dynamic issue discovery

## Key Finding
Static analysis on the homepage surfaced accessibility issues.
Running a continuous test across dynamic flows (homepage → catalog)
surfaced **additional accessibility issues**, proving that
dynamic interactions introduced new violations not present initially.

## Setup

```bash
npm install
npx playwright install

