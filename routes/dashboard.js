const express = require('express');
const router = express.Router();
const { db } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/stats', auth, (req, res) => {
  const orders = db.get('orders').value();
  const inquiries = db.get('inquiries').value();
  const inventory = db.get('inventory').value();
  const products = db.get('products').value();

  const totalRevenue = orders.filter(o => o.payment_status !== 'unpaid').reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingRevenue = orders.filter(o => o.payment_status === 'unpaid').reduce((s, o) => s + (o.total_amount || 0), 0);
  const lowStock = inventory.filter(i => i.quantity_available <= i.minimum_stock).length;

  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const recentInquiries = [...inquiries].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
  const ordersByStatus = ['pending','in_production','completed','cancelled'].map(s => ({ status: s, count: orders.filter(o => o.status === s).length }));

  res.json({
    orders: {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      in_production: orders.filter(o => o.status === 'in_production').length,
      completed: orders.filter(o => o.status === 'completed').length
    },
    revenue: { collected: totalRevenue, pending: pendingRevenue },
    inquiries: { new: inquiries.filter(i => i.status === 'new').length, total: inquiries.length },
    inventory: { low_stock: lowStock },
    products: { total: products.length },
    recentOrders, recentInquiries, ordersByStatus
  });
});

module.exports = router;
