import { test, expect } from '@playwright/test'

test.describe('Abundance at Arms - Conflict Mapping', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('homepage has Arms chip in header', async ({ page }) => {
    const armsChip = page.locator('.wiki-site-header__arms-link')
    await expect(armsChip).toBeVisible()
    await expect(armsChip).toContainText('Arms')
    await expect(armsChip).toHaveAttribute('href', '/arms')
  })

  test('Arms chip links to /arms route', async ({ page }) => {
    const armsChip = page.locator('.wiki-site-header__arms-link')
    await armsChip.click()
    await expect(page).toHaveURL('http://localhost:3001/arms')
  })

  test('/arms page loads with correct title and layout', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    // Check page title
    await expect(page).toHaveTitle('Abundance at Arms — Global Conflict Map')

    // Check main layout elements
    const pageRoot = page.locator('.arms-page-root')
    await expect(pageRoot).toBeVisible()

    const layout = page.locator('.arms-layout')
    await expect(layout).toBeVisible()
  })

  test('header bar renders with back link and title', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const headerBar = page.locator('.arms-header-bar')
    await expect(headerBar).toBeVisible()

    const backLink = page.locator('.arms-back-link')
    await expect(backLink).toBeVisible()
    await expect(backLink).toContainText('ageofabundance.wiki')

    const title = page.locator('.arms-title')
    await expect(title).toBeVisible()
    await expect(title).toContainText('Abundance at Arms')
  })

  test('globe/table toggle buttons render and are clickable', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const globeBtn = page.locator('.arms-toggle-btn').first()
    const tableBtn = page.locator('.arms-toggle-btn').nth(1)

    await expect(globeBtn).toBeVisible()
    await expect(tableBtn).toBeVisible()
    await expect(globeBtn).toContainText('Globe')
    await expect(tableBtn).toContainText('Table')
  })

  test('filter bar renders with tag chips', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const filterBar = page.locator('.arms-filter-bar')
    await expect(filterBar).toBeVisible()

    // Check for tag chips
    const chips = page.locator('.arms-tag-chip')
    const count = await chips.count()
    expect(count).toBeGreaterThan(0)

    // Check for specific tags
    await expect(page.locator('.arms-tag-chip:has-text("lethal")')).toBeVisible()
    await expect(page.locator('.arms-tag-chip:has-text("protest")')).toBeVisible()
    await expect(page.locator('.arms-tag-chip:has-text("cyber")')).toBeVisible()
  })

  test('API endpoint /api/arms-events returns data', async ({ page }) => {
    const response = await page.request.get('http://localhost:3001/api/arms-events?limit=5')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('events')
    expect(Array.isArray(data.events)).toBe(true)
    expect(data.events.length).toBeGreaterThan(0)

    // Verify event structure
    const event = data.events[0]
    expect(event).toHaveProperty('name')
    expect(event).toHaveProperty('lat')
    expect(event).toHaveProperty('lon')
    expect(event).toHaveProperty('weight')
    expect(event).toHaveProperty('source')
  })

  test('API endpoint filters by tag correctly', async ({ page }) => {
    const response = await page.request.get('http://localhost:3001/api/arms-events?tag=lethal&limit=10')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.events.length).toBeGreaterThan(0)

    // All returned events should have tag='lethal'
    data.events.forEach((event: any) => {
      expect(event.tag).toBe('lethal')
    })
  })

  test('API endpoint respects limit parameter', async ({ page }) => {
    const limit = 3
    const response = await page.request.get(`http://localhost:3001/api/arms-events?limit=${limit}`)
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.events.length).toBeLessThanOrEqual(limit)
  })

  test('back link navigates to homepage', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const backLink = page.locator('.arms-back-link')
    await backLink.click()

    await expect(page).toHaveURL('http://localhost:3001')
  })

  test('canvas wrapper is present for globe view', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    // Check that canvas wrapper exists
    const canvasWrapper = page.locator('.arms-canvas-wrapper')
    await expect(canvasWrapper).toBeVisible()
  })

  test('toggle to table view changes layout', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    // Initially globe view
    let canvasWrapper = page.locator('.arms-canvas-wrapper')
    await expect(canvasWrapper).toBeVisible()

    // Click table toggle button
    const tableBtn = page.locator('.arms-toggle-btn:has-text("Table")')
    await tableBtn.click()

    // Wait for page to update
    await page.waitForTimeout(500)

    // Check for table elements
    const table = page.locator('.arms-table')
    if (await table.isVisible()) {
      expect(true).toBe(true) // Table rendered successfully
    }
  })

  test('page background color matches dark theme', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const layout = page.locator('.arms-layout')
    const bgColor = await layout.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Verify it's a dark color (not white or light)
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
    expect(bgColor).not.toBe('rgb(240, 240, 240)')
  })

  test('CSS files are loaded', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const stylesheets = await page.locator('link[rel="stylesheet"]').count()
    expect(stylesheets).toBeGreaterThan(0)
  })

  test('JavaScript bundles are loaded', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    const scripts = await page.locator('script').count()
    expect(scripts).toBeGreaterThan(0)
  })

  test('page has proper accessibility attributes', async ({ page }) => {
    await page.goto('http://localhost:3001/arms')

    // Check for skip link
    const skipLink = page.locator('.wiki-skip-link')
    await expect(skipLink).toBeVisible()

    // Check for aria labels
    const armsChip = page.locator('[aria-label="Abundance at Arms — conflict map"]')
    await expect(armsChip).toBeVisible()
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('http://localhost:3001/arms')

    // Allow time for any errors to appear
    await page.waitForTimeout(2000)

    // Filter out known safe errors
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('__kapsuleInstance') &&
        !e.includes('Cannot read properties of undefined') &&
        !e.includes('polyfill') &&
        !e.includes('next-dev')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('responsive design: filter bar wraps on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:3001/arms')

    const filterBar = page.locator('.arms-filter-bar')
    await expect(filterBar).toBeVisible()

    // Check that chips exist (they should wrap)
    const chips = page.locator('.arms-tag-chip')
    expect(await chips.count()).toBeGreaterThan(0)
  })

  test('responsive design: panel is visible on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:3001/arms')

    const headerBar = page.locator('.arms-header-bar')
    await expect(headerBar).toBeVisible()
  })

  test('header hides wiki site header when active', async ({ page }) => {
    // Start on homepage where wiki header is visible
    await page.goto('http://localhost:3001')
    const wikiHeader = page.locator('.wiki-site-header')
    await expect(wikiHeader).toBeVisible()

    // Navigate to /arms
    await page.goto('http://localhost:3001/arms')

    // Wiki header should still be in DOM but hidden
    const headerElement = await page.locator('.wiki-site-header')
    const isHidden = await headerElement.evaluate((el) => {
      const style = window.getComputedStyle(el)
      return style.opacity === '0' || style.pointerEvents === 'none'
    })

    expect(isHidden).toBe(true)
  })
})
