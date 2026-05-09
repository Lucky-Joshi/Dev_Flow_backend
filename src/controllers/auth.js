const jwt = require('jsonwebtoken');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const validEmail    = email    === process.env.ADMIN_EMAIL;
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { sub: 'admin', email: process.env.ADMIN_EMAIL },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME || 'Admin' },
  });
}

module.exports = { login };
