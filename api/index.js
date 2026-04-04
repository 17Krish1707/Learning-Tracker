// api/index.js — Vercel serverless entry point
const path = require('path');

// MUST load env vars before requiring server.js, because server.js
// imports controllers/models that read process.env at module load time.
// Use absolute path so dotenv finds the file regardless of cwd in serverless env.
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

module.exports = require('../backend/server.js');