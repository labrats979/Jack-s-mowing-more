import dotenv from "dotenv";
import path from "path";
import express from "express";
import app from "./api/index"; // Safe ES module import of the Express app

dotenv.config();

const PORT = 3000;

async function startServer() {
  // If we are NOT running in production mode, mount Vite as a middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting developer server environment with Vite middleware...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("⚡ Vite middleware successfully loaded and bound!");
    } catch (err: any) {
      console.error("⚠️ Failed to boot development Vite compiler middleware:", err.message || err);
    }
  } else {
    // Serve static compiled UI files in production container environment
    console.log("📦 Starting production container server environment...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Always listen on Host 0.0.0.0 and Port 3000 for standard ingress routing
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Jack's Landscaping backend server ready on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("💥 Emergency startup failure for main container launcher:", err);
});
