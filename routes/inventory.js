const express = require('express');
const router = express.Router();
const { db, nextId, now } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const { low_stock, search } = req.query;
  let items = db.get('inventory').value();
  if (low_stock === 'true') items = items.filter(i => i.quantity_available <= i.minimum_stock);
  if (search) { const s = search.toLowerCase(); items = items.filter(i => i.material_name.toLowerCase().includes(s) || (i.supplier||'').toLowerCase().includes(s)); }
  items = [...items].sort((a, b) => a.material_name.localeCompare(b.material_name));
  res.json(items);
});

router.get('/:id', auth, (req, res) => {
  const item = db.get('inventory').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', auth, (req, res) => {
  const { material_name, category, unit, quantity_available, minimum_stock, supplier, cost_per_unit } = req.body;
  if (!material_name || !category) return res.status(400).json({ error: 'Material name and category required' });
  const id = nextId('inventory');
  db.get('inventory').push({ id, material_name, category, unit: unit||'meters', quantity_available: +(quantity_available||0), minimum_stock: +(minimum_stock||100), supplier: supplier||'', cost_per_unit: +(cost_per_unit||0), last_restocked: now(), created_at: now(), updated_at: now() }).write();
  res.status(201).json({ id });
});

router.put('/:id', auth, (req, res) => {
  const item = db.get('inventory').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const fields = ['material_name','category','unit','quantity_available','minimum_stock','supplier','cost_per_unit'];
  const update = { updated_at: now() };
  fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
  if (req.body.quantity_available !== undefined) update.last_restocked = now();
  db.get('inventory').find({ id: +req.params.id }).assign(update).write();
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth, (req, res) => {
  db.get('inventory').remove({ id: +req.params.id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
