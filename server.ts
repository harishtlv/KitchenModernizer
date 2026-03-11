import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ WARNING: GEMINI_API_KEY is not set in the environment or .env file.");
  }

  app.use(express.json({ limit: '50mb' }));

  // API route for logging to CLI
  app.post("/api/log", (req, res) => {
    const { level, message, data } = req.body;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [${level || 'INFO'}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    res.status(200).json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
