import { mergeConfig } from "vite"
import baseConfig from "./vite.config.js"

export default mergeConfig(baseConfig, {
  server: {
    host: "127.0.0.1",
    port: 5182,
    strictPort: true,
    proxy: {
      "/api": { target: "http://127.0.0.1:8002", changeOrigin: true },
      "/invoice": { target: "http://127.0.0.1:8002", changeOrigin: true },
    },
  },
})
