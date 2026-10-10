import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4187',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'python3 -m http.server 4187 --bind 127.0.0.1',
    cwd: repositoryRoot,
    url: 'http://127.0.0.1:4187/index.html',
    reuseExistingServer: false,
    timeout: 20_000,
  },
});
