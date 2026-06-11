const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'srcreation.json');
const DB_DIR = path.dirname(DB_FILE);
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const adapter = new FileSync(DB_FILE);
const db = low(adapter);

function nextId(collection) {
  const items = db.get(collection).value();
  if (!items.length) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
}
function now() { return new Date().toISOString(); }

db.defaults({ admins:[], products:[], orders:[], inquiries:[], inventory:[], activity_log:[] }).write();

if (!db.get('admins').find({ email: 'admin@srcreation.in' }).value()) {
  db.get('admins').push({ id:1, name:'Super Admin', email:'admin@srcreation.in', password: bcrypt.hashSync('admin@123', 10), role:'superadmin', created_at:now() }).write();
}
if (!db.get('products').value().length) {
  [
    { name:'Classic White Shirt', category:'Formals', fabric:'Cotton 100%', moq:100, price_per_unit:250, stock_available:500 },
    { name:'Women Kurti', category:'Womens Wear', fabric:'Rayon', moq:50, price_per_unit:180, stock_available:300 },
    { name:'Sports T-Shirt', category:'Activewear', fabric:'Polyester', moq:100, price_per_unit:150, stock_available:800 },
    { name:'Formal Trousers', category:'Bottoms', fabric:'Poly-Viscose', moq:50, price_per_unit:350, stock_available:200 },
    { name:'Ethnic Sherwani', category:'Ethnic Wear', fabric:'Silk Blend', moq:20, price_per_unit:1200, stock_available:50 }
  ].forEach((p,i) => db.get('products').push({ id:i+1, ...p, description:'', status:'active', created_at:now(), updated_at:now() }).write());
}
if (!db.get('inventory').value().length) {
  [
    { material_name:'Cotton Fabric', category:'Natural', unit:'meters', quantity_available:2500, minimum_stock:500, supplier:'Arvind Mills', cost_per_unit:45 },
    { material_name:'Polyester', category:'Synthetic', unit:'meters', quantity_available:1800, minimum_stock:300, supplier:'Reliance Textiles', cost_per_unit:28 },
    { material_name:'Rayon', category:'Semi-synthetic', unit:'meters', quantity_available:1200, minimum_stock:200, supplier:'Bombay Dyeing', cost_per_unit:35 },
    { material_name:'Silk Blend', category:'Natural', unit:'meters', quantity_available:400, minimum_stock:100, supplier:'Karnataka Silk', cost_per_unit:180 },
    { material_name:'Denim', category:'Synthetic', unit:'meters', quantity_available:900, minimum_stock:200, supplier:'Aarvee Denims', cost_per_unit:95 },
    { material_name:'Buttons', category:'Accessories', unit:'pieces', quantity_available:15000, minimum_stock:2000, supplier:'Local Supplier', cost_per_unit:0.5 },
    { material_name:'Zippers', category:'Accessories', unit:'pieces', quantity_available:3000, minimum_stock:500, supplier:'YKK India', cost_per_unit:8 },
    { material_name:'Thread', category:'Accessories', unit:'spools', quantity_available:200, minimum_stock:50, supplier:'Local Supplier', cost_per_unit:25 }
  ].forEach((it,i) => db.get('inventory').push({ id:i+1, ...it, last_restocked:now(), created_at:now(), updated_at:now() }).write());
}
if (!db.get('inquiries').value().length) {
  [
    { name:'Rahul Sharma', company:'Fab Fashion', phone:'9876543210', email:'rahul@fabfashion.in', category:'Formals', message:'Need 500 shirts for corporate gifting', status:'new' },
    { name:'Priya Patel', company:'StyleHub', phone:'9845612300', email:'priya@stylehub.com', category:'Womens Wear', message:'Looking for kurti manufacturer MOQ 200', status:'in_progress' },
    { name:'Amit Shah', company:'SportZone', phone:'9712345678', email:'amit@sportzone.in', category:'Activewear', message:'Require 1000 dri-fit t-shirts with logo', status:'quoted' }
  ].forEach((inq,i) => db.get('inquiries').push({ id:i+1, ...inq, notes:'', assigned_to:null, created_at:now(), updated_at:now() }).write());
}
if (!db.get('orders').value().length) {
  [
    { order_number:'SRC-2025-001', client_name:'Rahul Sharma', client_company:'Fab Fashion', client_phone:'9876543210', client_email:'rahul@fabfashion.in', product_name:'Classic White Shirt', category:'Formals', quantity:500, price_per_unit:250, total_amount:125000, status:'in_production', payment_status:'partial', delivery_date:'2025-08-15', fabric:'Cotton', special_instructions:'' },
    { order_number:'SRC-2025-002', client_name:'Priya Patel', client_company:'StyleHub', client_phone:'9845612300', client_email:'priya@stylehub.com', product_name:'Women Kurti', category:'Womens Wear', quantity:200, price_per_unit:180, total_amount:36000, status:'pending', payment_status:'unpaid', delivery_date:'2025-08-30', fabric:'Rayon', special_instructions:'' },
    { order_number:'SRC-2025-003', client_name:'Amit Shah', client_company:'SportZone', client_phone:'9712345678', client_email:'amit@sportzone.in', product_name:'Sports T-Shirt', category:'Activewear', quantity:1000, price_per_unit:150, total_amount:150000, status:'completed', payment_status:'paid', delivery_date:'2025-07-20', fabric:'Polyester', special_instructions:'Logo on left chest' }
  ].forEach((ord,i) => db.get('orders').push({ id:i+1, ...ord, created_at:now(), updated_at:now() }).write());
}

console.log('✅ Database ready');
module.exports = { db, nextId, now };
