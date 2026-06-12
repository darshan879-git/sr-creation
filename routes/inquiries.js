const express = require('express');
const router = express.Router();
const { db, nextId, now } = require('../db/database');
const auth = require('../middleware/auth');

router.post('/public', (req, res) => {
  const { name, company, phone, email, category, message } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });
  const id = nextId('inquiries');
  db.get('inquiries').push({ id, name, company: company||'', phone, email: email||'', category: category||'', message: message||'', status: 'new', notes: '', assigned_to: null, created_at: now(), updated_at: now() }).write();
  res.status(201).json({ message: 'Inquiry submitted successfully', id });
});

router.get('/', auth, (req, res) => {
  const { status, search } = req.query;
  let items = db.get('inquiries').value();
  if (status) items = items.filter(i => i.status === status);
  if (search) { const s = search.toLowerCase(); items = items.filter(i => i.name.toLowerCase().includes(s) || (i.company||'').toLowerCase().includes(s) || i.phone.includes(s)); }
  items = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ inquiries: items, total: items.length });
});

router.get('/:id', auth, (req, res) => {
  const item = db.get('inquiries').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.put('/:id', auth, (req, res) => {
  const item = db.get('inquiries').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const { status, notes, assigned_to } = req.body;
  const update = { updated_at: now() };
  if (status !== undefined) update.status = status;
  if (notes !== undefined) update.notes = notes;
  if (assigned_to !== undefined) update.assigned_to = assigned_to;
  db.get('inquiries').find({ id: +req.params.id }).assign(update).write();
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth, (req, res) => {
  db.get('inquiries').remove({ id: +req.params.id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
