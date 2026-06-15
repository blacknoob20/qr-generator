import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    allowedHosts: ['app'],
    host: true,
    port: 5173,
  },
});
