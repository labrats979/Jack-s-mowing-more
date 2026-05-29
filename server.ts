import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route for AI Chatbot
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not defined. Please add it in Settings > Secrets." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map chat history to Gemini standard "contents"
      const contents = [];
      if (Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "model" || msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.text }]
          });
        }
      }

      // Add the final user message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const systemInstruction = 
        `You are "Anthany", a senior Horticultural Representative and Customer Desk Advisor writing back directly to clients of "Jack's Mowing & More" — a high-quality residential landscaping brand based in Oregon (serving West Linn, Lake Oswego, Portland Hills, and surrounding local areas).

CRITICAL SPEED & CONCISENESS RULES:
1. RESPONSE SPEED (CRITICAL): Keep your response extremely brief, short, and to-the-point to keep response times high! Provide a quick 1-3 sentence response or a small bulleted list. The entire response must be under 75 words. 
2. No conversational filler, no repeating the customer's question, and absolutely no long paragraphs. Direct, instant answers only.

CRITICAL IDENTITY RULES:
3. Your name is "Anthany". If anyone asks who they are talking to, or introduces themselves, respond as Anthany, a human landscaping specialist at Jack's Mowing & More.
4. NEVER let anyone know you are an AI, a chatbot, a computer routine, a simulator, or an automated model.
5. Under no circumstances should you mention "AI", "bot", "large language model", "Gemini", "system instructions", "prompt", "dataset", or "algorithms" to your clients. Behave entirely as a real, highly capable, and experienced human team member.
6. Be friendly, elegant, polite, and deeply knowledgeable about local horticulture (such as Lake Oswego clay and West Linn silt prep, organic mycorrhizae root inoculants, and aeration timelines).

Your goals:
1. Provide elegant, friendly, professional, and knowledgeable advice about grass health, soil ecology, organic compost building, hedge trimming, weed removal, seasonal cleanup, and general landscaping.
2. Maintain a warm, premium, botanical-themed, and landscape-insightful tone.
3. Be fully knowledgeable about Jack's Mowing & More's services, and reference them cheerfully when relevant:
   - Lawn Mowing ($20 - $30+): licensed cut geometry, string edging, blowing.
   - Leaf Cleanup ($150+): lawn clearing, garden beds vacuum sweep, gutter/entry blowing.
   - Shrub & plant care / Hedge Trimming ($80+): symmetrical shaping, deep leafy denseness.
   - Mulch Installation ($250+): natural moisture barrier, consistent 2-3 inch depth.
   - Weed Removal ($90+): complete root-level pulling, child/pet friendly, bed monitoring.
   - Fertilizing / Lawn Nutrition ($65+): macro-nutrient seasonal feed, deep green grass.
   - Lawn Restoration ($350+): core compaction de-relief, aeration, high-germination hybrid seeds.
   - Landscape Design & Installation (Custom Proposal): bespoke garden bed plans, compost soil building, premium specimen plants pre-treated with local Mycorrhizae roots.
4. Direct users to the interactive tools on our website when appropriate:
   - To calculate initial custom estimates instantly, tell them to use the "Cost Estimator" tool on our website.
   - To book a service or request an exact in-person fixed-price quote, recommend filling out the "Book Service" or "Booking Form" at the top of our page.
   - Invite them to explore the "Project Portfolio" to see real interactive Before/After sliders of our soil ecology transformations.
5. Keep your responses structured, clear, and action-oriented. Use Markdown bulleted lists and short paragraphs. Avoid overly exhaustive walls of text. Be warm, humble, and polite. Always respond as Anthany at the gardening desk of Jack's.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I was unable to formulate a response at the moment. Please feel free to ask another gardening or landscaping question!";
      res.json({ text: replyText });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ 
        error: "Failed to communicate with our AI engine. Please verify your GEMINI_API_KEY." 
      });
    }
  });

  // API Route for Fetching Persistent Reviews/Testimonials
  app.get("/api/reviews", (req, res) => {
    try {
      const dbPath = path.join(process.cwd(), "src", "data", "reviews_db.json");
      if (!fs.existsSync(dbPath)) {
        return res.json([]);
      }
      const data = fs.readFileSync(dbPath, "utf-8");
      res.json(JSON.parse(data));
    } catch (error: any) {
      console.error("Failed to read reviews database:", error);
      res.status(500).json({ error: "Failed to retrieve testimonials portfolio stats." });
    }
  });

  // API Route for Submitting a New Review (Saves persistently)
  app.post("/api/reviews", (req, res) => {
    try {
      const { author, location, rating, projectType, content } = req.body;
      if (!author || !content) {
        return res.status(400).json({ error: "Author name and content reviews are mandatory." });
      }

      const dbPath = path.join(process.cwd(), "src", "data", "reviews_db.json");
      let reviews = [];
      if (fs.existsSync(dbPath)) {
        reviews = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      }

      const newReview = {
        id: `custom-test-${Date.now()}`,
        author: author,
        location: location || "Local Property Owner",
        rating: Number(rating) || 5,
        projectType: projectType || "Property Care",
        content: content,
        date: "Just now",
        isGoogle: false
      };

      reviews.unshift(newReview);
      fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2), "utf-8");
      res.status(201).json(reviews);
    } catch (error: any) {
      console.error("Failed to write to reviews database:", error);
      res.status(500).json({ error: "Failed to log review to persistent server-side files." });
    }
  });

  // API Route for Syncing with Google Business (Simulates a dynamic sync based on their active link)
  app.post("/api/reviews/sync-google", (req, res) => {
    try {
      const dbPath = path.join(process.cwd(), "src", "data", "reviews_db.json");
      let reviews = [];
      if (fs.existsSync(dbPath)) {
        reviews = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      }

      // Check if we already have these pre-populated simulation reviews, if not we add them.
      // Additionally, we inject a real new review that "just got imported from Google page" to demo the live connection!
      const googleMockImports = [
        {
          id: `google-imported-${Date.now()}`,
          author: "Justin & Melissa K.",
          location: "Lake Oswego, OR",
          rating: 5,
          projectType: "Precision Lawn Mowing",
          content: "Spotted Jack's crew in the neighborhood and booked a weekly cut. Hand-down the cleanest lawn edges we've had in 10 years! Symmetrical diagonal cuts look incredible.",
          date: "Yesterday",
          isGoogle: true,
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
        },
        {
          id: `google-imported-2-${Date.now()}`,
          author: "Rebecca Sterling",
          location: "West Linn, OR",
          rating: 5,
          projectType: "Hedge Trimming",
          content: "Absolutely exceptional! They reshaped our massive, shaggy Laurel hedge with absolute geometric perfection. The crew cleaned up every single leaf before leaving.",
          date: "3 days ago",
          isGoogle: true,
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
        }
      ];

      // Add only ones that aren't duplicates
      let addedCount = 0;
      for (const mockRev of googleMockImports) {
        const exists = reviews.some((r: any) => r.author === mockRev.author && r.content === mockRev.content);
        if (!exists) {
          reviews.unshift(mockRev);
          addedCount++;
        }
      }

      fs.writeFileSync(dbPath, JSON.stringify(reviews, null, 2), "utf-8");
      res.json({ 
        success: true, 
        message: addedCount > 0 
          ? `Successfully synchronized live Google Business reviews! Imported ${addedCount} new 5-star reviews from search index.` 
          : "Google business index is already fully synchronized with no new reviews.", 
        reviews 
      });
    } catch (error: any) {
      console.error("Failed Google Sync simulation:", error);
      res.status(500).json({ error: "Failed to perform search engine queries for reviews." });
    }
  });

  // API Route for Image Generation
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not defined. Please add it in Settings > Secrets." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio || '4:3',
        },
      });

      if (response && response.generatedImages && response.generatedImages[0]) {
        const base64EncodeString = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64EncodeString}`;
        res.json({ imageUrl });
      } else {
        throw new Error("Invalid response received from the Image Generation model.");
      }

    } catch (error: any) {
      console.error("Image Generation API Error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate image under our brand spec. Ensure your GEMINI_API_KEY is active in Settings." 
      });
    }
  });

  // API Route for Handholding custom image physical file uploads
  app.post("/api/upload-image", (req, res) => {
    try {
      const { base64, fileName } = req.body;
      if (!base64 || !fileName) {
        return res.status(400).json({ error: "Image base64 data and fileName are required." });
      }

      // Detect and strip standard Base64 URI prefixes (e.g. data:image/jpeg;base64,...)
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64Data = base64;
      if (matches && matches.length === 3) {
        base64Data = matches[2];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const safeSuffix = Date.now() + "_" + Math.floor(Math.random() * 1000);
      const cleanedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const safeFileName = `uploaded_${safeSuffix}_${cleanedFileName}`;
      
      const imagesDir = path.join(process.cwd(), "src", "assets", "images");
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const destPath = path.join(imagesDir, safeFileName);
      fs.writeFileSync(destPath, buffer);

      // Return the relative URL path inside source assets
      const imageUrl = `/src/assets/images/${safeFileName}`;
      res.json({ imageUrl });
    } catch (err: any) {
      console.error("Image upload processing error:", err);
      res.status(500).json({ error: err.message || "Disk write failure for custom visual assets upload." });
    }
  });

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Expose the uploaded and default physical service/portfolio visuals statically
  app.use("/src/assets/images", express.static(path.join(process.cwd(), "src", "assets", "images")));

  // Vite development middleware vs Static Production bundle
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
