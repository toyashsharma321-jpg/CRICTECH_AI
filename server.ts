import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { ALL_PLAYERS } from "./src/data/players.ts";
import { TOURNAMENTS } from "./src/data/tournaments.ts";
import { TEAMS } from "./src/data/teams.ts";
import { MATCHES } from "./src/data/matches.ts";

// Initialize Firebase Admin
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const firebaseDb = getFirestore(firebaseConfig.firestoreDatabaseId);

import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // Middleware to verify Firebase ID Token
  const authenticateToken = async (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Error verifying Firebase token:", error);
      return res.status(403).json({ error: "Forbidden" });
    }
  };

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json(req.user);
  });

  // WebSocket Tracking
  io.on("connection", (socket) => {
    console.log("Client connected for live tracking:", socket.id);
    
    socket.on("disconnect", () => {
      console.log("Client disconnected.");
    });
  });

  // API Routes
  app.get("/api/results", (req, res) => {
    // Generate realistic mock data
    const deliveries = Array.from({ length: 12 }, (_, i) => ({
      id: `ball_${i + 1}`,
      startTime: i * 10,
      timestamp: Date.now() - (12 - i) * 60000,
      speed: Math.floor(Math.random() * (150 - 120) + 120),
      type: ['Short', 'Full', 'Yorker', 'Good Length'][Math.floor(Math.random() * 4)],
      outcome: ['Dot', 'Single', 'Four', 'Six', 'Wicket'][Math.floor(Math.random() * 5)],
      trajectory: Array.from({ length: 10 }, (_, j) => ({
        x: j * 10,
        y: 50 + Math.sin(j * 0.5) * 20 + (i % 2 === 0 ? -10 : 10)
      })),
      trajectory3D: Array.from({ length: 20 }, (_, j) => ({
        x: (j - 10) * 2, // From bowler to batsman
        y: Math.max(0.1, 2 - Math.pow(j - 10, 2) * 0.02), // Parabolic arc
        z: (Math.random() * 0.5 - 0.25) // Slight swing/spin
      })),
      bouncePoint: { x: 45 + Math.random() * 10, y: 60 + Math.random() * 10 },
      hitPoint: { x: 85 + Math.random() * 5, y: 40 + Math.random() * 10 },
      isWide: Math.random() > 0.9,
      isNoBall: Math.random() > 0.95,
      movement: { 
        swing: (Math.random() * 2 - 1).toFixed(2), 
        spin: (Math.random() * 2 - 1).toFixed(2) 
      },
      events: {
        release: 0.5,
        bounce: 1.2,
        impact: 1.8
      },
      batsmanAnalysis: {
        style: i % 2 === 0 ? "Aggressive" : "Defensive",
        shotType: ['Front Foot', 'Back Foot', 'Step Out'][Math.floor(Math.random() * 3)],
        goodShotArea: "Cover Drive / Mid-wicket",
        hittingArea: "V-Region",
        weakArea: "Short-pitched outside off"
      },
      batsman: {
        id: ALL_PLAYERS[i % ALL_PLAYERS.length].id,
        name: ALL_PLAYERS[i % ALL_PLAYERS.length].name,
        img: ALL_PLAYERS[i % ALL_PLAYERS.length].img
      }
    }));

    const avgSpeed = Math.round(deliveries.reduce((acc, d) => acc + d.speed, 0) / deliveries.length);
    const topSpeed = Math.max(...deliveries.map(d => d.speed));

    const results = {
      deliveries,
      summary: {
        totalDeliveries: deliveries.length,
        avgSpeed,
        topSpeed,
        weakness: "Short ball outside off-stump",
        insights: [
          "Struggles against short balls aimed at the body.",
          "Late reaction to outswinging deliveries.",
          "High success rate against full-length deliveries (85% boundary rate)."
        ],
        overCount: Math.floor(deliveries.length / 6),
        currentOverBalls: deliveries.length % 6
      }
    };

    res.json(results);
  });

  app.get("/api/players", (req, res) => {
    res.json(ALL_PLAYERS);
  });

  app.get("/api/players/:id", (req, res) => {
    const player = ALL_PLAYERS.find(p => p.id === req.params.id);
    if (player) {
      res.json(player);
    } else {
      res.status(404).json({ error: "Player not found" });
    }
  });

  app.get("/api/tournaments", (req, res) => {
    res.json(TOURNAMENTS);
  });

  app.get("/api/tournaments/:id", (req, res) => {
    const tournament = TOURNAMENTS.find(t => t.id === req.params.id);
    if (tournament) {
      res.json(tournament);
    } else {
      res.status(404).json({ error: "Tournament not found" });
    }
  });

  app.get("/api/teams", (req, res) => {
    res.json(TEAMS);
  });

  app.get("/api/teams/:id", (req, res) => {
    const team = TEAMS.find(t => t.id === req.params.id);
    if (team) {
      res.json(team);
    } else {
      res.status(404).json({ error: "Team not found" });
    }
  });

  app.get("/api/matches", (req, res) => {
    res.json(MATCHES);
  });

  app.get("/api/matches/:id", (req, res) => {
    const match = MATCHES.find(m => m.id === req.params.id);
    if (match) {
      res.json(match);
    } else {
      res.status(404).json({ error: "Match not found" });
    }
  });

  // Catch-all for API routes to prevent falling through to SPA index.html
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
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

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
