const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'srcreation_secret_2025';
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try { const decoded = jwt.verify(token, JWT_SECRET); req.admin = decoded; next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
module.exports = authMiddleware;
