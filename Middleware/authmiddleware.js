const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;  // Attach user info to req
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

function isDeveloper(req, res, next) {
  if (req.user.role !== 'Developer') return res.status(403).json({ msg: 'Access denied, developer only' });
  next();
}

function isManager(req, res, next) {
  if (req.user.role !== 'Manager') return res.status(403).json({ msg: 'Access denied, manager only' });
  next();
}

module.exports = { verifyToken, isDeveloper, isManager };
