
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  // Support both API_KEY (legacy) and GEMINI_API_KEY (Vercel standard)
  const apiKey = env.GEMINI_API_KEY || env.API_KEY || '';

  return {
    plugins: [react()],
    // Inject the API key so it's available at runtime via process.env.API_KEY
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
    },
    build: {
      // Disable Source Maps to protect source code
      sourcemap: false,
    },
  };
});
