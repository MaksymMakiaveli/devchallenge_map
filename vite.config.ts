// https://vitejs.dev/config/
import { defineConfig } from 'vite';

export default defineConfig({
  // --------------- Css configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]_[hash:base64:2]',
    },
  },
});
