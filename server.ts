import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

dotenv.config();

const DB_FILE = path.join(process.cwd(), "school-db.json");

// Initialize Firebase SDK using the provisioned client configuration
let firestoreDb: any = null;

try {
  const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    
    if (config.firestoreDatabaseId) {
      firestoreDb = getFirestore(app, config.firestoreDatabaseId);
    } else {
      firestoreDb = getFirestore(app);
    }
    console.log("Firebase initialized successfully in server.ts");
  }
} catch (e) {
  console.error("Failed to initialize Firebase in server.ts:", e);
}

// Helper to load local fallback backend state
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

// Helper to save local fallback backend state
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

  // API Routes with real-time Cloud Firestore integration
  app.get("/api/school-data", async (req, res) => {
    let db = null;
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, "school_data", "master_record");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          db = docSnap.data();
          console.log("Database successfully loaded from Firestore!");
        } else {
          console.log("No master_record found in Firestore. Seeding database from fallback file...");
        }
      } catch (err) {
        console.error("Error loading database from Firestore:", err);
      }
    }
    
    if (!db) {
      db = loadDatabase();
    }
    
    res.json({ status: "success", data: db });
  });

  app.post("/api/school-data", async (req, res) => {
    const data = req.body;
    
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, "school_data", "master_record");
        await setDoc(docRef, data);
        console.log("Database successfully saved to Firestore!");
      } catch (err) {
        console.error("Error saving database to Firestore:", err);
      }
    }
    
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

  // AI Syllabus Plan Generator endpoint
  app.post("/api/ai/generate-syllabus", async (req, res) => {
    const { subjectName, topicTitle } = req.body;
    
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
        You are an expert curriculum designer and academic coordinator in Ghana, aligned with the Ghana Education Service (GES) and West African Examinations Council (WAEC) standards.
        Create a detailed, appropriate weekly learning plan for the subject "${subjectName}" under the topic: "${topicTitle}".
        
        Generate:
        1. A set of 3-5 clear, bulleted learning objectives tailored for Ghanaian students.
        2. A set of 2-3 specific study material filenames or resource titles (e.g., "wk_study_guide_${topicTitle.replace(/\s+/g, '_').toLowerCase()}.pdf", "WAEC Exam Revision Sheet").

        Your response MUST be a valid JSON object matching this schema:
        {
          "learningObjectives": ["string"],
          "resources": ["string"]
        }
        
        Respond only with the raw JSON object, without any Markdown backticks or prefix blocks.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText.trim());
      res.json({ status: "success", data: parsed });
    } catch (e: any) {
      console.error("Gemini syllabus API error:", e);
      res.status(500).json({ error: e.message || "An error occurred calling Gemini API" });
    }
  });

  // AI Homework Hint Generator endpoint
  app.post("/api/ai/homework-hint", async (req, res) => {
    const { subjectName, assignmentTitle, assignmentDescription } = req.body;
    
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
        You are a highly supportive and engaging academic tutor at Edweso Royal Academy in Ghana.
        A student is working on their homework assignment for "${subjectName}".
        
        Assignment Title: "${assignmentTitle}"
        Assignment Description: "${assignmentDescription}"

        Please write a brief, encouraging, and structured homework hint or core concept guide.
        - DO NOT solve the entire homework or give the final direct answer.
        - Explain the fundamental scientific or mathematical formula or analytical framework needed.
        - Outline 2-3 structured steps the student can take to solve it on their own.
        
        Keep your advice positive, simple, clear, and extremely pedagogical for junior high school students.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const resultText = response.text || "Keep reviewing your textbooks. You've got this!";
      res.json({ status: "success", hint: resultText });
    } catch (e: any) {
      console.error("Gemini homework API error:", e);
      res.status(500).json({ error: e.message || "An error occurred calling Gemini API" });
    }
  });

  // AI Homework Evaluator / Grading Assistant endpoint
  app.post("/api/ai/evaluate-homework", async (req, res) => {
    const { assignmentTitle, assignmentDescription, studentName, submissionText, maxScore } = req.body;
    
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
        You are a supportive, high-standards senior teacher at Edweso Royal Academy in Ghana.
        Evaluate the student submission for this JHS homework:
        
        Assignment Title: "${assignmentTitle}"
        Assignment Description: "${assignmentDescription}"
        Student Name: "${studentName}"
        Student Submission Text: "${submissionText}"
        Maximum Score: ${maxScore}

        Please analyze the student's answer thoroughly and provide:
        1. A suggested grade score (a number between 0 and ${maxScore}).
        2. Constructive, encouraging, and detailed feedback written in a warm Ghanaian style (highly supportive, pointing out strengths and specific areas to improve, using terms like "Well done", "Keep it up", "Excellent proof").

        Your response MUST be a valid JSON object matching this schema exactly:
        {
          "suggestedScore": number,
          "feedbackDraft": "string"
        }
        
        Respond only with the raw JSON object, without any Markdown backticks or prefix blocks.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const resultText = response.text || "{}";
      const parsed = JSON.parse(resultText.trim());
      res.json({ status: "success", data: parsed });
    } catch (e: any) {
      console.error("Gemini homework grading API error:", e);
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
