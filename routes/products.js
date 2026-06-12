const express = require('express');
const router = express.Router();
const { db, nextId, now } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let items = db.get('products').filter({ status: 'active' }).value();
  if (category) items = items.filter(p => p.category === category);
  if (search) { const s = search.toLowerCase(); items = items.filter(p => p.name.toLowerCase().includes(s) || (p.description||'').toLowerCase().includes(s)); }
  res.json(items);
});

router.get('/all', auth, (req, res) => {
  let items = db.get('products').value();
  const { category, search } = req.query;
  if (category) items = items.filter(p => p.category === category);
  if (search) { const s = search.toLowerCase(); items = items.filter(p => p.name.toLowerCase().includes(s)); }
  res.json(items);
});

router.get('/:id', (req, res) => {
  const item = db.get('products').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', auth, (req, res) => {
  const { name, category, description, fabric, moq, price_per_unit, stock_available, image_url } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
  const id = nextId('products');
  db.get('products').push({ id, name, category, description: description||'', fabric: fabric||'', moq: +(moq||50), price_per_unit: +(price_per_unit||0), stock_available: +(stock_available||0), image_url: image_url||'', status: 'active', created_at: now(), updated_at: now() }).write();
  res.status(201).json({ id });
});

router.put('/:id', auth, (req, res) => {
  const item = db.get('products').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const fields = ['name','category','description','fabric','moq','price_per_unit','stock_available','status','image_url'];
  const update = { updated_at: now() };
  fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
  db.get('products').find({ id: +req.params.id }).assign(update).write();
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth, (req, res) => {
  db.get('products').find({ id: +req.params.id }).assign({ status: 'inactive', updated_at: now() }).write();
  res.json({ message: 'Deactivated' });
});

module.exports = router;
