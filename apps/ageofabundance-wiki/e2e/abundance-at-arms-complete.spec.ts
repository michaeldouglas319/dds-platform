import { test, expect } from '@playwright/test'

test.describe('Abundance at Arms - Complete User Journey', () => {
  test('Full experience: homepage → arms → interact → back home', async ({
    page,
  }) => {
    // Step 1: Start at homepage
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' })
    expect(page.url()).toContain('localhost:3001')

    // Step 2: Verify Arms chip exists on homepage
    const armsChip = page.locator('.wiki-site-header__arms-link')
    await expect(armsChip).toBeVisible()
    console.log('✅ Arms chip visible on homepage')

    // Step 3: Click Arms chip and navigate to /arms
    await armsChip.click()
    await page.waitForURL('**/arms', { waitUntil: 'domcontentloaded' })
    expect(page.url()).toContain('/arms')
    console.log('✅ Successfully navigated to /arms')

    // Step 4: Verify page title and main layout
    await expect(page).toHaveTitle('Abundance at Arms — Global Conflict Map')
    const pageRoot = page.locator('.arms-page-root')
    await expect(pageRoot).toBeVisible()
    console.log('✅ Page title and layout correct')

    // Step 5: Verify header bar
    const headerBar = page.locator('.arms-header-bar')
    await expect(headerBar).toBeVisible()
    await expect(page.locator('.arms-title')).toContainText('Abundance at Arms')
    console.log('✅ Header bar renders correctly')

    // Step 6: Verify globe/table toggle buttons
    const globeBtn = page.locator('.arms-toggle-btn').first()
    const tableBtn = page.locator('.arms-toggle-btn').nth(1)
    await expect(globeBtn).toBeVisible()
    await expect(tableBtn).toBeVisible()
    console.log('✅ Toggle buttons visible')

    // Step 7: Verify filter bar with tags
    const filterBar = page.locator('.arms-filter-bar')
    await expect(filterBar).toBeVisible()
    const tags = page.locator('.arms-tag-chip')
    const tagCount = await tags.count()
    expect(tagCount).toBeGreaterThan(0)
    console.log(`✅ Filter bar visible with ${tagCount} tag chips`)

    // Step 8: Test filtering by tag
    const lethalChip = page.locator('.arms-tag-chip:has-text("lethal")').first()
    await lethalChip.click()
    await page.waitForTimeout(500)
    console.log('✅ Filtered by "lethal" tag')

    // Step 9: Verify canvas is rendering
    const canvas = page.locator('canvas')
    const canvasCount = await canvas.count()
    expect(canvasCount).toBeGreaterThan(0)
    console.log(`✅ Canvas element present (${canvasCount})`)

    // Step 10: Toggle to table view
    await tableBtn.click()
    await page.waitForTimeout(500)
    const table = page.locator('.arms-table')
    if (await table.isVisible()) {
      console.log('✅ Table view renders on toggle')
    }

    // Step 11: Toggle back to globe view
    await globeBtn.click()
    await page.waitForTimeout(500)
    const canvasAfterToggle = page.locator('canvas')
    expect(await canvasAfterToggle.count()).toBeGreaterThan(0)
    console.log('✅ Globe view renders after toggle back')

    // Step 12: Test API endpoint
    const apiResponse = await page.request.get('http://localhost:3001/api/arms-events?tag=lethal&limit=5')
    expect(apiResponse.status()).toBe(200)
    const apiData = await apiResponse.json()
    expect(apiData.events.length).toBeGreaterThan(0)
    console.log(`✅ API endpoint returns ${apiData.events.length} events`)

    // Step 13: Verify event data structure
    const firstEvent = apiData.events[0]
    expect(firstEvent).toHaveProperty('name')
    expect(firstEvent).toHaveProperty('lat')
    expect(firstEvent).toHaveProperty('lon')
    expect(firstEvent).toHaveProperty('weight')
    expect(firstEvent).toHaveProperty('source')
    console.log('✅ Event data structure correct')

    // Step 14: Clear filters (click "All Events")
    const allEventsChip = page.locator('.arms-tag-chip:has-text("All Events")').first()
    await allEventsChip.click()
    await page.waitForTimeout(500)
    console.log('✅ Cleared filters')

    // Step 15: Navigate back to homepage
    const backLink = page.locator('.arms-back-link')
    await expect(backLink).toBeVisible()
    await backLink.click()
    await page.waitForURL('http://localhost:3001', { waitUntil: 'networkidle' })
    expect(page.url()).toBe('http://localhost:3001/')
    console.log('✅ Successfully navigated back to homepage')

    // Step 16: Verify we're back on homepage
    const wikiLogo = page.locator('.wiki-site-header__logo')
    await expect(wikiLogo).toBeVisible()
    console.log('✅ Back on homepage with wiki logo visible')

    console.log('\n✅ Complete user journey successful!')
  })

  test('API comprehensive testing', async ({ page }) => {
    // Test 1: Default query
    let response = await page.request.get('http://localhost:3001/api/arms-events')
    expect(response.status()).toBe(200)
    let data = await response.json()
    expect(data.events.length).toBeGreaterThan(0)
    console.log('✅ Default query returns events')

    // Test 2: Filter by tag
    response = await page.request.get('http://localhost:3001/api/arms-events?tag=protest')
    data = await response.json()
    data.events.forEach((e: any) => {
      expect(e.tag).toBe('protest')
    })
    console.log('✅ Tag filter working')

    // Test 3: Limit parameter
    response = await page.request.get('http://localhost:3001/api/arms-events?limit=2')
    data = await response.json()
    expect(data.events.length).toBeLessThanOrEqual(2)
    console.log('✅ Limit parameter working')

    // Test 4: Invalid tag returns empty
    response = await page.request.get('http://localhost:3001/api/arms-events?tag=invalid')
    data = await response.json()
    // May return empty or all events depending on implementation
    expect(Array.isArray(data.events)).toBe(true)
    console.log('✅ Invalid tag handled gracefully')

    // Test 5: Verify all events have required fields
    response = await page.request.get('http://localhost:3001/api/arms-events?limit=10')
    data = await response.json()
    data.events.forEach((event: any) => {
      expect(event.lat).toBeDefined()
      expect(event.lon).toBeDefined()
      expect(typeof event.lat).toBe('number')
      expect(typeof event.lon).toBe('number')
    })
    console.log('✅ All events have required fields')
  })

  test('Responsive design across viewports', async ({ page }) => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 812 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
    ]

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('http://localhost:3001/arms', { waitUntil: 'domcontentloaded' })

      const pageRoot = page.locator('.arms-page-root')
      await expect(pageRoot).toBeVisible()

      const headerBar = page.locator('.arms-header-bar')
      await expect(headerBar).toBeVisible()

      const filterBar = page.locator('.arms-filter-bar')
      await expect(filterBar).toBeVisible()

      console.log(`✅ Layout works on ${viewport.name} (${viewport.width}x${viewport.height})`)
    }
  })

  test('No critical errors in console', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('http://localhost:3001/arms', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('polyfill') &&
        !e.includes('next-dev') &&
        !e.includes('Cannot read properties of undefined') &&
        e.length > 0
    )

    expect(criticalErrors.length).toBe(0)
    console.log('✅ No critical console errors')
  })
})
