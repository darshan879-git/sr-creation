const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, now } = require('../db/database');
const auth = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'srcreation_secret_2025';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const admin = db.get('admins').find({ email }).value();
  if (!admin || !bcrypt.compareSync(password, admin.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: admin.id, email: admin.email, name: admin.name, role: admin.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
});

router.get('/me', auth, (req, res) => {
  const admin = db.get('admins').find({ id: req.admin.id }).value();
  if (!admin) return res.status(404).json({ error: 'Not found' });
  const { password, ...safe } = admin;
  res.json(safe);
});

router.put('/change-password', auth, (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = db.get('admins').find({ id: req.admin.id }).value();
  if (!bcrypt.compareSync(current_password, admin.password)) return res.status(400).json({ error: 'Current password incorrect' });
  db.get('admins').find({ id: req.admin.id }).assign({ password: bcrypt.hashSync(new_password, 10) }).write();
  res.json({ message: 'Password changed successfully' });
});

module.exports = router;
