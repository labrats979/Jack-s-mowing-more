import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Firestore setup for real-time sync across all container instances
let firebaseApp: any = null;
let firestoreDb: any = null;
let storageBucket: any = null;
let firebaseConfig: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    if (firebaseConfig.storageBucket) {
      storageBucket = getStorage(firebaseApp);
      console.log(`🔥 Connected to Firebase Storage bucket: ${firebaseConfig.storageBucket}`);
    }
    console.log("🔥 Firebase Client Web SDK initialized successfully on backend server for global real-time synchronization!");
  } else {
    console.warn("⚠️ firebase-applet-config.json not found. Fallback to local files only.");
  }
} catch (err) {
  console.error("❌ Failed to initialize Firebase on backend server:", err);
}

// Global cached config getter/setter with high-availability cloud backing & local disk fallback
async function getConfig(key: string, defaultVal: any) {
  const localPath = path.join(process.cwd(), "src", "data", `${key}_db.json`);
  
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "site_configs", key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const snapData = docSnap.data();
        if (snapData && snapData.hasOwnProperty("data")) {
          return snapData.data;
        }
        return snapData;
      }
    } catch (err: any) {
      console.warn(`Firestore fallback warning: Error reading ${key} from Firestore, using local file backup instead. Details:`, err.message || err);
    }
  }

  // Fallback to local JSON files
  if (fs.existsSync(localPath)) {
    try {
      const fileData = fs.readFileSync(localPath, "utf-8").trim();
      return fileData ? JSON.parse(fileData) : defaultVal;
    } catch (e) {
      console.warn(`Error reading local db file for ${key}:`, e);
    }
  }
  return defaultVal;
}

async function saveConfig(key: string, value: any) {
  // 1. Save to local disk first as a reliable backup
  const localPath = path.join(process.cwd(), "src", "data", `${key}_db.json`);
  const dirPath = path.dirname(localPath);
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(localPath, JSON.stringify(value, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing local backup file for ${key}:`, err);
  }

  // 2. Sync directly to Firestore for high-availability multi-instance mirroring
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "site_configs", key);
      const payload = Array.isArray(value) ? { data: value } : value;
      await setDoc(docRef, payload);
      console.log(`📡 Successfully pushed changes for ${key} to public Firestore db.`);
    } catch (err: any) {
      console.warn(`Firestore sync transient warning: Error syncing ${key} to Firestore. Will continue using local filesystem backing. Details:`, err.message || err);
    }
  }
}

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
        `You are "Anthany", a senior Horticultural Representative and Customer Desk Advisor writing back directly to clients of "Jack's Mowing & More" — a high-quality residential landscaping brand based exclusively in Milltown, New Jersey (serving ONLY Milltown, New Jersey and surrounding immediate local areas). Do NOT mention or suggest serving any other areas or Oregon under any circumstances.

CRITICAL SPEED & CONCISENESS RULES:
1. RESPONSE SPEED (CRITICAL): Keep your response extremely brief, short, and to-the-point to keep response times high! Provide a quick 1-3 sentence response or a small bulleted list. The entire response must be under 75 words. 
2. No conversational filler, no repeating the customer's question, and absolutely no long paragraphs. Direct, instant answers only.

CRITICAL IDENTITY RULES:
3. Your name is "Anthany". If anyone asks who they are talking to, or introduces themselves, respond as Anthany, a human landscaping specialist at Jack's Mowing & More.
4. NEVER let anyone know you are an AI, a chatbot, a computer routine, a simulator, or an automated model.
5. Under no circumstances should you mention "AI", "bot", "large language model", "Gemini", "system instructions", "prompt", "dataset", or "algorithms" to your clients. Behave entirely as a real, highly capable, and experienced human team member.
6. Be friendly, elegant, polite, and deeply knowledgeable about local New Jersey horticulture (such as Milltown, New Jersey clay loam, local Jersey red soil prep, organic mycorrhizae root inoculants, and Northeast seasonal aeration timelines).

Your goals:
1. Provide elegant, friendly, professional, and knowledgeable advice about grass health, soil ecology, organic compost building, hedge trimming, weed removal, seasonal cleanup, and general New Jersey landscaping.
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

  // API Route for Fetching Persistent Bookings/Leads
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await getConfig("bookings", []);
      res.json(bookings);
    } catch (error: any) {
      console.error("Failed to read bookings database:", error);
      res.status(500).json({ error: "Failed to retrieve bookings." });
    }
  });

  // API Route for Submitting or Synchronizing Bookings & Sending Email Notifications
  app.post("/api/bookings", async (req, res) => {
    try {
      const { lead } = req.body;
      if (!lead || !lead.fullName || !lead.email || !lead.phone) {
        return res.status(400).json({ error: "Booking lead details are incomplete." });
      }

      let bookings = await getConfig("bookings", []);

      // Avoid duplication
      const exists = bookings.some((b: any) => b.id === lead.id || (b.fullName === lead.fullName && b.createdAt === lead.createdAt));
      if (!exists) {
        bookings.unshift(lead);
        await saveConfig("bookings", bookings);
      }

      // Dispatch Email Notification!
      let emailSent = false;
      let emailError = "";

      // Load email settings database
      let fileConfig = await getConfig("email_config", {});

      const smtpUser = process.env.SMTP_USER || fileConfig.smtpUser || "jacks.mowing.and.more1@gmail.com";
      const smtpPass = process.env.SMTP_PASS || fileConfig.smtpPass || "";
      const recipientEmail = process.env.NOTIFICATION_RECIPIENT_EMAIL || fileConfig.recipientEmail || "jacks.mowing.and.more1@gmail.com";

      const servicesStr = Array.isArray(lead.services) ? lead.services.join(", ") : "None Selected";

      const emailSubject = `🔔 New Quote Request: ${lead.fullName} - ${lead.services?.[0] || 'Landscaping'}`;
      const emailText = 
`New landscaping inquiry received for Jack's Mowing & More!

Full Name: ${lead.fullName}
Email Address: ${lead.email}
Telephone: ${lead.phone}
Project Address: ${lead.address || 'Not Provided'}
Timeframe: ${lead.timeframe}

Requested Services:
${servicesStr}

Additional Lead Notes/Details:
${lead.notes || 'No description provided.'}

Lead ID: ${lead.id}
Created At: ${lead.createdAt}
---
This lead was logged locally on the client and is now synched with the dashboard.`;

      const emailHtml = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="background-color: #047857; padding: 24px; text-align: center; color: white;">
    <h2 style="margin: 0; font-size: 20px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">New Quote Inquiry Received!</h2>
    <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Jack's Mowing & More — Milltown, NJ</p>
  </div>
  
  <div style="padding: 24px; color: #1c1917; background-color: #fafaf9;">
    <h3 style="margin: 0 0 16px 0; font-size: 16px; border-bottom: 2px solid #e7e5e4; padding-bottom: 8px; color: #047857;">Client Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #78716c; width: 140px; font-weight: bold;">Full Name:</td>
        <td style="padding: 6px 0; font-size: 14px; color: #1c1917; font-weight: 500;">${lead.fullName}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #78716c; font-weight: bold;">Email:</td>
        <td style="padding: 6px 0; font-size: 14px; color: #047857; font-weight: 500;"><a href="mailto:${lead.email}" style="color: #047857; text-decoration: none;">${lead.email}</a></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #78716c; font-weight: bold;">Phone Number:</td>
        <td style="padding: 6px 0; font-size: 14px; color: #1c1917; font-weight: 500;"><a href="tel:${lead.phone}" style="color: #1c1917; text-decoration: none;">${lead.phone}</a></td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #78716c; font-weight: bold;">Project Site:</td>
        <td style="padding: 6px 0; font-size: 14px; color: #1c1917;">${lead.address || '<em>Not Provided</em>'}</td>
      </tr>
      <tr>
        <td style="padding: 6px 0; font-size: 13px; color: #78716c; font-weight: bold;">Timeframe:</td>
        <td style="padding: 6px 0; font-size: 13px; color: #180c02;"><span style="background-color: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">${lead.timeframe}</span></td>
      </tr>
    </table>

    <h3 style="margin: 0 0 12px 0; font-size: 16px; border-bottom: 2px solid #e7e5e4; padding-bottom: 8px; color: #047857;">Services Highlighted</h3>
    <p style="margin: 0 0 24px 0; font-size: 13px; font-weight: 600; color: #44403c;">${servicesStr}</p>

    <h3 style="margin: 0 0 12px 0; font-size: 16px; border-bottom: 2px solid #e7e5e4; padding-bottom: 8px; color: #047857;">Notes / Estimate Summary</h3>
    <div style="background-color: #ffffff; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; font-size: 13px; color: #44403c; line-height: 1.5; white-space: pre-wrap;">${lead.notes || 'No description provided.'}</div>
  </div>

  <div style="background-color: #f5f5f4; padding: 16px; text-align: center; border-top: 1px solid #e5e5e5; font-size: 11px; color: #78716c;">
    Message routed securely via lander backend to <strong style="color: #047857;">${recipientEmail}</strong>.<br />
    Lead ID: ${lead.id} &bull; Timestamp: ${lead.createdAt}
  </div>
</div>
`;

      // Check if we have credentials to do a real SMTP dispatch
      if (smtpUser && smtpPass && smtpPass.replace(/x/g, "").length > 0) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          await transporter.sendMail({
            from: `"Jack's Lead Dispatcher" <${smtpUser}>`,
            to: recipientEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml
          });

          emailSent = true;
          console.log(`[Email Success] Real lead notification email sent successfully to ${recipientEmail}`);
        } catch (err: any) {
          console.error("[Email Error] Failed to send real SMTP email:", err);
          emailError = err.message || "Unknown SMTP authentication error";
        }
      } else {
        console.log(`[Email Log - Local Debug/No SMTP config]
=========================================
TO: ${recipientEmail}
FROM: ${smtpUser}
SUBJECT: ${emailSubject}
-----------------------------------------
${emailText}
=========================================
Guidance: To send actual emails, please save your Gmail address and Google App Password (16 Letters) in the Settings -> Secrets or on the Admin Dashboard Notification page.`);
        emailError = "SMTP_PASS not configured. Email draft logged to developer console.";
      }

      res.status(201).json({
        success: true,
        message: "Lead successfully recorded on server.",
        emailSent,
        emailError,
        bookings
      });

    } catch (error: any) {
      console.error("Booking submission processing error:", error);
      res.status(500).json({ error: "Failed to submit booking on the server." });
    }
  });

  // API Route for admin status changes or deletions
  app.post("/api/bookings/save-all", async (req, res) => {
    try {
      const { leads } = req.body;
      if (!Array.isArray(leads)) {
        return res.status(400).json({ error: "Leads array expected." });
      }
      await saveConfig("bookings", leads);
      res.json({ success: true, leads });
    } catch (err: any) {
      console.error("Failed to save bookings list:", err);
      res.status(500).json({ error: "Failed to persist updated bookings on server." });
    }
  });

  // API Route to Load / Save Email Settings
  app.get("/api/email-config", async (req, res) => {
    try {
      const defaultMail = {
        recipientEmail: process.env.NOTIFICATION_RECIPIENT_EMAIL || "jacks.mowing.and.more1@gmail.com",
        smtpUser: process.env.SMTP_USER || "jacks.mowing.and.more1@gmail.com",
        smtpPass: process.env.SMTP_PASS ? "••••••••••••" : ""
      };
      const raw = await getConfig("email_config", defaultMail);
      const config = {
        recipientEmail: raw.recipientEmail || defaultMail.recipientEmail,
        smtpUser: raw.smtpUser || defaultMail.smtpUser,
        smtpPass: raw.smtpPass ? "••••••••••••" : ""
      };
      res.json(config);
    } catch (_) {
      res.status(500).json({ error: "Failed to retrieve configuration." });
    }
  });

  app.post("/api/email-config", async (req, res) => {
    try {
      const { recipientEmail, smtpUser, smtpPass } = req.body;
      
      const config = await getConfig("email_config", {});

      if (recipientEmail) config.recipientEmail = recipientEmail;
      if (smtpUser) config.smtpUser = smtpUser;
      
      // Only overwrite password if it's not the placeholder masked value
      if (smtpPass && smtpPass !== "••••••••••••") {
        config.smtpPass = smtpPass;
      }

      await saveConfig("email_config", config);
      res.json({ success: true, message: "Notification settings updated persistently on the server." });
    } catch (_) {
      res.status(500).json({ error: "Failed to write config." });
    }
  });

  // Diagnostic Test Route for SMTP Connection Verification
  app.post("/api/test-email", async (req, res) => {
    try {
      const { recipientEmail, smtpUser, smtpPass } = req.body;
      let passToUse = smtpPass;
      
      // If password was sent as mask, read it from existing config instead
      if (smtpPass === "••••••••••••") {
        const configPath = path.join(process.cwd(), "src", "data", "email_config.json");
        if (fs.existsSync(configPath)) {
          try {
            const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            passToUse = raw.smtpPass || "";
          } catch (_) {}
        }
      }

      if (!smtpUser || !passToUse) {
        return res.status(400).json({ error: "SMTP user address and App Password are required to run diagnostic tests." });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: passToUse
        }
      });

      await transporter.sendMail({
        from: `"Jack's App Test" <${smtpUser}>`,
        to: recipientEmail || smtpUser,
        subject: "🔔 SMTP Test Connection: Jack's Mowing & More",
        text: "Success! Your Gmail SMTP App Password has been paired securely and is online.",
        html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 24px; border: 1px solid #10b981; border-radius: 12px; font-size: 14px; line-height: 1.5; background-color: #fafaf9; text-align: center; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <h2 style="color: #047857; margin-top: 0; font-size: 20px;">🎉 SMTP Lead Dispatcher Configured!</h2>
          <p style="color: #4b5563;">Congratulations! This verified test dispatch confirms that your customized Google App Password is correct and capable of transmitting mail alerts securely.</p>
          <div style="margin: 20px 0; padding: 14px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 12px; font-family: monospace; text-align: left; color: #1f2937; line-height: 1.6;">
            <strong style="color: #047857;">Authenticated User:</strong> ${smtpUser}<br/>
            <strong style="color: #047857;">Lead Inbox Target Address:</strong> ${recipientEmail || smtpUser}<br/>
            <strong style="color: #047857;">Auth Handshake Status:</strong> Connected &amp; Authenticated
          </div>
          <p style="font-size: 11px; color: #6b7280; font-style: italic; margin-bottom: 0;">You can now sleep soundly knowing new landscape queries are forwarded directly to your device.</p>
        </div>`
      });

      res.json({ success: true, message: "SMTP connection established. Test email sent!" });
    } catch (error: any) {
      console.error("[Diagnostics Failed] smtp auth session failed:", error);
      res.status(500).json({ error: error.message || "Failed to establish a valid SMTP connection with Gmail." });
    }
  });

  // API Route for Fetching Persistent Reviews/Testimonials
  app.get("/api/reviews", async (req, res) => {
    try {
      const defaultReviews = [
        {
          id: 'test-1',
          author: 'Eleanor Vance',
          location: 'Milltown, NJ',
          rating: 5,
          projectType: 'Hardscape & Fire Pit Terrace',
          content: 'The level of masonry and attention to detail surpassed everything we hoped for. The team aligned the stone joint lines perfectly with our living room windows, making the transition outside feel absolutely natural. Outstanding team.',
          date: 'April 2026'
        },
        {
          id: 'test-2',
          author: 'Dr. Marcus Aris',
          location: 'Milltown, NJ',
          rating: 5,
          projectType: 'Horticulture & Front Border Walkway',
          content: 'They treated our soil like gold and replaced our dry clay with lush, organic planting beds. The custom boxwood layers and seasonal lavender flowers attract bees and look brilliant in the morning light.',
          date: 'May 2026'
        },
        {
          id: 'test-3',
          author: 'Clara & Thomas Vance',
          location: 'Milltown Resident',
          rating: 5,
          projectType: 'Soil Nutrition & Lawn Restoration',
          content: 'Our lawns were dry and moss-filled. Jack\'s crew aerated, topseeded with premium fescue grass, and set up a fertilization routine. Our backyard is now thick and emerald green. Unmatched dedication!',
          date: 'June 2026'
        },
        {
          id: 'test-4',
          author: 'Richard Finch',
          location: 'Milltown, NJ',
          rating: 5,
          projectType: 'Precision Lawn Mowing',
          content: 'I have used several lawn services before, but Jack\'s Mowing is on another level. Extremely crisp diagonal stripe lines, clean edges along the patio, and they blow every last blade of grass off my driveway.',
          date: 'May 2026'
        },
        {
          id: 'test-5',
          author: 'Sarah Jenkins',
          location: 'Milltown Property Owner',
          rating: 5,
          projectType: 'Outdoor LED Night Lighting',
          content: 'Excellent customer service and fantastic results. They custom designed some low-voltage LED garden lighting that makes our backyard walkway look incredibly elegant after sunset.',
          date: 'April 2026'
        }
      ];
      const reviews = await getConfig("reviews", defaultReviews);
      res.json(reviews);
    } catch (error: any) {
      console.error("Failed to read reviews database:", error);
      res.status(500).json({ error: "Failed to retrieve testimonials portfolio stats." });
    }
  });

  // API Route for Submitting a New Review (Saves persistently)
  app.post("/api/reviews", async (req, res) => {
    try {
      const { author, location, rating, projectType, content } = req.body;
      if (!author || !content) {
        return res.status(400).json({ error: "Author name and content reviews are mandatory." });
      }

      const defaultReviews = [
        {
          id: 'test-1',
          author: 'Eleanor Vance',
          location: 'Milltown, NJ',
          rating: 5,
          projectType: 'Hardscape & Fire Pit Terrace',
          content: 'The level of masonry and attention to detail surpassed everything we hoped for. The team aligned the stone joint lines perfectly with our living room windows, making the transition outside feel absolutely natural. Outstanding team.',
          date: 'April 2026'
        },
        {
          id: 'test-2',
          author: 'Dr. Marcus Aris',
          location: 'Milltown, NJ',
          rating: 5,
          projectType: 'Horticulture & Front Border Walkway',
          content: 'They treated our soil like gold and replaced our dry clay with lush, organic planting beds. The custom boxwood layers and seasonal lavender flowers attract bees and look brilliant in the morning light.',
          date: 'May 2026'
        },
        {
          id: 'test-3',
          author: 'Clara & Thomas Vance',
          location: 'Milltown Resident',
          rating: 5,
          projectType: 'Soil Nutrition & Lawn Restoration',
          content: 'Our lawns were dry and moss-filled. Jack\'s crew aerated, topseeded with premium fescue grass, and set up a fertilization routine. Our backyard is now thick and emerald green. Unmatched dedication!',
          date: 'June 2026'
        },
        {
          id: 'test-4',
          author: 'Richard Finch',
          location: 'Milltown, NJ',
          rating: 5,
          projectType: 'Precision Lawn Mowing',
          content: 'I have used several lawn services before, but Jack\'s Mowing is on another level. Extremely crisp diagonal stripe lines, clean edges along the patio, and they blow every last blade of grass off my driveway.',
          date: 'May 2026'
        },
        {
          id: 'test-5',
          author: 'Sarah Jenkins',
          location: 'Milltown Property Owner',
          rating: 5,
          projectType: 'Outdoor LED Night Lighting',
          content: 'Excellent customer service and fantastic results. They custom designed some low-voltage LED garden lighting that makes our backyard walkway look incredibly elegant after sunset.',
          date: 'April 2026'
        }
      ];

      const reviews = await getConfig("reviews", defaultReviews);

      const newReview = {
        id: `custom-test-${Date.now()}`,
        author: author,
        location: location || "Local Property Owner",
        rating: Number(rating) || 5,
        projectType: projectType || "Property Care",
        content: content,
        date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long' }),
        isGoogle: false
      };

      reviews.unshift(newReview);
      await saveConfig("reviews", reviews);
      res.status(201).json(reviews);
    } catch (error: any) {
      console.error("Failed to write to reviews database:", error);
      res.status(500).json({ error: "Failed to log review to persistent server-side files." });
    }
  });

  // API Route for Admin Testimonial updates or deletions
  app.post("/api/reviews/save-all", async (req, res) => {
    try {
      const { reviews } = req.body;
      if (!Array.isArray(reviews)) {
        return res.status(400).json({ error: "Reviews array expected." });
      }
      await saveConfig("reviews", reviews);
      res.json({ success: true, reviews });
    } catch (err: any) {
      console.error("Failed to save reviews list on server:", err);
      res.status(500).json({ error: "Failed to persist updated reviews on server." });
    }
  });

  // API Route for Fetching Persistent Service/Portfolio Visuals
  app.get("/api/visuals", async (req, res) => {
    try {
      const visuals = await getConfig("visuals", {});
      res.json(visuals);
    } catch (error: any) {
      console.error("Failed to read visuals database:", error);
      res.status(500).json({ error: "Failed to retrieve service portfolio pictures." });
    }
  });

  // API Route for Saving Persistent Service/Portfolio Visuals
  app.post("/api/visuals", async (req, res) => {
    try {
      const visuals = req.body;
      await saveConfig("visuals", visuals);
      res.json({ success: true, visuals });
    } catch (error: any) {
      console.error("Failed to save visuals to database:", error);
      res.status(500).json({ error: "Failed to persist service portfolio pictures on server disk." });
    }
  });

  // API Route for Fetching Persistent Cover Photo
  app.get("/api/cover-photo", async (req, res) => {
    try {
      const defaultCover = { coverPhoto: '/src/assets/images/landscape_hero_1779327295782.png' };
      const config = await getConfig("cover_photo", defaultCover);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to read cover photo database:", error);
      res.status(500).json({ error: "Failed to retrieve cover photo choice." });
    }
  });

  // API Route for Saving Persistent Cover Photo
  app.post("/api/cover-photo", async (req, res) => {
    try {
      const { coverPhoto } = req.body;
      await saveConfig("cover_photo", { coverPhoto });
      res.json({ success: true, coverPhoto });
    } catch (error: any) {
      console.error("Failed to save cover photo to database:", error);
      res.status(500).json({ error: "Failed to persist cover photo on server." });
    }
  });

  // API Route for Fetching Persistent Brand Logo Customizations
  app.get("/api/brand-logo", async (req, res) => {
    try {
      const defaultLogo = {
        logoType: "svg",
        imageUrl: "",
        svgTextTop: "Jack's",
        svgTextBottom: "Mowing & More",
        svgColor: "#dc2626"
      };
      const config = await getConfig("brand_logo", defaultLogo);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to read brand logo database:", error);
      res.status(500).json({ error: "Failed to retrieve brand logo configuration." });
    }
  });

  // API Route for Saving Persistent Brand Logo Customizations
  app.post("/api/brand-logo", async (req, res) => {
    try {
      const config = req.body;
      await saveConfig("brand_logo", config);
      res.json({ success: true, ...config });
    } catch (error: any) {
      console.error("Failed to save brand logo configuration database:", error);
      res.status(500).json({ error: "Failed to persist brand logo configuration." });
    }
  });

  // API Route for Fetching Persistent Header/Footer Contact Information
  app.get("/api/contact-info", async (req, res) => {
    try {
      const defaultContact = {
        phone: "+1 (732) 790-9789",
        phoneRaw: "1-732-790-9789",
        email: "estimates@jacksmowing.com",
        location: "Milltown, NJ",
        description: "Architectural landscape design, precision lawn mowing, lawn recovery, and custom stonemasonry. Serving Milltown with pride and premium cleanup."
      };
      const config = await getConfig("contact_info", defaultContact);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to read contact info database:", error);
      res.status(500).json({ error: "Failed to retrieve contact info choice." });
    }
  });

  // API Route for Saving Persistent Header/Footer Contact Information
  app.post("/api/contact-info", async (req, res) => {
    try {
      const config = req.body;
      await saveConfig("contact_info", config);
      res.json({ success: true, ...config });
    } catch (error: any) {
      console.error("Failed to save contact info database:", error);
      res.status(500).json({ error: "Failed to persist contact info modifications." });
    }
  });

  // API Route for Fetching Persistent Interactive Portfolio Slider Config
  app.get("/api/portfolio-slider", async (req, res) => {
    try {
      const defaultSlider = {
        beforeImg: "/src/assets/images/garden_beds_1779327341663.png",
        beforeLabel: "Dry Weedy Clay Lot (Before)",
        afterImg: "/src/assets/images/garden_beds_1779327341663.png",
        afterLabel: "Lined Botanical Walkway (After)"
      };
      const config = await getConfig("portfolio_slider", defaultSlider);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to read portfolio slider database:", error);
      res.status(500).json({ error: "Failed to retrieve portfolio slider settings." });
    }
  });

  // API Route for Saving Persistent Interactive Portfolio Slider Config
  app.post("/api/portfolio-slider", async (req, res) => {
    try {
      const config = req.body;
      await saveConfig("portfolio_slider", config);
      res.json({ success: true, ...config });
    } catch (error: any) {
      console.error("Failed to save portfolio slider database:", error);
      res.status(500).json({ error: "Failed to persist portfolio slider settings." });
    }
  });

  // API Route for Fetching Persistent Service Card Grid Images
  app.get("/api/service-card-images", async (req, res) => {
    try {
      const defaultCardImages = {
        'service-l-mowing': '/src/assets/images/lawn_mowing_after_1779586183040.png',
        'service-l-cleanup': 'https://images.unsplash.com/photo-1534710951274-1851d3061271?auto=format&fit=crop&q=80&w=800',
        'service-l-landscape': 'https://images.unsplash.com/photo-1558904541-efa8c1a68fa6?auto=format&fit=crop&q=80&w=800',
        'service-l-hedge': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
        'service-l-mulch': 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=800',
        'service-l-weed': 'https://images.unsplash.com/photo-1507036066871-b708937449ab?auto=format&fit=crop&q=80&w=800',
        'service-l-fertilizer': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=800',
        'service-l-restoration': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&q=80&w=800'
      };
      const config = await getConfig("service_card_images", defaultCardImages);
      res.json(config);
    } catch (error: any) {
      console.error("Failed to read service card images database:", error);
      res.status(500).json({ error: "Failed to retrieve service card images." });
    }
  });

  // API Route for Saving Persistent Service Card Grid Images
  app.post("/api/service-card-images", async (req, res) => {
    try {
      const config = req.body;
      await saveConfig("service_card_images", config);
      res.json({ success: true, config });
    } catch (error: any) {
      console.error("Failed to save service card images database:", error);
      res.status(500).json({ error: "Failed to persist service card images." });
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
  app.post("/api/upload-image", async (req, res) => {
    try {
      const { base64, fileName } = req.body;
      if (!base64 || !fileName) {
        return res.status(400).json({ error: "Image base64 data and fileName are required." });
      }

      // Detect and strip standard Base64 URI prefixes (e.g. data:image/jpeg;base64,...)
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64Data = base64;
      let mimeType = "image/jpeg";
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const safeSuffix = Date.now() + "_" + Math.floor(Math.random() * 1000);
      const cleanedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const safeFileName = `uploaded_${safeSuffix}_${cleanedFileName}`;
      
      // Save locally as a secondary backup/fallback lane
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const destPath = path.join(uploadsDir, safeFileName);
      fs.writeFileSync(destPath, buffer);

      let imageUrl = `/uploads/${safeFileName}`;

      // Upload directly to Firebase Storage bucket in production mode
      if (storageBucket && firebaseConfig && firebaseConfig.storageBucket) {
        try {
          const fileRef = ref(storageBucket, `uploads/${safeFileName}`);
          const uploadResult = await uploadBytes(fileRef, buffer, {
            contentType: mimeType,
          });
          imageUrl = await getDownloadURL(uploadResult.ref);
          console.log(`📡 Clean copy backed up to Firebase Storage bucket at ${imageUrl}`);
        } catch (stErr: any) {
          console.warn("⚠️ Firebase Storage bucket write failed, utilizing local file fallback URL:", stErr.message || stErr);
        }
      }

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
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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
