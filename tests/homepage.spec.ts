import { test, expect } from '@playwright/test';

test.describe('HTTP Status Rabbits homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title and meta description', async ({ page }) => {
    await expect(page).toHaveTitle('HTTP Status Rabbits');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('HTTP status codes');
    expect(description?.toLowerCase()).toContain('rabbit');
  });

  test('renders header with title and tagline', async ({ page }) => {
    await expect(page.locator('header.header h1')).toHaveText('HTTP Status Rabbits');
    await expect(page.locator('header.header p')).toContainText('adorable rabbits');
  });

  test('renders all five category sections with proper titles', async ({ page }) => {
    const sections = page.locator('section.category-section');
    await expect(sections).toHaveCount(5);

    const expected = [
      '1xx Informational',
      '2xx Success',
      '3xx Redirection',
      '4xx Client Error',
      '5xx Server Error',
    ];
    for (const label of expected) {
      await expect(page.locator('.category-title', { hasText: label })).toBeVisible();
    }
  });

  test('renders many status code cards', async ({ page }) => {
    const cards = page.locator('article.status-card');
    // README mentions 100+ codes; assert at least 90 (raw count is 91).
    expect(await cards.count()).toBeGreaterThanOrEqual(90);
  });

  test('every status card has a code, message, description, and image', async ({ page }) => {
    const cards = page.locator('article.status-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      await expect(card.locator('.status-code')).toBeVisible();
      await expect(card.locator('.status-message')).not.toBeEmpty();
      await expect(card.locator('.status-description')).not.toBeEmpty();

      const img = card.locator('img.status-image');
      const src = await img.getAttribute('src');
      expect(src, `card ${i} image src`).toBeTruthy();
      const alt = await img.getAttribute('alt');
      expect(alt).toMatch(/^HTTP \d+ - /);
    }
  });

  test('renders key well-known status codes', async ({ page }) => {
    for (const code of ['200', '301', '404', '418', '500']) {
      await expect(
        page.locator('article.status-card', { has: page.locator('.status-code', { hasText: new RegExp(`\\b${code}\\b`) }) })
      ).toHaveCount(1);
    }
  });

  test('418 card is present and labelled "I\'m a teapot"', async ({ page }) => {
    const teapot = page.locator('article.status-card', {
      has: page.locator('.status-code', { hasText: /\b418\b/ }),
    });
    await expect(teapot).toBeVisible();
    await expect(teapot.locator('.status-message')).toContainText(/teapot/i);
  });

  test('unofficial codes get the Unofficial badge', async ({ page }) => {
    const badges = page.locator('.unofficial-badge');
    expect(await badges.count()).toBeGreaterThan(0);
    // Every badge should live inside a status-card
    const first = badges.first();
    await expect(first).toHaveText(/unofficial/i);
  });

  test('local rabbit images use /rabbits/<code>.jpg convention', async ({ page }) => {
    const src200 = await page
      .locator('article.status-card', { has: page.locator('.status-code', { hasText: /\b200\b/ }) })
      .locator('img.status-image')
      .getAttribute('src');
    expect(src200).toBe('/rabbits/200.jpg');
  });

  test('images have lazy loading enabled', async ({ page }) => {
    const imgs = page.locator('img.status-image');
    const loading = await imgs.first().getAttribute('loading');
    expect(loading).toBe('lazy');
  });

  test('footer contains credits and external links', async ({ page }) => {
    const footer = page.locator('footer.footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByRole('link', { name: /HTTP Cats/i })).toHaveAttribute('href', 'https://http.cat');
    await expect(footer.getByRole('link', { name: /HTTP Status Dogs/i })).toHaveAttribute(
      'href',
      'https://httpstatusdogs.com',
    );
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('header.header h1')).toBeVisible();
    await expect(page.locator('article.status-card').first()).toBeVisible();
  });
});

test.describe('Assets', () => {
  test('favicon is served', async ({ request }) => {
    const res = await request.get('/favicon.svg');
    expect(res.status()).toBe(200);
  });

  test('a known local rabbit image is served', async ({ request }) => {
    const res = await request.get('/rabbits/200.jpg');
    expect([200, 304]).toContain(res.status());
  });
});
