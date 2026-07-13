const jwt = require('jsonwebtoken');

// Default admin password - change this!
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'raiyi321';
const JWT_SECRET = process.env.JWT_SECRET || 'lottery-secret-key-2024';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: '令牌无效或已过期' });
  }
}

module.exports = { authMiddleware, ADMIN_PASSWORD, JWT_SECRET };
