const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, nextId, now } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const admins = db.get('admins').value().map(({ password, ...a }) => a);
  res.json(admins);
});

router.post('/', auth, (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ error: 'Only superadmin can add users' });
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });
  if (db.get('admins').find({ email }).value()) return res.status(400).json({ error: 'Email already exists' });
  const id = nextId('admins');
  db.get('admins').push({ id, name, email, password: bcrypt.hashSync(password, 10), role: role||'admin', created_at: now() }).write();
  res.status(201).json({ id });
});

router.put('/:id', auth, (req, res) => {
  if (req.admin.role !== 'superadmin' && req.admin.id !== +req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const { name, email, role } = req.body;
  const update = {};
  if (name) update.name = name;
  if (email) update.email = email;
  if (role && req.admin.role === 'superadmin') update.role = role;
  db.get('admins').find({ id: +req.params.id }).assign(update).write();
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth, (req, res) => {
  if (req.admin.role !== 'superadmin') return res.status(403).json({ error: 'Only superadmin can delete users' });
  if (req.admin.id === +req.params.id) return res.status(400).json({ error: 'Cannot delete yourself' });
  db.get('admins').remove({ id: +req.params.id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
