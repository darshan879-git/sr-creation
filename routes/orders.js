const express = require('express');
const router = express.Router();
const { db, nextId, now } = require('../db/database');
const auth = require('../middleware/auth');

function genOrderNum() {
  const y = new Date().getFullYear();
  const c = (db.get('orders').value().length + 1);
  return `SRC-${y}-${String(c).padStart(3,'0')}`;
}

router.get('/', auth, (req, res) => {
  const { status, payment_status, search } = req.query;
  let items = db.get('orders').value();
  if (status) items = items.filter(o => o.status === status);
  if (payment_status) items = items.filter(o => o.payment_status === payment_status);
  if (search) { const s = search.toLowerCase(); items = items.filter(o => o.client_name.toLowerCase().includes(s) || (o.client_company||'').toLowerCase().includes(s) || o.order_number.toLowerCase().includes(s)); }
  items = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ orders: items, total: items.length });
});

router.get('/:id', auth, (req, res) => {
  const item = db.get('orders').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', auth, (req, res) => {
  const { client_name, client_company, client_phone, client_email, product_id, product_name, category, quantity, price_per_unit, fabric, special_instructions, delivery_date } = req.body;
  if (!client_name || !client_phone || !product_name || !category || !quantity) return res.status(400).json({ error: 'Required fields missing' });
  const id = nextId('orders');
  const total_amount = (price_per_unit || 0) * quantity;
  const order_number = genOrderNum();
  db.get('orders').push({ id, order_number, client_name, client_company: client_company||'', client_phone, client_email: client_email||'', product_id: product_id||null, product_name, category, quantity: +quantity, price_per_unit: +(price_per_unit||0), total_amount, fabric: fabric||'', special_instructions: special_instructions||'', status: 'pending', payment_status: 'unpaid', delivery_date: delivery_date||null, created_at: now(), updated_at: now() }).write();
  res.status(201).json({ id, order_number });
});

router.put('/:id', auth, (req, res) => {
  const item = db.get('orders').find({ id: +req.params.id }).value();
  if (!item) return res.status(404).json({ error: 'Not found' });
  const fields = ['client_name','client_company','client_phone','client_email','product_name','category','quantity','price_per_unit','total_amount','fabric','special_instructions','status','payment_status','delivery_date'];
  const update = { updated_at: now() };
  fields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });
  if (update.quantity && update.price_per_unit) update.total_amount = +update.quantity * +update.price_per_unit;
  db.get('orders').find({ id: +req.params.id }).assign(update).write();
  res.json({ message: 'Updated' });
});

router.delete('/:id', auth, (req, res) => {
  db.get('orders').remove({ id: +req.params.id }).write();
  res.json({ message: 'Deleted' });
});

module.exports = router;
