const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
const token = req.header('Authorization');
if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const tokenWithoutBearer = token.split(' ')[1];
    const decoded = jwt.verify(tokenWithoutBearer, 'your-secret-key');
  
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
 }
 };

module.exports = verifyToken;