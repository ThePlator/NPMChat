import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        globals: true,
        hookTimeout: 300000,
        testTimeout: 300000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['server.js', 'typingHandler.js'],
            thresholds: {
                lines: 69,
                functions: 80,
                branches: 60,
                statements: 69
            }
        }
    },
})
