import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base must match the GitHub repo name for GitHub Pages project sites.
// If you ever move to a custom domain or a *.pages.dev address, change base to "/".
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/nana-knows/",
});
