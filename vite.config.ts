import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { zendrApiPlugin } from './server/vitePlugin.ts';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.MONGODB_URI) process.env.MONGODB_URI = env.MONGODB_URI;
  if (env.JWT_SECRET) process.env.JWT_SECRET = env.JWT_SECRET;

  return {
    plugins: [react(), tailwindcss(), zendrApiPlugin()],
  };
});
