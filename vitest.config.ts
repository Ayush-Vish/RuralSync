import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, './'),
            'leaflet/dist/leaflet.css': resolve(__dirname, './vitest.setup.ts'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        globals: true,
    },
})
