import { test, expect } from '@playwright/test'

/**
 * RTL Screenshot Tests
 * 
 * These tests verify that Arabic RTL (right-to-left) layout is correctly applied
 * across all pages that support the Arabic language.
 * 
 * Test strategy:
 * 1. Navigate to each page with English (LTR)
 * 2. Switch to Arabic language
 * 3. Verify RTL attributes and layout
 * 4. Take screenshots for visual verification
 */

test.describe('RTL Layout Verification', () => {
  // Helper to switch language to Arabic
  async function switchToArabic(page: any) {
    // Click the language selector button (globe icon)
    const langButton = page.locator('button[data-testid], button').filter({ has: page.locator('span') }).first()
    await langButton.click()
    
    // Wait for dropdown to appear
    await page.waitForSelector('[data-testid*=\"lang-option\"]', { timeout: 5000 }).catch(() => {
      // Try alternative selector if data-testid not found
      return page.waitForSelector('button:has-text(\"العربية\")', { timeout: 5000 })
    })
    
    // Click Arabic option
    const arabicOption = page.locator('[data-testid=\"lang-option-ar\"]').first()
    await arabicOption.click()
    
    // Wait for language change to apply
    await page.waitForTimeout(500)
  }
  
  test('customer/login - English LTR layout', async ({ page }) => {
    await page.goto('/customer/login')
    await page.waitForLoadState('networkidle')
    
    // Verify LTR by default
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('ltr')
    
    // Verify language selector shows English
    const langText = await page.locator('[data-testid=\"current-lang-display\"]').textContent()
    expect(langText).toContain('EN')
  })
  
  test('customer/login - Arabic RTL layout', async ({ page }) => {
    await page.goto('/customer/login')
    await page.waitForLoadState('networkidle')
    
    // Switch to Arabic
    await switchToArabic(page)
    
    // Verify RTL is applied
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    // Verify HTML lang attribute is Arabic
    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBe('ar')
    
    // Verify language selector shows Arabic
    const langText = await page.locator('[data-testid=\"current-lang-display\"]').textContent()
    expect(langText).toContain('AR')
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'screenshots/customer-login-arabic-rtl.png', fullPage: true })
  })
  
  test('owner/login - Arabic RTL layout', async ({ page }) => {
    await page.goto('/owner/login')
    await page.waitForLoadState('networkidle')
    
    await switchToArabic(page)
    
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBe('ar')
    
    await page.screenshot({ path: 'screenshots/owner-login-arabic-rtl.png', fullPage: true })
  })
  
  test('customer/signup - Arabic RTL layout', async ({ page }) => {
    await page.goto('/customer/signup')
    await page.waitForLoadState('networkidle')
    
    await switchToArabic(page)
    
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBe('ar')
    
    await page.screenshot({ path: 'screenshots/customer-signup-arabic-rtl.png', fullPage: true })
  })
  
  test('customer/forgot-password - Arabic RTL layout', async ({ page }) => {
    await page.goto('/customer/forgot-password')
    await page.waitForLoadState('networkidle')
    
    await switchToArabic(page)
    
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    await page.screenshot({ path: 'screenshots/customer-forgot-password-arabic-rtl.png', fullPage: true })
  })
  
  test('contact page - Arabic RTL layout', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    
    await switchToArabic(page)
    
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    await page.screenshot({ path: 'screenshots/contact-arabic-rtl.png', fullPage: true })
  })
  
  test('demo page - Arabic RTL layout', async ({ page }) => {
    await page.goto('/demo')
    await page.waitForLoadState('networkidle')
    
    await switchToArabic(page)
    
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    await page.screenshot({ path: 'screenshots/demo-arabic-rtl.png', fullPage: true })
  })
  
  test('language persistence across page navigation', async ({ page }) => {
    // Start on customer/login in English
    await page.goto('/customer/login')
    await page.waitForLoadState('networkidle')
    
    // Switch to Arabic
    await switchToArabic(page)
    expect(await page.getAttribute('html', 'dir')).toBe('rtl')
    
    // Navigate to another page (should maintain RTL via localStorage + event)
    await page.goto('/customer/signup')
    await page.waitForLoadState('networkidle')
    
    // Verify RTL is maintained
    const htmlDir = await page.getAttribute('html', 'dir')
    expect(htmlDir).toBe('rtl')
    
    const htmlLang = await page.getAttribute('html', 'lang')
    expect(htmlLang).toBe('ar')
  })
  
  test('RTL CSS classes applied to body', async ({ page }) => {
    await page.goto('/customer/login')
    await page.waitForLoadState('networkidle')
    
    await switchToArabic(page)
    
    // Verify the body has correct RTL direction styling
    const bodyDir = await page.locator('body').getAttribute('dir')
    expect(bodyDir).toBe('rtl')
    
    // Check that the main container also has dir attribute
    const mainContainer = page.locator('[dir=\"rtl\"]').first()
    await expect(mainContainer).toBeVisible()
  })
})