import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        environment: "node",
        setupFiles: ["./tests/setup.js"],
        globals: true,
        hookTimeout: 60000,
        testTimeout: 60000,
    },
})