import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3001;
const KNOWLEDGE_FILE = path.join(process.cwd(), 'knowledge.json');

app.use(cors());
app.use(express.json());

// Load Knowledge
const getKnowledge = () => {
  try {
    return JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
};

// Save Knowledge
const saveKnowledge = (data) => {
  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(data, null, 2));
};

// Learning Endpoint
app.post('/api/learn', (req, res) => {
  const { trigger, response } = req.body;
  const knowledge = getKnowledge();
  knowledge[trigger.toLowerCase()] = response;
  saveKnowledge(knowledge);
  res.json({ message: `I have learned that ${trigger} is ${response}.` });
});

// Asking Endpoint with Neural Search
app.get('/api/ask', (req, res) => {
  const { query } = req.query;
  const knowledge = getKnowledge();
  const lowerQuery = query.toLowerCase();

  // Try exact match first
  if (knowledge[lowerQuery]) {
    return res.json({ response: knowledge[lowerQuery] });
  }

  // Try partial match (fuzzy search)
  for (const [key, value] of Object.entries(knowledge)) {
    if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
      return res.json({ response: value });
    }
  }

  res.json({ response: null });
});

// Open Apps on Windows
app.post('/api/open', (req, res) => {
  const { appName } = req.body;
  let command = '';
  
  const apps = {
    'chrome': 'start chrome',
    'notepad': 'start notepad',
    'code': 'code',
    'calculator': 'calc',
    'explorer': 'explorer .'
  };

  command = apps[appName.toLowerCase()] || `start ${appName}`;
  
  exec(command, (err) => {
    if (err) return res.status(500).json({ error: `Could not open ${appName}` });
    res.json({ message: `Opening ${appName}` });
  });
});

// Search functionality
app.get('/api/search', (req, res) => {
  const { query } = req.query;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  exec(`start ${url}`); // Windows command to open URL in default browser
  res.json({ message: `Searching for ${query}` });
});

// File Management
app.get('/api/files', (req, res) => {
  const dir = process.cwd();
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Could not read directory' });
    res.json({ files });
  });
});

app.listen(port, () => {
  console.log(`Jarvis Backend Bridge running at http://localhost:${port}`);
});
