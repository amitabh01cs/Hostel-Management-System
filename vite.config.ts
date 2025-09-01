import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),

      // 🔽 Add your module aliases here for Vercel to resolve properly
      "@hostelDashboard": path.resolve(__dirname, "module/HostelDashboard/client/src"),
      "@hostelStudentPortal": path.resolve(__dirname, "module/HostelStudentPortal/client/src"),
      "@securityDashboard": path.resolve(__dirname, "module/SecurityDashboard/client/src"),
      "@registerStudent": path.resolve(__dirname, "module/RegisterStudent/src"),
      "@gatePassPortal": path.resolve(__dirname, "module/GatePassPortal/client/src"),
      "@roomManager": path.resolve(__dirname, "module/RoomManager/client/src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    // proxy: {
    //   "/api": {
    //     target: "https://backend-hostel-module-production-iist.up.railway.app/",
    //     changeOrigin: true,
    //     secure: false,
    //   },
    // },
  },
});
