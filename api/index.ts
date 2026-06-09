export default async function handler(req: any, res: any) {
  try {
    // Dynamic import to catch any startup/initialization crashes gracefully
    const { default: app } = await import("../server");
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Function Startup Crash:", err);
    res.status(500).json({
      error: "SERVER_STARTUP_CRASH",
      message: err?.message || String(err),
      stack: err?.stack || null,
      context: "An error occurred during dynamic import('../server') inside /api/index.ts. This indicates a file-loading or startup-level exception."
    });
  }
}


