import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const DB_FILE = path.join(process.cwd(), "school-db.json");

// Helper to load backend state
function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    } catch (e) {
      console.error("Error reading database file, using default", e);
    }
  }
  return null;
}

// Helper to save backend state
function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing database file", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/school-data", (req, res) => {
    const db = loadDatabase();
    res.json({ status: "success", data: db });
  });

  app.post("/api/school-data", (req, res) => {
    const data = req.body;
    saveDatabase(data);
    res.json({ status: "success" });
  });

  // AI Student grading evaluation endpoint
  app.post("/api/ai/analyze-report", async (req, res) => {
    const { studentName, gradeLevel, gradesList } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY is not defined. Please add it in Settings > Secrets." 
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `
        You are the academic dean and chief counselor at Edweso Royal Academy in Ghana.
        Analyze the terminal report card for student "${studentName}" (Grade: ${gradeLevel}) who just completed the term.
        
        Here is their academic records (Subject, Class Score /30, Exam Score /70, Total Score %, Grade, Remarks):
        ${JSON.stringify(gradesList, null, 2)}
        
        Please write a professional, highly encouraging, and structured academic study roadmap and feedback.
        Your response must be in clean Markdown formatting:
        
        - Provide a warm "Overall Academic Performance Summary".
        - Give structured recommendations on "Key Subject Strengths & Focus Areas".
        - Detail "At-Home Academic Preparation Steps" for parent-student holiday collaboration.
        
        Close with the school's core motto: "KNOWLEDGE • DISCIPLINE • EXCELLENCE". Keep the analysis insightful, positive, and focused on helping the student succeed!
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const resultText = response.text || "Unable to generate study recommendations at this time.";
      res.json({ status: "success", feedback: resultText });
    } catch (e: any) {
      console.error("Gemini API error:", e);
      res.status(500).json({ error: e.message || "An error occurred calling Gemini API" });
    }
  });

  // Vite middleware integration
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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
