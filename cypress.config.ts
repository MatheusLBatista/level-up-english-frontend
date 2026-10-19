import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 10000,
  },
  // Mesmo valor do NEXT_PUBLIC_API_URL do .env.local.
  expose: {
    apiUrl: "http://localhost:5011",
  },
});
