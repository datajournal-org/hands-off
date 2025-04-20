import { defineConfig, devices } from 'npm:@playwright/test';

const viewport = { width: 1024, height: 768 };

export default defineConfig({
	webServer: {
		command: 'deno task dev',
		port: 8081
	},
	testDir: 'tests',
	testMatch: /\.ts$/,
	projects: [
		{
			name: 'firefox',
			use: {
				...devices['Desktop Firefox'],
				viewport
			}
		}
	]
});
