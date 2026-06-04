import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { rankMatches, calculateMatchCompatibility } from './matchingAlgo.js';
import { generateMatchExplanation, generateIntroEmail } from './aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

// Database Helpers
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { matchmakers: [], customers: [], pool: [], matches: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Auth Routes ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDb();
  
  const matchmaker = db.matchmakers.find(
    (m) => m.username === username && m.password === password
  );

  if (matchmaker) {
    res.json({
      success: true,
      token: `token-matchmaker-${matchmaker.id}`,
      matchmaker: {
        id: matchmaker.id,
        name: matchmaker.name,
        username: matchmaker.username
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// --- Customer Routes ---
// Get all assigned customers
app.get('/api/customers', (req, res) => {
  const db = readDb();
  res.json({ success: true, customers: db.customers });
});

// Get a single customer by ID
app.get('/api/customers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const customer = db.customers.find((c) => c.id === id);

  if (customer) {
    res.json({ success: true, customer });
  } else {
    res.status(404).json({ success: false, message: 'Customer not found' });
  }
});

// Update customer status
app.post('/api/customers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = readDb();
  
  const customerIndex = db.customers.findIndex((c) => c.id === id);
  if (customerIndex !== -1) {
    db.customers[customerIndex].status = status;
    writeDb(db);
    res.json({ success: true, customer: db.customers[customerIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Customer not found' });
  }
});

// Add a note to customer
app.post('/api/customers/:id/notes', (req, res) => {
  const { id } = req.params;
  const { text, author } = req.body;
  const db = readDb();

  const customerIndex = db.customers.findIndex((c) => c.id === id);
  if (customerIndex !== -1) {
    const newNote = {
      id: `n_${Date.now()}`,
      date: new Date().toISOString(),
      author: author || 'Simran Alag',
      text
    };

    if (!db.customers[customerIndex].notes) {
      db.customers[customerIndex].notes = [];
    }
    db.customers[customerIndex].notes.unshift(newNote);
    writeDb(db);
    res.json({ success: true, note: newNote, customer: db.customers[customerIndex] });
  } else {
    res.status(404).json({ success: false, message: 'Customer not found' });
  }
});

// --- Matchmaking Engine Routes ---
// Get ranked matches for a customer
app.get('/api/customers/:id/matches', (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const customer = db.customers.find((c) => c.id === id);

  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  // Filter pool based on opposite gender
  const oppositeGender = customer.gender === 'Male' ? 'Female' : 'Male';
  const matchPool = db.pool.filter((p) => p.gender === oppositeGender);

  // Run the algorithm to score and rank
  const ranked = rankMatches(customer, matchPool);
  
  res.json({ success: true, matches: ranked });
});

// --- AI Service Routes ---
// Generate AI match explanation
app.post('/api/ai/scoring-explanation', async (req, res) => {
  const { customerId, matchId } = req.body;
  const db = readDb();

  const customer = db.customers.find((c) => c.id === customerId);
  const match = db.pool.find((p) => p.id === matchId);

  if (!customer || !match) {
    return res.status(404).json({ success: false, message: 'Customer or Match profile not found' });
  }

  const compData = calculateMatchCompatibility(customer, match);
  if (!compData) {
    return res.status(400).json({ success: false, message: 'Profiles are not eligible for matchmaking (same gender)' });
  }

  try {
    const explanation = await generateMatchExplanation(customer, match, compData);
    res.json({ success: true, explanation });
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI match explanation' });
  }
});

// Generate AI intro email
app.post('/api/ai/email-intro', async (req, res) => {
  const { customerId, matchId } = req.body;
  const db = readDb();

  const customer = db.customers.find((c) => c.id === customerId);
  const match = db.pool.find((p) => p.id === matchId);

  if (!customer || !match) {
    return res.status(404).json({ success: false, message: 'Customer or Match profile not found' });
  }

  const compData = calculateMatchCompatibility(customer, match);
  if (!compData) {
    return res.status(400).json({ success: false, message: 'Profiles are not eligible for matchmaking' });
  }

  try {
    const emailText = await generateIntroEmail(customer, match, compData);
    res.json({ success: true, emailText });
  } catch (error) {
    console.error('Error generating AI intro email:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI intro email' });
  }
});

// Send Match (Mock Action)
app.post('/api/matches/send', async (req, res) => {
  const { customerId, matchId, emailContent } = req.body;
  const db = readDb();

  const customer = db.customers.find((c) => c.id === customerId);
  const match = db.pool.find((p) => p.id === matchId);

  if (!customer || !match) {
    return res.status(404).json({ success: false, message: 'Customer or Match profile not found' });
  }

  // Create match activity log
  const newMatchEvent = {
    id: `m_${Date.now()}`,
    customerId,
    matchId,
    sentDate: new Date().toISOString(),
    matchDetails: {
      firstName: match.firstName,
      lastName: match.lastName,
      age: match.age,
      city: match.city,
      designation: match.career.designation
    },
    emailContent
  };

  // Add event to active database
  if (!db.matches) {
    db.matches = [];
  }
  db.matches.unshift(newMatchEvent);

  // Update customer's status to "Matching" or "Match Sent"
  const customerIndex = db.customers.findIndex((c) => c.id === customerId);
  if (customerIndex !== -1) {
    db.customers[customerIndex].status = 'Matching';
    
    // Add a timeline note
    const autoNote = {
      id: `n_auto_${Date.now()}`,
      date: new Date().toISOString(),
      author: 'System',
      text: `Recommended match profile for ${match.firstName} ${match.lastName} (${match.career.designation} from ${match.city}) was sent to the client.`
    };
    db.customers[customerIndex].notes.unshift(autoNote);
  }

  writeDb(db);

  res.json({
    success: true,
    message: `Match sent successfully! Notification queued for ${customer.firstName}.`,
    matchEvent: newMatchEvent
  });
});

// Get sent matches history
app.get('/api/matches/history', (req, res) => {
  const db = readDb();
  res.json({ success: true, history: db.matches || [] });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`VowsAI Backend Server is running on http://localhost:${PORT}`);
  console.log(`Seeded mock data is loaded.`);
  console.log(`==================================================`);
});
