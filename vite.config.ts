/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Engine/unit tests run in node; render smoke tests opt into jsdom
    // via a per-file `// @vitest-environment jsdom` pragma.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
