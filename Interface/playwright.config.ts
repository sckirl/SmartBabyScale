import { defineConfig } from '@playwright/test';

// ponytail: Use the simplest config that starts the server and runs headed tests
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3777',
    headless: false, // Run in headed mode as requested by user
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3777',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
