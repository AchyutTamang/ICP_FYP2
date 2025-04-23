import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // or whatever plugin you're using

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 👈 This line allows external devices to connect (like your iPhone)
    port: 5173, // Optional, but makes sure you're running on the same port
  },
});
