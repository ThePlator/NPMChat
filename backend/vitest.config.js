import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        globals: true,
        hookTimeout: 60000,
        testTimeout: 60000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['server.js'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        }
    },
})