import { test, expect } from '@playwright/test';

test.describe('Message Flow', () => {
    test('should send a message successfully', async ({ page }) => {
        // 1. Mock the auth check so we are logged in
        await page.route('**/api/v1/auth/check-auth', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    user: {
                        id: 'my-user-id',
                        name: 'Me',
                        email: 'me@example.com',
                        avatarUrl: '',
                        bio: ''
                    }
                }
            });
        });

        // Set token in localStorage so ProtectedRoute doesn't kick us out
        await page.addInitScript(() => {
            window.localStorage.setItem('token', 'mock-token');
        });

        // 2. Mock the sidebar users
        await page.route('**/api/v1/messages/', async route => {
            await route.fulfill({
                status: 200,
                json: {
                    users: [
                        { _id: 'friend-id', name: 'Alice', status: 'online', avatarUrl: '' }
                    ],
                    unseenMessages: {}
                }
            });
        });

        // 3. Mock the chat history with the selected user
        await page.route('**/api/v1/messages/friend-id', async route => {
            // Return empty history or 1 message
            await route.fulfill({
                status: 200,
                json: [
                    { _id: 'msg1', text: 'Hi there', senderId: 'friend-id', receiverId: 'my-user-id', createdAt: new Date().toISOString() }
                ]
            });
        });

        // 4. Mock the send message API
        await page.route('**/api/v1/messages/send/friend-id', async route => {
            const postData = JSON.parse(route.request().postData() || '{}');
            await route.fulfill({
                status: 201,
                json: {
                    message: 'Message sent successfully.',
                    data: {
                        _id: 'msg2',
                        text: postData.text,
                        senderId: 'my-user-id',
                        receiverId: 'friend-id',
                        createdAt: new Date().toISOString()
                    }
                }
            });
        });

        // Navigate to chat
        await page.goto('/chat');

        // Select "Alice" from sidebar
        await page.getByText('Alice').first().click();

        // Verify chat history loaded
        await expect(page.getByText('Hi there')).toBeVisible();

        // Type a new message
        const input = page.getByPlaceholder('Type a message...');
        await input.fill('Hello Playwright!');

        // Click Send
        await page.getByRole('button', { name: 'Send' }).click();

        // Verify the new message appears in the UI
        await expect(page.getByText('Hello Playwright!')).toBeVisible();
    });
});