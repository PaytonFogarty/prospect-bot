const jwt = require('jsonwebtoken');
const { getCustomer } = require('../db/customers');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    getCustomer(decoded.id).then(customer => {
      if (!customer) {
        return res.status(401).json({ error: 'Customer not found' });
      }
      const { password_hash, ...safe } = customer;
      req.customer = safe;
      next();
    }).catch(err => {
      console.error('Auth middleware DB error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { verifyToken };
