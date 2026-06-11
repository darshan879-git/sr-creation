require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/inquiries', require('./routes/inquiries'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/admins',    require('./routes/admins'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Admin SPA
app.get('/admin*', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/index.html')));
// Public website
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/website/index.html')));

app.listen(PORT, () => console.log(`✅ SR Creation running on port ${PORT}`));
