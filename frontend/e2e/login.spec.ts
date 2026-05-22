import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should successfully log in and redirect to chat', async ({ page }) => {
        // Mock the backend login API
        await page.route('**/api/v1/auth/login', async route => {
            const json = {
                message: 'Login successful.',
                user: {
                    id: 'mockUserId123',
                    email: 'test@example.com',
                    name: 'Test User',
                    avatarUrl: '',
                    bio: ''
                },
                token: 'mock-jwt-token'
            };
            await route.fulfill({ json, status: 200 });
        });

        // Mock check-auth which might be called on redirect
        await page.route('**/api/v1/auth/check-auth', async route => {
            const json = {
                user: {
                    id: 'mockUserId123',
                    email: 'test@example.com',
                    name: 'Test User',
                    avatarUrl: '',
                    bio: ''
                }
            };
            await route.fulfill({ json, status: 200 });
        });

        await page.goto('/login');

        // Fill the login form
        await page.getByLabel('Email').fill('test@example.com');
        await page.locator('input[type="password"], input[name="password"]').fill('password123');

        // Click login button
        await page.getByRole('button', { name: /login/i }).click();

        // The app uses a sonner toast for success, we can check for that text
        await expect(page.getByText('LoggedIn successful')).toBeVisible();

        // After 1.5s timeout, it pushes to /chat
        await expect(page).toHaveURL(/\/chat/);
    });

    test('should show error on invalid credentials', async ({ page }) => {
        // Mock failed login
        await page.route('**/api/v1/auth/login', async route => {
            await route.fulfill({
                json: { message: 'Invalid email or password.' },
                status: 400
            });
        });

        await page.goto('/login');

        await page.getByLabel('Email').fill('wrong@example.com');
        await page.locator('input[type="password"], input[name="password"]').fill('wrongpass');

        await page.getByRole('button', { name: /login/i }).click();

        // It sets error state for email input and toast
        await expect(page.getByText('Invalid email or password.')).toBeVisible();
    });
});